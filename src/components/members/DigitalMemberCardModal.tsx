import React, { useEffect, useState, useRef } from 'react';
import { Member } from '../../types';
import { PickleLogo } from '../common/PickleLogo';
import { getMemberAvatar, handleAvatarError } from '../../utils/avatarHelper';
import { X, Flame, Zap, Sparkles, Check } from 'lucide-react';
import QRCode from 'qrcode';

interface DigitalMemberCardModalProps {
  member: Member | null;
  onClose: () => void;
}

export const DigitalMemberCardModal: React.FC<DigitalMemberCardModalProps> = ({ member, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (member) {
      const profileUrl = `${window.location.origin}/#member-${member.id}`;
      QRCode.toDataURL(profileUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#070B14',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR:', err));
    }
  }, [member]);

  if (!member) return null;

  const winRate =
    (Number(member.matches_played) || 0) > 0
      ? Math.round(((Number(member.matches_won) || 0) / Number(member.matches_played)) * 100)
      : 0;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#member-${member.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm"
      >
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          title="Đóng thẻ số (Phím ESC)"
          className="absolute -top-11 right-0 p-2 text-white/80 hover:text-white bg-white/15 hover:bg-white/25 rounded-full transition-all flex items-center gap-1.5 px-3 text-xs font-semibold backdrop-blur-md shadow-lg"
        >
          <X className="w-4 h-4" />
          <span>Đóng (ESC)</span>
        </button>

        {/* Digital Member Card Container */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-pickle-navy to-pickle-dark border-2 border-pickle-lime/40 shadow-2xl shadow-pickle-lime/20 text-white p-6 transition-all"
        >
          {/* Internal Corner Close Button */}
          <button
            onClick={onClose}
            title="Đóng"
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Card Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-pickle-lime/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pickle-coral/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
          
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5 pr-8">
            <div className="flex items-center gap-2.5">
              <PickleLogo size="sm" showGlow={false} />
              <div>
                <span className="text-xs font-black font-display tracking-widest text-pickle-lime block">
                  FRIENDS PICKLEBALL
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  Official Digital Pass
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pickle-lime/15 border border-pickle-lime/30 text-[11px] font-bold text-pickle-lime">
              <Sparkles className="w-3 h-3" />
              <span>{member.role === 'admin' ? 'BCH CLB' : 'Thành Viên'}</span>
            </div>
          </div>

          {/* Member Main Info */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <img
                src={getMemberAvatar(member.avatar_url, member.full_name)}
                alt={member.full_name}
                onError={(e) => handleAvatarError(e, member.full_name)}
                className="w-18 h-18 rounded-2xl object-cover border-2 border-pickle-lime shadow-lg"
              />
              <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-pickle-coral text-white font-extrabold text-[10px] shadow">
                {member.hand === 'left' ? 'Tay Trái' : 'Tay Phải'}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold font-display text-white truncate leading-tight">
                {member.full_name}
              </h3>
              <p className="text-xs text-pickle-lime font-semibold truncate mb-1">
                @{member.nickname}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                  🏓 {member.paddle || 'Joola Perseus'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mb-5 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">DUPR RATING</span>
              <span className="text-base font-black text-pickle-lime font-display">
                {Number(member.dupr_rating || 3.0).toFixed(2)}
              </span>
            </div>
            <div className="border-x border-white/10">
              <span className="text-[10px] text-slate-400 block font-medium">ĐIỂM ELO</span>
              <span className="text-base font-black text-white font-display">
                {member.elo_points || 1000}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">TỈ LỆ THẮNG</span>
              <span className="text-base font-black text-amber-400 font-display">
                {winRate}%
              </span>
            </div>
          </div>

          {/* Streak & Record */}
          <div className="flex items-center justify-between text-xs px-1 mb-4 text-slate-300">
            <div className="flex items-center gap-1.5">
              <Flame className={`w-4 h-4 ${(Number(member.current_streak) || 0) > 0 ? 'text-pickle-coral animate-pulse' : 'text-slate-500'}`} />
              <span className="font-semibold">
                Chuỗi: {(Number(member.current_streak) || 0) > 0 ? `🔥 Thắng ${member.current_streak}` : (Number(member.current_streak) || 0) < 0 ? `Thua ${Math.abs(member.current_streak)}` : '0'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {member.matches_won || 0}W - {member.matches_lost || 0}L ({member.matches_played || 0} trận)
            </div>
          </div>

          {/* Badges List */}
          {member.badges && member.badges.length > 0 && (
            <div className="mb-5">
              <div className="flex flex-wrap gap-1.5">
                {member.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gradient-to-r from-pickle-lime/10 to-amber-400/10 border border-pickle-lime/20 text-pickle-lime"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* QR Code Section */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-[10px] text-slate-400 space-y-0.5">
              <p className="font-mono text-slate-300">ID: {member.id.toUpperCase()}</p>
              <p>Ngày vào: {member.join_date}</p>
              <p className="text-pickle-lime/80 font-medium">Quét để xem hồ sơ trực tuyến</p>
            </div>

            {qrDataUrl && (
              <div className="p-1.5 bg-white rounded-xl shadow-md">
                <img src={qrDataUrl} alt="Member QR" className="w-16 h-16" />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons below card */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã Sao Chép Link</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-pickle-lime" />
                <span>Sao Chép Link Thẻ</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-pickle-lime text-pickle-dark hover:bg-pickle-400 text-xs font-black shadow-lg shadow-pickle-lime/20 transition-all active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
            <span>Đóng Thẻ</span>
          </button>
        </div>

      </div>
    </div>
  );
};
