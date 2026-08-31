import React from 'react';
import { Member } from '../../types';
import { QrCode, Trophy, Flame, Edit3, Trash2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MemberCardProps {
  member: Member;
  onOpenCard: (member: Member) => void;
  onEdit?: (member: Member) => void;
  onDelete?: (id: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onOpenCard,
  onEdit,
  onDelete,
}) => {
  const { isAdmin } = useAuth();

  const winRate =
    member.matches_played > 0
      ? Math.round((member.matches_won / member.matches_played) * 100)
      : 0;

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border p-5 hover:border-pickle-lime/50 dark:hover:border-pickle-lime/50 transition-all hover:shadow-xl hover:shadow-pickle-lime/10 flex flex-col justify-between">
      {/* Top Bar: Role badge & QR button */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            {member.role === 'admin' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase">
                <Shield className="w-3 h-3" />
                BCH CLB
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-pickle-surface text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                Thành Viên
              </span>
            )}
            {member.current_streak >= 3 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                <Flame className="w-3 h-3" />
                W{member.current_streak}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenCard(member)}
              title="Xem Thẻ Số & QR Code"
              className="p-1.5 text-slate-400 hover:text-pickle-lime hover:bg-slate-100 dark:hover:bg-pickle-surface rounded-lg transition-colors"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {isAdmin && onEdit && (
              <button
                onClick={() => onEdit(member)}
                title="Chỉnh sửa thông tin"
                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-pickle-surface rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {isAdmin && onDelete && (
              <button
                onClick={() => onDelete(member.id)}
                title="Xóa thành viên"
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-pickle-surface rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Member Avatar & Details */}
        <div className="flex items-center gap-3.5 mb-4">
          <div
            onClick={() => {
              if (isAdmin && onEdit) {
                onEdit(member);
              } else {
                onOpenCard(member);
              }
            }}
            title={isAdmin ? 'Nhấp để đổi avatar hoặc sửa thông tin' : 'Xem thẻ số'}
            className="relative cursor-pointer group/avatar shrink-0"
          >
            <img
              src={member.avatar_url}
              alt={member.full_name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 dark:border-pickle-border group-hover:border-pickle-lime transition-all group-hover/avatar:scale-105"
            />
            {isAdmin && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-pickle-lime text-pickle-dark font-extrabold text-[9px] uppercase shadow z-10">
              {member.hand === 'left' ? 'L' : 'R'}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base text-slate-900 dark:text-white truncate font-display group-hover:text-pickle-500 dark:group-hover:text-pickle-lime transition-colors">
              {member.full_name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              @{member.nickname}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
              🏓 {member.paddle || 'Chưa cập nhật vợt'}
            </p>
          </div>
        </div>

        {/* DUPR & ELO Stats pill */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-100 dark:border-pickle-border/60 text-center mb-3">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">DUPR</span>
            <span className="text-sm font-extrabold text-pickle-600 dark:text-pickle-lime font-display">
              {member.dupr_rating.toFixed(2)}
            </span>
          </div>
          <div className="border-x border-slate-200 dark:border-pickle-border/80">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">ELO</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-display">
              {member.elo_points}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">THẮNG</span>
            <span className="text-sm font-extrabold text-amber-500 font-display">
              {winRate}%
            </span>
          </div>
        </div>

        {/* Badges preview */}
        {member.badges && member.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {member.badges.slice(0, 2).map((badge, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pickle-lime/10 text-pickle-600 dark:text-pickle-lime border border-pickle-lime/20 truncate max-w-[140px]"
              >
                {badge}
              </span>
            ))}
            {member.badges.length > 2 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-pickle-surface text-slate-400">
                +{member.badges.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: View Digital Pass CTA */}
      <div className="pt-3 border-t border-slate-100 dark:border-pickle-border/60 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          {member.matches_won}W - {member.matches_lost}L ({member.matches_played} trận)
        </span>
        <button
          onClick={() => onOpenCard(member)}
          className="text-xs font-bold text-pickle-600 dark:text-pickle-lime hover:underline flex items-center gap-1"
        >
          <span>Thẻ số QR</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
