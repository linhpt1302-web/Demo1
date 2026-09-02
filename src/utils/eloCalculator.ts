import { Member, Match, EloDeltaInfo } from '../types';

/**
 * Calculates Expected Win Probability using the classic ELO formula
 * Ra: Average Team 1 ELO, Rb: Average Team 2 ELO
 */
export function getExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Maps ELO points directly to DUPR Rating (1000 ELO = 3.00 DUPR, +/- 100 ELO = +/- 0.25 DUPR)
 */
export function eloToDupr(elo: number): number {
  const safeElo = Number(elo) || 1000;
  const dupr = 3.0 + (safeElo - 1000) * 0.0025;
  return Math.max(2.0, Math.min(6.0, Math.round(dupr * 100) / 100));
}

/**
 * Maps DUPR Rating to ELO points
 */
export function duprToElo(dupr: number): number {
  const safeDupr = Number(dupr) || 3.0;
  return Math.round(1000 + (safeDupr - 3.0) * 400);
}

/**
 * Computes 2v2 ELO Delta and updates all 4 members
 * @param team1Player1 First member of Team 1
 * @param team1Player2 Second member of Team 1
 * @param team2Player1 First member of Team 2
 * @param team2Player2 Second member of Team 2
 * @param winnerTeam 1 if Team 1 won, 2 if Team 2 won
 * @param team1Scores Optional scores of Team 1
 * @param team2Scores Optional scores of Team 2
 * @param isRanking True if ranking match (affects ELO & DUPR), false for casual (only stats)
 * @param kFactor ELO sensitivity constant (default 32)
 */
export function calculate2v2Elo(
  team1Player1: Member,
  team1Player2: Member,
  team2Player1: Member,
  team2Player2: Member,
  winnerTeam: 1 | 2,
  team1Scores?: number[],
  team2Scores?: number[],
  isRanking: boolean = true,
  kFactor: number = 32
): {
  eloChanges: EloDeltaInfo[];
  updatedMembers: Member[];
} {
  const p1Elo = Number(team1Player1.elo_points) || 1000;
  const p2Elo = Number(team1Player2.elo_points) || 1000;
  const p3Elo = Number(team2Player1.elo_points) || 1000;
  const p4Elo = Number(team2Player2.elo_points) || 1000;

  const team1Avg = (p1Elo + p2Elo) / 2;
  const team2Avg = (p3Elo + p4Elo) / 2;

  const expected1 = getExpectedScore(team1Avg, team2Avg);
  const expected2 = 1 - expected1;

  let finalT1Delta = 0;
  let finalT2Delta = 0;

  if (isRanking) {
    // Point difference margin multiplier (optional booster for blowout wins)
    let marginMultiplier = 1.0;
    if (team1Scores && team2Scores && team1Scores.length > 0 && team2Scores.length > 0) {
      const t1Total = team1Scores.reduce((a, b) => a + b, 0);
      const t2Total = team2Scores.reduce((a, b) => a + b, 0);
      const diff = Math.abs(t1Total - t2Total);
      if (diff >= 10) marginMultiplier = 1.2;
      else if (diff >= 6) marginMultiplier = 1.1;
    }

    if (winnerTeam === 1) {
      const delta = Math.max(2, Math.round(kFactor * (1 - expected1) * marginMultiplier));
      finalT1Delta = delta;
      finalT2Delta = -delta;
    } else {
      const delta = Math.max(2, Math.round(kFactor * (1 - expected2) * marginMultiplier));
      finalT1Delta = -delta;
      finalT2Delta = delta;
    }
  }

  const updatePlayer = (player: Member, delta: number, isWin: boolean): Member => {
    const oldElo = Number(player.elo_points) || 1000;
    const newElo = Math.max(500, oldElo + delta);
    const newDupr = eloToDupr(newElo);
    const played = (Number(player.matches_played) || 0) + 1;
    const won = (Number(player.matches_won) || 0) + (isWin ? 1 : 0);
    const lost = (Number(player.matches_lost) || 0) + (isWin ? 0 : 1);
    
    let streak = Number(player.current_streak) || 0;
    if (isWin) {
      streak = streak >= 0 ? streak + 1 : 1;
    } else {
      streak = streak <= 0 ? streak - 1 : -1;
    }

    return {
      ...player,
      elo_points: newElo,
      dupr_rating: newDupr,
      matches_played: played,
      matches_won: won,
      matches_lost: lost,
      current_streak: streak,
    };
  };

  const p1Updated = updatePlayer(team1Player1, finalT1Delta, winnerTeam === 1);
  const p2Updated = updatePlayer(team1Player2, finalT1Delta, winnerTeam === 1);
  const p3Updated = updatePlayer(team2Player1, finalT2Delta, winnerTeam === 2);
  const p4Updated = updatePlayer(team2Player2, finalT2Delta, winnerTeam === 2);

  const eloChanges: EloDeltaInfo[] = [
    {
      player_id: team1Player1.id,
      elo_delta: finalT1Delta,
      old_elo: p1Elo,
      new_elo: p1Updated.elo_points,
    },
    {
      player_id: team1Player2.id,
      elo_delta: finalT1Delta,
      old_elo: p2Elo,
      new_elo: p2Updated.elo_points,
    },
    {
      player_id: team2Player1.id,
      elo_delta: finalT2Delta,
      old_elo: p3Elo,
      new_elo: p3Updated.elo_points,
    },
    {
      player_id: team2Player2.id,
      elo_delta: finalT2Delta,
      old_elo: p4Elo,
      new_elo: p4Updated.elo_points,
    },
  ];

  return {
    eloChanges,
    updatedMembers: [p1Updated, p2Updated, p3Updated, p4Updated],
  };
}

