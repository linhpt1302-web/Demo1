import React from 'react';
import { Member, Tournament, Match } from '../../types';
import { Users, Trophy, Award, Flame, Zap, ShieldCheck } from 'lucide-react';

interface QuickStatsProps {
  members: Member[];
  tournaments: Tournament[];
  matches: Match[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  members,
  tournaments,
  matches,
}) => {
  const avgDupr =
    members.length > 0
      ? (members.reduce((acc, m) => acc + m.dupr_rating, 0) / members.length).toFixed(2)
      : '3.50';

  const proCount = members.filter((m) => m.dupr_rating >= 4.0).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Stat 1: Members */}
      <div className="p-5 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm flex items-center gap-4">
        <div className="p-3.5 bg-pickle-lime/15 text-pickle-600 dark:text-pickle-lime rounded-2xl">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Thành Viên Chính Thức
          </span>
          <span className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {members.length}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            {proCount} tay vợt ≥ 4.0 DUPR
          </span>
        </div>
      </div>

      {/* Stat 2: Avg DUPR */}
      <div className="p-5 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm flex items-center gap-4">
        <div className="p-3.5 bg-amber-500/15 text-amber-500 rounded-2xl">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            DUPR Trung Bình CLB
          </span>
          <span className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {avgDupr}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold block">
            Chuẩn USAPA Rating
          </span>
        </div>
      </div>

      {/* Stat 3: 2v2 Matches */}
      <div className="p-5 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm flex items-center gap-4">
        <div className="p-3.5 bg-pickle-coral/15 text-pickle-coral rounded-2xl">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Trận Đấu Đôi 2v2
          </span>
          <span className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {matches.length}
          </span>
          <span className="text-[10px] text-pickle-coral font-semibold block">
            Cập nhật ELO tức thì
          </span>
        </div>
      </div>

      {/* Stat 4: Tournaments */}
      <div className="p-5 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm flex items-center gap-4">
        <div className="p-3.5 bg-indigo-500/15 text-indigo-500 rounded-2xl">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Giải Đấu Cup Friends
          </span>
          <span className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {tournaments.length}
          </span>
          <span className="text-[10px] text-indigo-500 font-semibold block">
            Sơ đồ cây Knockout & Bảng
          </span>
        </div>
      </div>
    </div>
  );
};
