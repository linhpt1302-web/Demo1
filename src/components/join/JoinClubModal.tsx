import React, { useState } from 'react';
import { JoinRequest } from '../../types';
import { X, UserPlus, Sparkles, CheckCircle2, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface JoinClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (request: JoinRequest) => void;
}

export const JoinClubModal: React.FC<JoinClubModalProps> = ({
  isOpen,
  onClose,
  onSubmitRequest,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [zaloFb, setZaloFb] = useState('');
  const [selfRating, setSelfRating] = useState<number>(3.0);
  const [experience, setExperience] = useState('6 tháng - 1 năm');
  const [preferredHand, setPreferredHand] = useState('Tay phải');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    const newRequest: JoinRequest = {
      id: `req_${Date.now()}`,
      full_name: fullName,
      phone,
      zalo_fb: zaloFb,
      self_rating: selfRating,
      experience_years: experience,
      preferred_hand: preferredHand,
      message: message || 'Rất mong được gia nhập CLB Friends để cùng tập luyện và thi đấu!',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    onSubmitRequest(newRequest);
    setIsSuccess(true);

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-pickle-card rounded-3xl shadow-2xl border border-slate-200 dark:border-pickle-border max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white">
              Gửi Đơn Thành Công! 🎉
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Cảm ơn <strong>{fullName}</strong> đã quan tâm và gửi đơn gia nhập CLB Pickleball Friends. Ban Chủ Nhiệm sẽ liên hệ qua số điện thoại <strong>{phone}</strong> trong vòng 24 giờ để xếp lịch test trình độ và sinh hoạt!
            </p>
            <div className="pt-4">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-pickle-lime text-pickle-dark font-bold text-xs rounded-xl shadow-lg shadow-pickle-lime/20"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-pickle-lime/20 text-pickle-lime rounded-2xl">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black font-display text-slate-900 dark:text-white">
                  Đăng Ký Gia Nhập CLB Friends
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Giao lưu, nâng hạng DUPR và tham gia các giải đấu đôi hấp dẫn
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và Tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pickle-lime"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số Điện Thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xx.xxx.xxx"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pickle-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link Zalo / Facebook (Nếu có)
                  </label>
                  <input
                    type="text"
                    value={zaloFb}
                    onChange={(e) => setZaloFb(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kinh Nghiệm Chơi
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Mới bắt đầu (< 3 tháng)">Mới bắt đầu (&lt; 3 tháng)</option>
                    <option value="3 - 6 tháng">3 - 6 tháng</option>
                    <option value="6 tháng - 1 năm">6 tháng - 1 năm</option>
                    <option value="1 - 2 năm">1 - 2 năm</option>
                    <option value="Trên 2 năm (Kinh nghiệm)">Trên 2 năm (Kinh nghiệm)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Trình độ tự đánh giá (DUPR: {selfRating.toFixed(1)})
                  </label>
                  <input
                    type="range"
                    min="2.0"
                    max="5.0"
                    step="0.1"
                    value={selfRating}
                    onChange={(e) => setSelfRating(parseFloat(e.target.value))}
                    className="w-full accent-pickle-lime cursor-pointer mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>2.0 (Mới chơi)</span>
                    <span>3.5 (Khá)</span>
                    <span>5.0 (Pro)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tay Thuận
                  </label>
                  <select
                    value={preferredHand}
                    onChange={(e) => setPreferredHand(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Tay phải">Tay phải</option>
                    <option value="Tay trái">Tay trái</option>
                    <option value="Cả 2 tay">Cả 2 tay</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lời Nhắn / Nguyện Vọng
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Chia sẻ thời gian bạn rảnh trong tuần, mục tiêu khi tham gia CLB..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-pickle-border">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold bg-pickle-lime text-pickle-dark hover:bg-pickle-400 rounded-xl shadow-lg shadow-pickle-lime/20 transition-all hover:scale-105"
                >
                  Gửi Đơn Xin Gia Nhập
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