/**
 * Rollback ELO and match statistics (Played, Won, Lost, Win-rate, Streaks) when a match or tournament is deleted
 */
export function rollbackMatchElo(match: Match, members: Member[]): Member[] {
  if (match.status !== 'completed') {
    return members;
  }

  const memberMap = new Map<string, Member>(members.map((m) => [m.id, { ...m }]));
  const isWinnerTeam1 = match.winner_team === 1;

  // 1. Identify all 4 player IDs from match
  const team1PlayerIds = [match.team1_player1_id, match.team1_player2_id].filter(Boolean);
  const team2PlayerIds = [match.team2_player1_id, match.team2_player2_id].filter(Boolean);
  const allPlayerIds = Array.from(new Set([...team1PlayerIds, ...team2PlayerIds]));

  // 2. Rollback win/loss/matches_played counts for all participating players
  for (const playerId of allPlayerIds) {
    const member = memberMap.get(playerId);
    if (member) {
      const isTeam1 = team1PlayerIds.includes(playerId);
      const wasWinner = isTeam1 ? isWinnerTeam1 : !isWinnerTeam1;

      // Decrement matches played (min 0)
      member.matches_played = Math.max(0, (Number(member.matches_played) || 1) - 1);

      if (wasWinner) {
        // Decrement matches won (min 0)
        member.matches_won = Math.max(0, (Number(member.matches_won) || 1) - 1);
        // If current streak > 0, decrement streak
        if ((Number(member.current_streak) || 0) > 0) {
          member.current_streak = Math.max(0, (Number(member.current_streak) || 1) - 1);
        }
      } else {
        // Decrement matches lost (min 0)
        member.matches_lost = Math.max(0, (Number(member.matches_lost) || 1) - 1);
        // If current streak < 0, adjust streak towards 0
        if ((Number(member.current_streak) || 0) < 0) {
          member.current_streak = Math.min(0, (Number(member.current_streak) || -1) + 1);
        }
      }

      memberMap.set(member.id, member);
    }
  }

  // 3. Rollback ELO and DUPR if elo_changes exist
  if (match.elo_changes && match.elo_changes.length > 0) {
    for (const change of match.elo_changes) {
      const member = memberMap.get(change.player_id);
      if (member) {
        const rolledBackElo = Math.max(500, (Number(member.elo_points) || 1000) - change.elo_delta);
        const dupr = eloToDupr(rolledBackElo);

        member.elo_points = rolledBackElo;
        member.dupr_rating = dupr;
        memberMap.set(member.id, member);
      }
    }
  }

  return Array.from(memberMap.values());
}

/**
 * Recalculates all member statistics and ELO ratings chronologically from raw match history
 * Useful to repair any historical data corruption or ensure 100% data consistency.
 */
export function recalculateAllMemberStats(
  members: Member[],
  matches: Match[],
  initialEloMap?: Record<string, number>
): {
  recalculatedMembers: Member[];
  recalculatedMatches: Match[];
} {
  // 1. Reset all members to baseline stats (0 played, 0 won, 0 lost, 0 streak, initial ELO/DUPR)
  const memberMap = new Map<string, Member>();
  for (const m of members) {
    const baseElo = initialEloMap && initialEloMap[m.id] ? initialEloMap[m.id] : (Number(m.elo_points) || 1000);
    memberMap.set(m.id, {
      ...m,
      elo_points: baseElo,
      dupr_rating: eloToDupr(baseElo),
      matches_played: 0,
      matches_won: 0,
      matches_lost: 0,
      current_streak: 0,
    });
  }

  // 2. Sort completed matches in chronological order (oldest to newest)
  const sortedMatches = [...matches]
    .filter((m) => m.status === 'completed')
    .sort((a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime());

  const recalculatedMatches: Match[] = [];

  // 3. Replay each match step-by-step
  for (const match of sortedMatches) {
    const p1 = memberMap.get(match.team1_player1_id);
    const p2 = memberMap.get(match.team1_player2_id);
    const p3 = memberMap.get(match.team2_player1_id);
    const p4 = memberMap.get(match.team2_player2_id);

    if (!p1 || !p2 || !p3 || !p4) {
      recalculatedMatches.push(match);
      continue;
    }

    const isRanking = match.match_type !== 'casual';
    const winnerTeam: 1 | 2 = match.winner_team === 2 ? 2 : 1;
    const result = calculate2v2Elo(
      p1,
      p2,
      p3,
      p4,
      winnerTeam,
      match.team1_scores,
      match.team2_scores,
      isRanking
    );

    // Update map with new member stats
    for (const u of result.updatedMembers) {
      memberMap.set(u.id, u);
    }

    // Update match elo_changes
    recalculatedMatches.push({
      ...match,
      elo_changes: isRanking ? result.eloChanges : undefined,
    });
  }

  return {
    recalculatedMembers: Array.from(memberMap.values()),
    recalculatedMatches,
  };
}
