import React, { useState } from 'react';
import { Tournament, Match, Member } from '../../types';
import { GroupStageView } from './GroupStageView';
import { KnockoutTree } from './KnockoutTree';
import { MatchScoreModal } from './MatchScoreModal';
import { DeleteTournamentModal } from './DeleteTournamentModal';
import {
  calculateGroupStandings,
  selectQuarterfinalists,
  generateQuarterfinals,
  updateKnockoutProgression,
} from '../../utils/tournamentEngine';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { getMemberAvatar, handleAvatarError } from '../../utils/avatarHelper';
import {
  Trophy,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  Trash2,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface TournamentDetailProps {
  tournament: Tournament;
  members: Member[];
  onBack: () => void;
  onUpdateTournament: (tournament: Tournament) => void;
  onDeleteTournament: (tournamentId: string, rollbackElo: boolean) => void;
  onSaveMemberBatch: (members: Member[]) => void;
}

export const TournamentDetail: React.FC<TournamentDetailProps> = ({
  tournament,
  members,
  onBack,
  onUpdateTournament,
  onDeleteTournament,
  onSaveMemberBatch,
}) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'groups' | 'knockout' | 'teams'>(
    tournament.status === 'knockout' || tournament.status === 'completed' ? 'knockout' : 'groups'
  );

  const [activeMatchForScore, setActiveMatchForScore] = useState<Match | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Handle Match Score submission
  const handleSaveScore = (updatedMatch: Match, updatedMembers: Member[]) => {
    let updatedTour = { ...tournament };

    if (updatedMatch.tournament_stage === 'group') {
      // Update in group_matches
      updatedTour.group_matches = updatedTour.group_matches.map((m) =>
        m.id === updatedMatch.id ? updatedMatch : m
      );

      // Recalculate group standings
      updatedTour.teams = calculateGroupStandings(
        updatedTour.teams,
        updatedTour.group_matches
      );
    } else if (updatedTour.knockout_matches) {
      const km = { ...updatedTour.knockout_matches };
      if (updatedMatch.tournament_stage === 'quarter') {
        km.quarterfinals = km.quarterfinals.map((m) =>
          m.id === updatedMatch.id ? updatedMatch : m
        );
      } else if (updatedMatch.tournament_stage === 'semi') {
        km.semifinals = km.semifinals.map((m) =>
          m.id === updatedMatch.id ? updatedMatch : m
        );
      } else if (updatedMatch.tournament_stage === 'final') {
        km.final = updatedMatch;
      } else if (updatedMatch.tournament_stage === 'bronze' && km.bronze) {
        km.bronze = updatedMatch;
      }

      updatedTour.knockout_matches = km;

      // Automatically advance teams in Semifinals / Finals / Champion!
      const progression = updateKnockoutProgression(updatedTour, members);
      updatedTour = progression.tournament;

      // If new champion badge awarded, add badge to the champion players
      if (progression.newChampionBadge) {
        const { playerIds, badge } = progression.newChampionBadge;
        const playersToUpdate = members.filter((m) => playerIds.includes(m.id));
        const updatedBadgedMembers = playersToUpdate.map((m) => ({
          ...m,
          badges: m.badges.includes(badge) ? m.badges : [badge, ...m.badges],
        }));
        onSaveMemberBatch(updatedBadgedMembers);
      }
    }

    // Save updated members ELO/DUPR and match atomically
    dataService.saveMatch(updatedMatch, updatedMembers);

    onUpdateTournament(updatedTour);
  };

  // Admin action: Advance to Knockout stage
  const handleAdvanceToKnockout = () => {
    // 1. Calculate latest group standings
    const rankedTeams = calculateGroupStandings(
      tournament.teams,
      tournament.group_matches
    );

    // 2. Select top 8 teams (with best 3rd place teams if odd group count)
    const quarterfinalists = selectQuarterfinalists(
      rankedTeams,
      tournament.num_groups
    );

    if (quarterfinalists.length < 4) {
      alert('Không đủ số đội để tạo vòng Tứ Kết!');
      return;
    }

    // 3. Generate Quarterfinal matches (1 set chạm 15)
    const qfMatches = generateQuarterfinals(tournament.id, quarterfinalists);

    // 4. Initialize empty Semifinals (1 set chạm 15) & Finals (3 sets chạm 11)
    const sfMatches: Match[] = [
      {
        id: `match_sf_${tournament.id}_1`,
        tournament_id: tournament.id,
        tournament_stage: 'semi',
        bracket_slot: 'SF1',
        match_type: 'tournament',
        team1_player1_id: '',
        team1_player2_id: '',
        team2_player1_id: '',
        team2_player2_id: '',
        team1_name: 'Thắng Tứ Kết 1',
        team2_name: 'Thắng Tứ Kết 2',
        format: '1_set_15', // Bán kết 1 set chạm 15
        team1_scores: [],
        team2_scores: [],
        played_at: new Date().toISOString(),
        status: 'scheduled',
      },
      {
        id: `match_sf_${tournament.id}_2`,
        tournament_id: tournament.id,
        tournament_stage: 'semi',
        bracket_slot: 'SF2',
        match_type: 'tournament',
        team1_player1_id: '',
        team1_player2_id: '',
        team2_player1_id: '',
        team2_player2_id: '',
        team1_name: 'Thắng Tứ Kết 3',
        team2_name: 'Thắng Tứ Kết 4',
        format: '1_set_15', // Bán kết 1 set chạm 15
        team1_scores: [],
        team2_scores: [],
        played_at: new Date().toISOString(),
        status: 'scheduled',
      },
    ];

    const finalMatch: Match = {
      id: `match_final_${tournament.id}`,
      tournament_id: tournament.id,
      tournament_stage: 'final',
      bracket_slot: 'FINAL',
      match_type: 'tournament',
      team1_player1_id: '',
      team1_player2_id: '',
      team2_player1_id: '',
      team2_player2_id: '',
      team1_name: 'Thắng Bán Kết 1',
      team2_name: 'Thắng Bán Kết 2',
      format: '3_sets_11', // Chung kết 3 set chạm 11 (Bo3)!
      team1_scores: [],
      team2_scores: [],
      played_at: new Date().toISOString(),
      status: 'scheduled',
    };

    const bronzeMatch: Match = {
      id: `match_bronze_${tournament.id}`,
      tournament_id: tournament.id,
      tournament_stage: 'bronze',
      bracket_slot: 'BRONZE',
      match_type: 'tournament',
      team1_player1_id: '',
      team1_player2_id: '',
      team2_player1_id: '',
      team2_player2_id: '',
      team1_name: 'Thua Bán Kết 1',
      team2_name: 'Thua Bán Kết 2',
      format: '1_set_15',
      team1_scores: [],
      team2_scores: [],
      played_at: new Date().toISOString(),
      status: 'scheduled',
    };

    const updatedTour: Tournament = {
      ...tournament,
      status: 'knockout',
      teams: rankedTeams,
      knockout_matches: {
        quarterfinals: qfMatches,
        semifinals: sfMatches,
        final: finalMatch,
        bronze: bronzeMatch,
      },
    };

    onUpdateTournament(updatedTour);
    setActiveTab('knockout');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Bar with Back Button & Delete Tournament */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-pickle-lime transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh Sách Giải Đấu</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-600 border border-rose-500/30 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa Giải Đấu & Hoàn Trả ELO</span>
          </button>
        )}
      </div>

      {/* Tournament Banner Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-pickle-border shadow-xl">
        <img
          src={tournament.banner_url}
          alt={tournament.name}
          className="w-full h-56 sm:h-72 object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-pickle-lime text-pickle-dark text-xs font-black uppercase shadow">
              {tournament.status === 'completed'
                ? '🏆 ĐÃ KẾT THÚC'
                : tournament.status === 'knockout'
                ? '⚡ VÒNG TRỰC TIẾP'
                : '🎾 VÒNG BẢNG'}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold backdrop-blur-md">
              {tournament.num_groups} Bảng Đấu ({tournament.teams.length} Cặp)
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight mb-2">
            {tournament.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mb-4 line-clamp-2">
            {tournament.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-pickle-lime" />
              {tournament.start_date} $\rightarrow$ {tournament.end_date}
            </span>
            <span>•</span>
            <span className="text-pickle-lime font-bold">1 Set 15 (Bảng/Tứ Kết) & Bo3 11 (Chung Kết)</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-pickle-border pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'groups'
              ? 'bg-pickle-lime text-pickle-dark shadow-md shadow-pickle-lime/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-pickle-card'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Vòng Bảng (1-10 Bảng)</span>
        </button>

        <button
          onClick={() => setActiveTab('knockout')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'knockout'
              ? 'bg-pickle-lime text-pickle-dark shadow-md shadow-pickle-lime/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-pickle-card'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Sơ Đồ Knockout (Tứ Kết $\rightarrow$ Chung Kết)</span>
          {tournament.knockout_matches && (
            <span className="w-2 h-2 rounded-full bg-pickle-coral animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'teams'
              ? 'bg-pickle-lime text-pickle-dark shadow-md shadow-pickle-lime/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-pickle-card'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh Sách Cặp Đấu ({tournament.teams.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'groups' && (
        <GroupStageView
          tournament={tournament}
          members={members}
          onOpenMatchScore={(m) => setActiveMatchForScore(m)}
          onAdvanceToKnockout={handleAdvanceToKnockout}
        />
      )}

      {activeTab === 'knockout' && (
        <KnockoutTree
          tournament={tournament}
          members={members}
          onOpenMatchScore={(m) => setActiveMatchForScore(m)}
        />
      )}

      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tournament.teams.map((team) => {
            const p1 = members.find((m) => m.id === team.player1_id);
            const p2 = members.find((m) => m.id === team.player2_id);
            return (
              <div
                key={team.id}
                className="p-4 rounded-2xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-pickle-lime/20 text-pickle-700 dark:text-pickle-lime text-[10px] font-black uppercase">
                    Bảng {team.group_id || 'A'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Hạt giống #{team.seed || 1}</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {team.team_name}
                </h4>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-pickle-border/60">
                  <div className="flex items-center gap-2">
                    <img
                      src={getMemberAvatar(p1?.avatar_url, p1?.full_name)}
                      alt=""
                      onError={(e) => handleAvatarError(e, p1?.full_name)}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{p1?.full_name}</span>
                    <span className="text-[10px] text-pickle-500 font-mono ml-auto">DUPR {p1?.dupr_rating.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <img
                      src={getMemberAvatar(p2?.avatar_url, p2?.full_name)}
                      alt=""
                      onError={(e) => handleAvatarError(e, p2?.full_name)}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{p2?.full_name}</span>
                    <span className="text-[10px] text-pickle-500 font-mono ml-auto">DUPR {p2?.dupr_rating.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Match Score Modal */}
      <MatchScoreModal
        isOpen={Boolean(activeMatchForScore)}
        onClose={() => setActiveMatchForScore(null)}
        match={activeMatchForScore}
        members={members}
        onSaveScore={handleSaveScore}
      />

      {/* Delete Tournament Modal */}
      <DeleteTournamentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        tournament={tournament}
        onConfirmDelete={onDeleteTournament}
      />
    </div>
  );
};
