import { Tournament, TournamentTeam, Match, Member } from '../types';

/**
 * Generate Round Robin schedule for all groups
 */
export function generateGroupMatches(
  tournamentId: string,
  teams: TournamentTeam[],
  groupNames: string[]
): Match[] {
  const matches: Match[] = [];
  let matchCount = 1;

  for (const group of groupNames) {
    const groupTeams = teams.filter((t) => t.group_id === group);
    if (groupTeams.length < 2) continue;

    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        const team1 = groupTeams[i];
        const team2 = groupTeams[j];

        matches.push({
          id: `match_grp_${tournamentId}_${group}_${matchCount++}`,
          tournament_id: tournamentId,
          tournament_stage: 'group',
          group_name: group,
          match_type: 'tournament',
          team1_player1_id: team1.player1_id,
          team1_player2_id: team1.player2_id,
          team2_player1_id: team2.player1_id,
          team2_player2_id: team2.player2_id,
          team1_name: team1.team_name,
          team2_name: team2.team_name,
          format: '1_set_15', // Vòng bảng đánh 1 set chạm 15
          team1_scores: [],
          team2_scores: [],
          played_at: new Date().toISOString(),
          status: 'scheduled',
        });
      }
    }
  }

  return matches;
}

/**
 * Calculate team statistics & standings in groups
 */
export function calculateGroupStandings(
  teams: TournamentTeam[],
  groupMatches: Match[]
): TournamentTeam[] {
  // Create mutable team map
  const teamMap = new Map<string, TournamentTeam>();
  for (const team of teams) {
    teamMap.set(team.id, {
      ...team,
      stats: {
        matches_played: 0,
        wins: 0,
        losses: 0,
        sets_won: 0,
        sets_lost: 0,
        points_scored: 0,
        points_conceded: 0,
        points_diff: 0,
        group_rank: 1,
      },
    });
  }

  // Find team by player IDs in this tournament
  const findTeamByPlayers = (p1: string, p2: string): TournamentTeam | undefined => {
    return Array.from(teamMap.values()).find(
      (t) => (t.player1_id === p1 && t.player2_id === p2) || (t.player1_id === p2 && t.player2_id === p1)
    );
  };

  // Accumulate stats from completed group matches
  for (const m of groupMatches) {
    if (m.status !== 'completed' || m.tournament_stage !== 'group') continue;

    const team1 = findTeamByPlayers(m.team1_player1_id, m.team1_player2_id);
    const team2 = findTeamByPlayers(m.team2_player1_id, m.team2_player2_id);

    if (!team1 || !team2) continue;

    const t1Pts = m.team1_scores.reduce((a, b) => a + b, 0);
    const t2Pts = m.team2_scores.reduce((a, b) => a + b, 0);
    const isT1Win = m.winner_team === 1;

    team1.stats.matches_played += 1;
    team2.stats.matches_played += 1;
    team1.stats.points_scored += t1Pts;
    team1.stats.points_conceded += t2Pts;
    team1.stats.points_diff = team1.stats.points_scored - team1.stats.points_conceded;

    team2.stats.points_scored += t2Pts;
    team2.stats.points_conceded += t1Pts;
    team2.stats.points_diff = team2.stats.points_scored - team2.stats.points_conceded;

    if (isT1Win) {
      team1.stats.wins += 1;
      team1.stats.sets_won += 1;
      team2.stats.losses += 1;
      team2.stats.sets_lost += 1;
    } else {
      team2.stats.wins += 1;
      team2.stats.sets_won += 1;
      team1.stats.losses += 1;
      team1.stats.sets_lost += 1;
    }
  }

  // Sort and rank within each group
  const groupIds = Array.from(new Set(teams.map((t) => t.group_id).filter(Boolean)));
  const updatedTeams: TournamentTeam[] = [];

  for (const gId of groupIds) {
    const grpTeams = Array.from(teamMap.values()).filter((t) => t.group_id === gId);
    grpTeams.sort((a, b) => {
      // 1. Wins
      if (b.stats.wins !== a.stats.wins) return b.stats.wins - a.stats.wins;
      // 2. Points Diff
      if (b.stats.points_diff !== a.stats.points_diff) return b.stats.points_diff - a.stats.points_diff;
      // 3. Points Scored
      if (b.stats.points_scored !== a.stats.points_scored) return b.stats.points_scored - a.stats.points_scored;
      return 0;
    });

    grpTeams.forEach((t, index) => {
      t.stats.group_rank = index + 1;
      updatedTeams.push(t);
    });
  }

  return updatedTeams;
}

