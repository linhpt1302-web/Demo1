import React from 'react';
import { TournamentTeam } from '../../types';
import { getBestThirdPlacedTeams } from '../../utils/tournamentEngine';
import { Award, CheckCircle2, ShieldAlert } from 'lucide-react';

interface BestThirdPlaceTableProps {
  teams: TournamentTeam[];
  numQualifiedSlots: number; // typically 2 teams for 3 groups
}

export const BestThirdPlaceTable: React.FC<BestThirdPlaceTableProps> = ({
  teams,
  numQualifiedSlots = 2,
}) => {
  const thirdPlaceTeams = getBestThirdPlacedTeams(teams);

  if (thirdPlaceTeams.length === 0) return null;

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-pickle-lime" />
          <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white uppercase tracking-wider">
            Bảng So Sánh Các Đội Xếp Thứ 3 Tốt Nhất
          </h4>
        </div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          Lấy Top <span className="text-pickle-600 dark:text-pickle-lime">{numQualifiedSlots}</span> đội vào Tứ Kết
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-pickle-surface text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <tr>
              <th className="py-2.5 px-3 text-center">Hạng</th>
              <th className="py-2.5 px-3">Cặp VĐV</th>
              <th className="py-2.5 px-2 text-center">Bảng</th>
              <th className="py-2.5 px-2 text-center">Trận Thắng</th>
              <th className="py-2.5 px-2 text-center">Hiệu Số Điểm</th>
              <th className="py-2.5 px-2 text-center">Điểm Ghi Được</th>
              <th className="py-2.5 px-3 text-center">Tình Trạng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-pickle-border/60">
            {thirdPlaceTeams.map((team, idx) => {
              const isQualified = idx < numQualifiedSlots;
              return (
                <tr
                  key={team.id}
                  className={`transition-colors ${
                    isQualified
                      ? 'bg-pickle-lime/5 dark:bg-pickle-lime/10'
                      : 'hover:bg-slate-50 dark:hover:bg-pickle-surface/40'
                  }`}
                >
                  <td className="py-3 px-3 text-center font-bold font-mono">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {team.team_name}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-pickle-lime">
                    Bảng {team.group_id}
                  </td>
                  <td className="py-3 px-2 text-center font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    {team.stats.wins}W - {team.stats.losses}L
                  </td>
                  <td className="py-3 px-2 text-center font-extrabold font-mono">
                    <span className={team.stats.points_diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                      {team.stats.points_diff > 0 ? `+${team.stats.points_diff}` : team.stats.points_diff}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-slate-600 dark:text-slate-300 font-mono">
                    {team.stats.points_scored}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {isQualified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Vào Tứ Kết
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-pickle-surface text-slate-500 font-semibold text-[10px]">
                        Dừng bước
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
