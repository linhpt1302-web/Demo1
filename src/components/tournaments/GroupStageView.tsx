import React, { useState } from 'react';
import { Tournament, TournamentTeam, Match, Member } from '../../types';
import { BestThirdPlaceTable } from './BestThirdPlaceTable';
import { useAuth } from '../../context/AuthContext';
import {
  Trophy,
  CheckCircle,
  Play,
  Calendar,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface GroupStageViewProps {
  tournament: Tournament;
  members: Member[];
  onOpenMatchScore: (match: Match) => void;
  onAdvanceToKnockout: () => void;
}

export const GroupStageView: React.FC<GroupStageViewProps> = ({
  tournament,
  members,
  onOpenMatchScore,
  onAdvanceToKnockout,
}) => {
  const { isAdmin } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  const groupNames = tournament.group_names || ['A', 'B'];
  const allGroupMatchesCompleted =
    tournament.group_matches.length > 0 &&
    tournament.group_matches.every((m) => m.status === 'completed');

  const displayedGroups =
    selectedGroup === 'all'
      ? groupNames
      : groupNames.filter((g) => g === selectedGroup);

  return (
    <div className="space-y-8">
      {/* Advance to Knockout Banner */}
      {tournament.status === 'group_stage' && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-pickle-surface via-pickle-card to-pickle-surface border-2 border-pickle-lime/40 shadow-xl shadow-pickle-lime/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-pickle-lime text-pickle-dark rounded-2xl shadow-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black font-display text-white">
                Giai Đoạn Vòng Bảng (1 Set Chạm 15 Điểm)
              </h4>
              <p className="text-xs text-slate-300">
                {allGroupMatchesCompleted
                  ? '🎉 Toàn bộ trận đấu vòng bảng đã hoàn tất! Sẵn sàng chuyển tiếp vào vòng Tứ Kết.'
                  : `Đã thi đấu ${tournament.group_matches.filter((m) => m.status === 'completed').length}/${tournament.group_matches.length} trận.`}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={onAdvanceToKnockout}
              className="flex items-center gap-2 px-5 py-3 bg-pickle-lime hover:bg-pickle-400 text-pickle-dark font-extrabold text-xs rounded-2xl shadow-lg shadow-pickle-lime/25 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tiến Vào Vòng Tứ Kết</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Group Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedGroup('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedGroup === 'all'
              ? 'bg-pickle-lime text-pickle-dark shadow-sm'
              : 'bg-white dark:bg-pickle-card text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-pickle-border hover:bg-slate-50'
          }`}
        >
          Tất Cả ({groupNames.length} Bảng)
        </button>
        {groupNames.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGroup(g)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedGroup === g
                ? 'bg-pickle-lime text-pickle-dark shadow-sm'
                : 'bg-white dark:bg-pickle-card text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-pickle-border hover:bg-slate-50'
            }`}
          >
            Bảng {g}
          </button>
        ))}
      </div>

      {/* Group Tables & Matches Grid */}
      <div className="space-y-8">
        {displayedGroups.map((group) => {
          const groupTeams = tournament.teams
            .filter((t) => t.group_id === group)
            .sort((a, b) => (a.stats.group_rank || 1) - (b.stats.group_rank || 1));

          const groupMatches = tournament.group_matches.filter((m) => m.group_name === group);

          return (
            <div
              key={group}
              className="p-6 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm space-y-5"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-pickle-border/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pickle-lime/20 text-pickle-700 dark:text-pickle-lime font-black font-display flex items-center justify-center text-sm">
                    {group}
                  </div>
                  <h3 className="text-base font-black font-display text-slate-900 dark:text-white">
                    BẢNG ĐẤU {group}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {groupTeams.length} cặp đấu • 1 set chạm 15
                </span>
              </div>

              {/* Standings Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-pickle-surface text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 text-center">Hạng</th>
                      <th className="py-2.5 px-3">Cặp VĐV</th>
                      <th className="py-2.5 px-2 text-center">Trận</th>
                      <th className="py-2.5 px-2 text-center">Thắng</th>
                      <th className="py-2.5 px-2 text-center">Thua</th>
                      <th className="py-2.5 px-2 text-center">Điểm Ghi</th>
                      <th className="py-2.5 px-2 text-center">Điểm Thủng</th>
                      <th className="py-2.5 px-2 text-center">Hiệu Số</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-pickle-border/60">
                    {groupTeams.map((team, idx) => {
                      const isTop2 = (team.stats.group_rank || 1) <= 2;
                      const isTop3 = (team.stats.group_rank || 1) === 3;
                      return (
                        <tr
                          key={team.id}
                          className={`transition-colors ${
                            isTop2
                              ? 'bg-pickle-lime/5 dark:bg-pickle-lime/10 font-medium'
                              : isTop3
                              ? 'bg-amber-500/5 dark:bg-amber-500/10'
                              : 'hover:bg-slate-50 dark:hover:bg-pickle-surface/40'
                          }`}
                        >
                          <td className="py-3 px-3 text-center font-bold font-mono">
                            {idx === 0 ? '🟢 1' : idx === 1 ? '🟢 2' : idx === 2 ? '🟡 3' : idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {team.team_name}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center font-mono">{team.stats.matches_played}</td>
                          <td className="py-3 px-2 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {team.stats.wins}
                          </td>
                          <td className="py-3 px-2 text-center font-semibold text-rose-500 font-mono">
                            {team.stats.losses}
                          </td>
                          <td className="py-3 px-2 text-center font-mono">{team.stats.points_scored}</td>
                          <td className="py-3 px-2 text-center font-mono">{team.stats.points_conceded}</td>
                          <td className="py-3 px-2 text-center font-black font-mono">
                            <span className={team.stats.points_diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                              {team.stats.points_diff > 0 ? `+${team.stats.points_diff}` : team.stats.points_diff}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Group Matches Schedule */}
              <div className="pt-3 border-t border-slate-100 dark:border-pickle-border/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                  Lịch Thi Đấu Bảng {group}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupMatches.map((m) => {
                    const isDone = m.status === 'completed';
                    const isT1Win = m.winner_team === 1;

                    return (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          isDone
                            ? 'bg-slate-50 dark:bg-pickle-surface/60 border-slate-200 dark:border-pickle-border'
                            : 'bg-white dark:bg-pickle-surface/30 border-dashed border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className={`truncate font-semibold ${isDone && isT1Win ? 'text-pickle-600 dark:text-pickle-lime font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                              {m.team1_name || 'Cặp 1'}
                            </span>
                            <span className="font-mono font-bold ml-2">
                              {isDone ? m.team1_scores[0] : '-'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className={`truncate font-semibold ${isDone && !isT1Win ? 'text-pickle-coral font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                              {m.team2_name || 'Cặp 2'}
                            </span>
                            <span className="font-mono font-bold ml-2">
                              {isDone ? m.team2_scores[0] : '-'}
                            </span>
                          </div>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => onOpenMatchScore(m)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                              isDone
                                ? 'bg-slate-200 dark:bg-pickle-card hover:bg-pickle-lime hover:text-pickle-dark text-slate-700 dark:text-slate-300'
                                : 'bg-pickle-lime text-pickle-dark hover:bg-pickle-400 shadow-sm'
                            }`}
                          >
                            {isDone ? 'Sửa điểm' : 'Nhập điểm'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Special Best 3rd Place Comparison Table if odd group count */}
      {tournament.num_groups % 2 !== 0 && tournament.num_groups > 1 && (
        <BestThirdPlaceTable teams={tournament.teams} numQualifiedSlots={tournament.num_groups === 3 ? 2 : 1} />
      )}
    </div>
  );
};