/**
 * Compare third-placed teams across groups when group count is odd or requires ranking
 */
export function getBestThirdPlacedTeams(teams: TournamentTeam[]): TournamentTeam[] {
  const thirdPlaces = teams.filter((t) => t.stats.group_rank === 3);
  return thirdPlaces.sort((a, b) => {
    if (b.stats.wins !== a.stats.wins) return b.stats.wins - a.stats.wins;
    if (b.stats.points_diff !== a.stats.points_diff) return b.stats.points_diff - a.stats.points_diff;
    if (b.stats.points_scored !== a.stats.points_scored) return b.stats.points_scored - a.stats.points_scored;
    return 0;
  });
}

/**
 * Select top 8 teams for the Quarterfinals based on number of groups
 */
export function selectQuarterfinalists(teams: TournamentTeam[], numGroups: number): TournamentTeam[] {
  const sortedByGroup = (gId: string) =>
    teams.filter((t) => t.group_id === gId).sort((a, b) => (a.stats.group_rank || 1) - (b.stats.group_rank || 1));

  if (numGroups === 1) {
    return [...teams].sort((a, b) => (a.stats.group_rank || 1) - (b.stats.group_rank || 1)).slice(0, 8);
  }

  if (numGroups === 2) {
    // Top 4 from A and Top 4 from B
    const grpA = sortedByGroup('A');
    const grpB = sortedByGroup('B');
    return [
      grpA[0], grpB[3], // QF1: A1 vs B4
      grpA[1], grpB[2], // QF2: A2 vs B3
      grpB[0], grpA[3], // QF3: B1 vs A4
      grpB[1], grpA[2], // QF4: B2 vs A3
    ].filter(Boolean);
  }

  if (numGroups === 3) {
    // 3 Groups: Top 2 from each (6 teams) + Top 2 Best 3rd place teams (2 teams) = 8 teams
    const grpA = sortedByGroup('A');
    const grpB = sortedByGroup('B');
    const grpC = sortedByGroup('C');
    const best3rd = getBestThirdPlacedTeams(teams).slice(0, 2);

    const qualified = [
      grpA[0], grpA[1],
      grpB[0], grpB[1],
      grpC[0], grpC[1],
      ...best3rd,
    ].filter(Boolean);

    return qualified;
  }

  if (numGroups === 4) {
    // 4 Groups: Top 2 from each group (8 teams)
    const grpA = sortedByGroup('A');
    const grpB = sortedByGroup('B');
    const grpC = sortedByGroup('C');
    const grpD = sortedByGroup('D');

    return [
      grpA[0], grpC[1], // QF1: A1 vs C2
      grpB[0], grpD[1], // QF2: B1 vs D2
      grpC[0], grpA[1], // QF3: C1 vs A2
      grpD[0], grpB[1], // QF4: D1 vs B2
    ].filter(Boolean);
  }

  // 5 to 10 Groups: Group 1st places + best 2nd/3rd placed teams to fill 8 teams
  const firstPlaces = teams.filter((t) => t.stats.group_rank === 1);
  const secondPlaces = teams
    .filter((t) => t.stats.group_rank === 2)
    .sort((a, b) => b.stats.wins - a.stats.wins || b.stats.points_diff - a.stats.points_diff);
  const thirdPlaces = getBestThirdPlacedTeams(teams);

  const pool = [...firstPlaces, ...secondPlaces, ...thirdPlaces];
  return pool.slice(0, 8);
}

