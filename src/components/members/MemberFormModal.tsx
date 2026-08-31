import React, { useState, useEffect } from 'react';
import { Member } from '../../types';
import { AvatarPickerModal } from './AvatarPickerModal';
import { X, User, Phone, Shield, Sparkles, Award, Zap, RefreshCw, Camera } from 'lucide-react';

interface MemberFormModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => void;
}

// Formula: 1000 ELO = 3.00 DUPR, every 100 ELO = +0.25 DUPR
const convertEloToDupr = (elo: number): number => {
  const dupr = 3.0 + (elo - 1000) * 0.0025;
  return Math.max(2.0, Math.min(6.0, Math.round(dupr * 100) / 100));
};

const convertDuprToElo = (dupr: number): number => {
  return Math.round(1000 + (dupr - 3.0) * 400);
};

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  member,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Member>>({
    full_name: '',
    nickname: '',
    avatar_url: '',
    phone: '',
    dupr_rating: 3.25,
    elo_points: 1100,
    role: 'member',
    hand: 'right',
    paddle: 'Joola Perseus 3S 16mm',
    preferred_side: 'flexible',
    badges: [],
    bio: '',
  });

  const [badgeInput, setBadgeInput] = useState('');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData(member);
    } else {
      setFormData({
        full_name: '',
        nickname: '',
        avatar_url: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&q=80&w=400`,
        phone: '',
        dupr_rating: 3.25,
        elo_points: 1100,
        role: 'member',
        hand: 'right',
        paddle: 'Joola Perseus 3S 16mm',
        preferred_side: 'flexible',
        badges: ['🌱 Thành Viên CLB'],
        bio: '',
      });
    }
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleEloChange = (newEloVal: number) => {
    const validElo = isNaN(newEloVal) ? 1000 : newEloVal;
    const computedDupr = convertEloToDupr(validElo);
    setFormData((prev) => ({
      ...prev,
      elo_points: validElo,
      dupr_rating: computedDupr,
    }));
  };

  const handleDuprChange = (newDuprVal: number) => {
    const validDupr = isNaN(newDuprVal) ? 3.0 : newDuprVal;
    const computedElo = convertDuprToElo(validDupr);
    setFormData((prev) => ({
      ...prev,
      dupr_rating: validDupr,
      elo_points: computedElo,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name) return;

    const savedMember: Member = {
      id: member ? member.id : `m_${Date.now()}`,
      full_name: formData.full_name || '',
      nickname: formData.nickname || formData.full_name?.split(' ').pop() || 'Pickler',
      avatar_url:
        formData.avatar_url ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formData.full_name || 'user')}`,
      phone: formData.phone || '',
      dupr_rating: Number(formData.dupr_rating) || 3.0,
      elo_points: Number(formData.elo_points) || 1000,
      role: formData.role || 'member',
      hand: formData.hand || 'right',
      paddle: formData.paddle || 'Joola Perseus 3S',
      preferred_side: formData.preferred_side || 'flexible',
      join_date: member ? member.join_date : new Date().toISOString().split('T')[0],
      matches_played: member ? member.matches_played : 0,
      matches_won: member ? member.matches_won : 0,
      matches_lost: member ? member.matches_lost : 0,
      current_streak: member ? member.current_streak : 0,
      badges: formData.badges || [],
      bio: formData.bio || '',
    };

    onSave(savedMember);
    onClose();
  };

  const handleAddBadge = () => {
    if (badgeInput.trim() && !formData.badges?.includes(badgeInput.trim())) {
      setFormData({
        ...formData,
        badges: [...(formData.badges || []), badgeInput.trim()],
      });
      setBadgeInput('');
    }
  };

  const handleRemoveBadge = (badgeToRemove: string) => {
    setFormData({
      ...formData,
      badges: formData.badges?.filter((b) => b !== badgeToRemove),
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg p-6 bg-white dark:bg-pickle-card rounded-3xl shadow-2xl border border-slate-200 dark:border-pickle-border max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-pickle-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-pickle-lime/20 text-pickle-500 dark:text-pickle-lime rounded-2xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {member ? 'Chỉnh Sửa Hồ Sơ Thành Viên' : 'Thêm Thành Viên Mới'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nhập điểm ELO để hệ thống tự động quy đổi DUPR Rating chuẩn quốc tế
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Họ và Tên *
              </label>
              <input
                type="text"
                required
                value={formData.full_name || ''}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="VD: Hoàng Mạnh Cường"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-pickle-surface text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-pickle-lime outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Nickname / Biệt Danh
              </label>
              <input
                type="text"
                value={formData.nickname || ''}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="VD: Cường Chủ Tịch"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-pickle-surface text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-pickle-lime outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Số Điện Thoại / Zalo
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0988.xxx.xxx"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-pickle-surface text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-pickle-lime outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Ảnh Đại Diện (Avatar)
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="relative group cursor-pointer shrink-0"
                  title="Nhấp để đổi avatar"
                >
                  <img
                    src={formData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt="Avatar"
                    className="w-11 h-11 rounded-xl object-cover border-2 border-pickle-lime shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-pickle-surface hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-pickle-border transition-colors truncate"
                >
                  <Camera className="w-3.5 h-3.5 text-pickle-500 shrink-0" />
                  <span>Chọn / Tải Ảnh Đại Diện</span>
                </button>
              </div>
            </div>
          </div>

          {/* ELO & DUPR Automatic Synchronous Conversion Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pickle-lime/10 via-emerald-500/10 to-indigo-500/10 border border-pickle-lime/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-pickle-700 dark:text-pickle-lime">
                <Zap className="w-4 h-4" />
                <span>Quy Đổi Tự Động: ELO ⇄ DUPR Rating</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">Chuẩn CLB Friends</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* ELO Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Điểm ELO CLB
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="10"
                    min="500"
                    max="3000"
                    value={formData.elo_points || ''}
                    onChange={(e) => handleEloChange(parseInt(e.target.value, 10))}
                    placeholder="1000"
                    className="w-full px-3.5 py-2 rounded-xl border border-pickle-lime/50 bg-white dark:bg-pickle-surface text-slate-900 dark:text-white text-base font-bold font-mono focus:ring-2 focus:ring-pickle-lime outline-none shadow-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">ELO</span>
                </div>
              </div>

              {/* DUPR Rating Output / Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                  DUPR Rating Tương Ứng
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="2.0"
                    max="6.0"
                    value={formData.dupr_rating || ''}
                    onChange={(e) => handleDuprChange(parseFloat(e.target.value))}
                    placeholder="3.00"
                    className="w-full px-3.5 py-2 rounded-xl border border-pickle-lime/50 bg-white dark:bg-pickle-surface text-pickle-600 dark:text-pickle-lime text-base font-extrabold font-mono focus:ring-2 focus:ring-pickle-lime outline-none shadow-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-pickle-500">DUPR</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
              💡 Khi bạn nhập điểm ELO (VD: 1000, 1050, 1100, 1150), hệ thống sẽ tự động tính ra DUPR Rating (3.00, 3.13, 3.25, 3.38).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Vai Trò
              </label>
              <select
                value={formData.role || 'member'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'member' })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-pickle-surface text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-pickle-lime outline-none"
              >
                <option value="member">Thành Viên</option>
                <option value="admin">Ban Chủ Nhiệm (Admin)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Tay Thuận
              </label>
              <select
                value={formData.hand || 'right'}
                onChange={(e) => setFormData({ ...formData, hand: e.target.value as 'right' | 'left' | 'both' })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-pickle-surface text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-pickle-lime outline-none"
              >
                <option value="right">Tay Phải</option>
                <option value="left">Tay Trái</option>
                <option value="both">Cả 2 Tay</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Vợt Đang Dùng (Paddle)
            </label>
            <input
              type="text"
              value={formData.paddle || ''}
              onChange={(e) => setFormData({ ...formData, paddle: e.target.value })}
              placeholder="VD: Joola Perseus 3S 16mm / Selkirk Vanguard"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-pickle-surface text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-pickle-lime outline-none"
            />
          </div>

          {/* Badges Manager */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Huy Hiệu & Danh Hiệu
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={badgeInput}
                onChange={(e) => setBadgeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBadge();
                  }
                }}
                placeholder="VD: 👑 Chủ Tịch CLB, ⚡ Vua Smash..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-pickle-surface text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-pickle-lime outline-none"
              />
              <button
                type="button"
                onClick={handleAddBadge}
                className="px-3.5 py-2 bg-slate-100 dark:bg-pickle-surface hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                + Thêm
              </button>
            </div>

            {formData.badges && formData.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-pickle-surface/60 border border-slate-200 dark:border-pickle-border">
                {formData.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-pickle-card border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-sm"
                  >
                    <span>{badge}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBadge(badge)}
                      className="text-slate-400 hover:text-rose-500 font-black ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Giới Thiệu Ngắn (Bio)
            </label>
            <textarea
              rows={2}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Sở trường thi đấu, phương châm rèn luyện..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-pickle-surface text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-pickle-lime outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-pickle-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-pickle-500 to-pickle-lime text-pickle-dark hover:from-pickle-400 hover:to-pickle-300 shadow-lg shadow-pickle-lime/20 transition-all hover:scale-105 active:scale-95"
            >
              {member ? 'Lưu Thay Đổi' : 'Thêm Thành Viên'}
            </button>
          </div>
        </form>

        {/* Nested Avatar Picker Modal */}
        <AvatarPickerModal
          isOpen={isAvatarPickerOpen}
          onClose={() => setIsAvatarPickerOpen(false)}
          currentAvatar={formData.avatar_url || ''}
          onSelectAvatar={(newUrl) => {
            setFormData((prev) => ({ ...prev, avatar_url: newUrl }));
          }}
        />
      </div>
    </div>
  );
};
