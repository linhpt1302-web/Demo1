import React from 'react';
import { Member, Tournament } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Award, Users, UserPlus, Flame, Play, Sparkles, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  members: Member[];
  tournaments: Tournament[];
  setActiveTab: (tab: string) => void;
  onOpenJoinModal: () => void;
  onOpenRecordMatchModal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  members,
  tournaments,
  setActiveTab,
  onOpenJoinModal,
  onOpenRecordMatchModal,
}) => {
  const { isAdmin } = useAuth();
  const topPlayer = [...members].sort((a, b) => b.dupr_rating - a.dupr_rating)[0];
  const activeTournament = tournaments.find((t) => t.status !== 'completed') || tournaments[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-pickle-navy to-pickle-dark border border-slate-200/20 dark:border-pickle-border shadow-2xl p-6 sm:p-10 lg:p-12 text-white">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-pickle-lime/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pickle-coral/15 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Grid pattern background */}
      <div className="absolute inset-0 court-grid-pattern opacity-40 pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl space-y-6">
        
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pickle-lime/10 border border-pickle-lime/30 text-xs font-black uppercase tracking-wider text-pickle-lime">
          <Sparkles className="w-4 h-4" />
          <span>CLB PICKLEBALL FRIENDS • HỆ THỐNG ĐẤU ĐÔI 2V2 CHUYÊN NGHIỆP</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.1]">
          Đam Mê. Kết Nối. <br />
          <span className="text-gradient-lime">Nâng Tầm Trình Độ</span> Cùng Friends!
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Chào mừng đến với Câu Lạc Bộ Pickleball <strong>Friends</strong> - Nơi hội tụ các tay vợt đam mê thi đấu đôi, bảng xếp hạng <strong>DUPR & ELO</strong> tự động và giải đấu liên hoàn từ Vòng Bảng đến Chung Kết rực lửa!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {isAdmin && onOpenRecordMatchModal && (
            <button
              onClick={onOpenRecordMatchModal}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-pickle-coral to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-pickle-coral/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Ghi Trận 2v2 Mới (Admin)</span>
            </button>
          )}

          <button
            onClick={onOpenJoinModal}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-pickle-lime to-pickle-400 hover:from-pickle-400 hover:to-pickle-300 text-pickle-dark font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-pickle-lime/25 hover:scale-105 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng Ký Gia Nhập</span>
          </button>

          <button
            onClick={() => setActiveTab('tournaments')}
            className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs sm:text-sm rounded-2xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
          >
            <Trophy className="w-4 h-4 text-pickle-lime" />
            <span>Xem Giải Đấu</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className="flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Bảng Xếp Hạng</span>
          </button>
        </div>

        {/* Live Highlight Cards in Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
          
          {/* Top Ranker Highlight */}
          {topPlayer && (
            <div
              onClick={() => setActiveTab('leaderboard')}
              className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-3.5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="relative">
                <img
                  src={topPlayer.avatar_url}
                  alt={topPlayer.full_name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400"
                />
                <span className="absolute -top-1.5 -right-1.5 text-xs">👑</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                  Top 1 Bảng Xếp Hạng CLB
                </span>
                <h4 className="text-sm font-bold text-white truncate font-display">
                  {topPlayer.full_name} (@{topPlayer.nickname})
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                  <span className="text-pickle-lime font-bold">DUPR {topPlayer.dupr_rating.toFixed(2)}</span>
                  <span>•</span>
                  <span>{topPlayer.elo_points} ELO</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Tournament Highlight */}
          {activeTournament && (
            <div
              onClick={() => setActiveTab('tournaments')}
              className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-3.5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="p-3 bg-pickle-lime/20 text-pickle-lime rounded-xl shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-pickle-lime font-extrabold uppercase tracking-wider block">
                  {activeTournament.status === 'completed' ? 'Giải Vừa Kết Thúc' : 'Giải Đang Diễn Ra'}
                </span>
                <h4 className="text-sm font-bold text-white truncate font-display">
                  {activeTournament.name}
                </h4>
                <p className="text-[11px] text-slate-300">
                  {activeTournament.teams.length} cặp đấu • {activeTournament.num_groups} bảng đấu
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