/**
 * Generate Quarterfinal bracket matches (1 set chạm 15)
 */
export function generateQuarterfinals(tournamentId: string, qualifiedTeams: TournamentTeam[]): Match[] {
  const qfMatches: Match[] = [];
  const pairings = [
    { slot: 'QF1', t1: qualifiedTeams[0], t2: qualifiedTeams[7] || qualifiedTeams[1] },
    { slot: 'QF2', t1: qualifiedTeams[3], t2: qualifiedTeams[4] || qualifiedTeams[2] },
    { slot: 'QF3', t1: qualifiedTeams[1], t2: qualifiedTeams[6] || qualifiedTeams[3] },
    { slot: 'QF4', t1: qualifiedTeams[2], t2: qualifiedTeams[5] || qualifiedTeams[0] },
  ];

  pairings.forEach((p, idx) => {
    qfMatches.push({
      id: `match_qf_${tournamentId}_${idx + 1}`,
      tournament_id: tournamentId,
      tournament_stage: 'quarter',
      bracket_slot: p.slot,
      match_type: 'tournament',
      team1_player1_id: p.t1?.player1_id || '',
      team1_player2_id: p.t1?.player2_id || '',
      team2_player1_id: p.t2?.player1_id || '',
      team2_player2_id: p.t2?.player2_id || '',
      team1_name: p.t1?.team_name || 'Đội 1',
      team2_name: p.t2?.team_name || 'Đội 2',
      format: '1_set_15', // Tứ kết đánh 1 set chạm 15
      team1_scores: [],
      team2_scores: [],
      played_at: new Date().toISOString(),
      status: 'scheduled',
    });
  });

  return qfMatches;
}

/**
 * Update Semifinals & Finals after match result updates
 */
