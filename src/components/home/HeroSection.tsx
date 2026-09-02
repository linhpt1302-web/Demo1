import React from 'react';
import { Member, Tournament } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getMemberAvatar, handleAvatarError } from '../../utils/avatarHelper';
import { Trophy, Award, UserPlus, Sparkles, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  members: Member[];
  tournaments: Tournament[];
  setActiveTab: (tab: string) => void;
  onOpenJoinModal: () => void;
  onOpenRecordMatchModal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  members,
  tournaments: _tournaments,
  setActiveTab,
  onOpenJoinModal,
  onOpenRecordMatchModal,
}) => {
  const { isAdmin } = useAuth();

  // Sort members for Top 1, Top 2, Top 3 ranking
  const sortedMembers = [...members].sort((a, b) => {
    if (b.elo_points !== a.elo_points) return b.elo_points - a.elo_points;
    if (b.dupr_rating !== a.dupr_rating) return b.dupr_rating - a.dupr_rating;
    return (b.matches_won || 0) - (a.matches_won || 0);
  });

  const top1 = sortedMembers[0];
  const top2 = sortedMembers[1];
  const top3 = sortedMembers[2];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-pickle-navy to-pickle-dark border border-slate-200/20 dark:border-pickle-border shadow-2xl p-6 sm:p-10 lg:p-12 text-white">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-pickle-lime/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pickle-coral/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Grid pattern background */}
      <div className="absolute inset-0 court-grid-pattern opacity-40 pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl space-y-6">
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
            onClick={() => setActiveTab('leaderboard')}
            className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs sm:text-sm rounded-2xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Bảng Xếp Hạng DUPR/ELO</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveTab('tournaments')}
            className="flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Award className="w-4 h-4 text-pickle-lime" />
            <span>Giải Đấu</span>
          </button>
        </div>

        {/* Live Top 3 Leaderboard Section in Hero */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Top 3 Vợt Thủ Dẫn Đầu Bảng Xếp Hạng CLB
              </span>
            </div>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="text-xs font-bold text-pickle-lime hover:underline flex items-center gap-1"
            >
              <span>Xem Toàn Bộ BXH ({members.length} VĐV)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Top 1 (Gold) */}
            {top1 && (
              <div
                onClick={() => setActiveTab('leaderboard')}
                className="relative p-3.5 rounded-2xl bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-transparent border border-amber-400/50 hover:border-amber-400 flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-amber-500/10 group"
              >
                <div className="relative shrink-0">
                  <img
                    src={getMemberAvatar(top1.avatar_url, top1.full_name)}
                    alt={top1.full_name}
                    onError={(e) => handleAvatarError(e, top1.full_name)}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-amber-400 text-pickle-dark font-black text-[9px] shadow flex items-center gap-0.5">
                    <span>👑</span>
                    <span>#1</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                    🥇 Top 1 CLB
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate font-display group-hover:text-amber-300 transition-colors">
                    {top1.full_name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-300 font-mono mt-0.5">
                    <span className="text-amber-400 font-extrabold">{top1.elo_points} ELO</span>
                    <span>•</span>
                    <span className="text-pickle-lime font-bold">DUPR {top1.dupr_rating.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Top 2 (Silver) */}
            {top2 && (
              <div
                onClick={() => setActiveTab('leaderboard')}
                className="relative p-3.5 rounded-2xl bg-gradient-to-b from-slate-300/20 via-slate-300/10 to-transparent border border-slate-300/40 hover:border-slate-200 flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-slate-500/10 group"
              >
                <div className="relative shrink-0">
                  <img
                    src={getMemberAvatar(top2.avatar_url, top2.full_name)}
                    alt={top2.full_name}
                    onError={(e) => handleAvatarError(e, top2.full_name)}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-slate-300 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-slate-300 text-slate-900 font-black text-[9px] shadow flex items-center gap-0.5">
                    <span>🥈</span>
                    <span>#2</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider block">
                    🥈 Top 2 CLB
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate font-display group-hover:text-slate-200 transition-colors">
                    {top2.full_name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-300 font-mono mt-0.5">
                    <span className="text-slate-200 font-extrabold">{top2.elo_points} ELO</span>
                    <span>•</span>
                    <span className="text-pickle-lime font-bold">DUPR {top2.dupr_rating.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Top 3 (Bronze) */}
            {top3 && (
              <div
                onClick={() => setActiveTab('leaderboard')}
                className="relative p-3.5 rounded-2xl bg-gradient-to-b from-orange-500/20 via-orange-500/10 to-transparent border border-orange-400/40 hover:border-orange-300 flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-orange-500/10 group"
              >
                <div className="relative shrink-0">
                  <img
                    src={getMemberAvatar(top3.avatar_url, top3.full_name)}
                    alt={top3.full_name}
                    onError={(e) => handleAvatarError(e, top3.full_name)}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-orange-400 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-orange-400 text-pickle-dark font-black text-[9px] shadow flex items-center gap-0.5">
                    <span>🥉</span>
                    <span>#3</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wider block">
                    🥉 Top 3 CLB
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate font-display group-hover:text-orange-300 transition-colors">
                    {top3.full_name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-300 font-mono mt-0.5">
                    <span className="text-orange-300 font-extrabold">{top3.elo_points} ELO</span>
                    <span>•</span>
                    <span className="text-pickle-lime font-bold">DUPR {top3.dupr_rating.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