export function updateKnockoutProgression(
  tournament: Tournament,
  allMembers: Member[]
): {
  tournament: Tournament;
  newChampionBadge?: { playerIds: string[]; badge: string };
} {
  const updated = { ...tournament };
  if (!updated.knockout_matches) return { tournament: updated };

  const { quarterfinals, semifinals, final, bronze } = updated.knockout_matches;

  // Find team helper
  const getWinnerTeamFromMatch = (m: Match): { p1: string; p2: string; name: string } | null => {
    if (m.status !== 'completed' || !m.winner_team) return null;
    if (m.winner_team === 1) {
      return { p1: m.team1_player1_id, p2: m.team1_player2_id, name: m.team1_name || '' };
    }
    return { p1: m.team2_player1_id, p2: m.team2_player2_id, name: m.team2_name || '' };
  };

  const getLoserTeamFromMatch = (m: Match): { p1: string; p2: string; name: string } | null => {
    if (m.status !== 'completed' || !m.winner_team) return null;
    if (m.winner_team === 1) {
      return { p1: m.team2_player1_id, p2: m.team2_player2_id, name: m.team2_name || '' };
    }
    return { p1: m.team1_player1_id, p2: m.team1_player2_id, name: m.team1_name || '' };
  };

  // Update SF1: Winner QF1 vs Winner QF2 (1 set chạm 15)
  const qf1Win = getWinnerTeamFromMatch(quarterfinals[0]);
  const qf2Win = getWinnerTeamFromMatch(quarterfinals[1]);

  if (semifinals && semifinals[0]) {
    if (qf1Win) {
      semifinals[0].team1_player1_id = qf1Win.p1;
      semifinals[0].team1_player2_id = qf1Win.p2;
      semifinals[0].team1_name = qf1Win.name;
    }
    if (qf2Win) {
      semifinals[0].team2_player1_id = qf2Win.p1;
      semifinals[0].team2_player2_id = qf2Win.p2;
      semifinals[0].team2_name = qf2Win.name;
    }
    semifinals[0].format = '1_set_15'; // Bán kết 1 set chạm 15
  }

  // Update SF2: Winner QF3 vs Winner QF4 (1 set chạm 15)
  const qf3Win = getWinnerTeamFromMatch(quarterfinals[2]);
  const qf4Win = getWinnerTeamFromMatch(quarterfinals[3]);

  if (semifinals && semifinals[1]) {
    if (qf3Win) {
      semifinals[1].team1_player1_id = qf3Win.p1;
      semifinals[1].team1_player2_id = qf3Win.p2;
      semifinals[1].team1_name = qf3Win.name;
    }
    if (qf4Win) {
      semifinals[1].team2_player1_id = qf4Win.p1;
      semifinals[1].team2_player2_id = qf4Win.p2;
      semifinals[1].team2_name = qf4Win.name;
    }
    semifinals[1].format = '1_set_15'; // Bán kết 1 set chạm 15
  }

  // Update FINAL: Winner SF1 vs Winner SF2 (3 set chạm 11)
  const sf1Win = semifinals && semifinals[0] ? getWinnerTeamFromMatch(semifinals[0]) : null;
  const sf2Win = semifinals && semifinals[1] ? getWinnerTeamFromMatch(semifinals[1]) : null;

  if (final) {
    if (sf1Win) {
      final.team1_player1_id = sf1Win.p1;
      final.team1_player2_id = sf1Win.p2;
      final.team1_name = sf1Win.name;
    }
    if (sf2Win) {
      final.team2_player1_id = sf2Win.p1;
      final.team2_player2_id = sf2Win.p2;
      final.team2_name = sf2Win.name;
    }
    final.format = '3_sets_11'; // Chung kết đánh 3 set chạm 11!
  }

  // Update Bronze match: Loser SF1 vs Loser SF2
  const sf1Lose = semifinals && semifinals[0] ? getLoserTeamFromMatch(semifinals[0]) : null;
  const sf2Lose = semifinals && semifinals[1] ? getLoserTeamFromMatch(semifinals[1]) : null;
  if (bronze && sf1Lose && sf2Lose) {
    bronze.team1_player1_id = sf1Lose.p1;
    bronze.team1_player2_id = sf1Lose.p2;
    bronze.team1_name = sf1Lose.name;
    bronze.team2_player1_id = sf2Lose.p1;
    bronze.team2_player2_id = sf2Lose.p2;
    bronze.team2_name = sf2Lose.name;
    bronze.format = '1_set_15';
  }

  // If Final is completed -> Determine Champion!
  let newChampionBadge: { playerIds: string[]; badge: string } | undefined = undefined;

  if (final && final.status === 'completed' && final.winner_team) {
    const finalWinner = getWinnerTeamFromMatch(final);
    const finalLoser = getLoserTeamFromMatch(final);

    if (finalWinner) {
      const champTeam = updated.teams.find(
        (t) => (t.player1_id === finalWinner.p1 && t.player2_id === finalWinner.p2) ||
               (t.player1_id === finalWinner.p2 && t.player2_id === finalWinner.p1)
      );
      if (champTeam) {
        updated.champion_team = champTeam;
      }
      updated.status = 'completed';
      newChampionBadge = {
        playerIds: [finalWinner.p1, finalWinner.p2],
        badge: `🏆 Vô địch ${updated.name}`,
      };
    }

    if (finalLoser) {
      const runnerTeam = updated.teams.find(
        (t) => (t.player1_id === finalLoser.p1 && t.player2_id === finalLoser.p2) ||
               (t.player1_id === finalLoser.p2 && t.player2_id === finalLoser.p1)
      );
      if (runnerTeam) {
        updated.runner_up_team = runnerTeam;
      }
    }
  }

  return { tournament: updated, newChampionBadge };
}
