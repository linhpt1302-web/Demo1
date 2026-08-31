import React from 'react';
import { ClubSettings, NewsPost } from '../../types';
import { Calendar, Clock, MapPin, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface UpcomingEventsProps {
  settings: ClubSettings;
  latestNews: NewsPost[];
  setActiveTab: (tab: string) => void;
  onOpenJoinModal: () => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  settings,
  latestNews,
  setActiveTab,
  onOpenJoinModal,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Col 1 & 2: Weekly Schedule & Court Info */}
      <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pickle-lime/20 text-pickle-700 dark:text-pickle-lime rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display text-slate-900 dark:text-white">
                Lịch Sinh Hoạt & Giao Lưu Hàng Tuần
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tổ chức chia ca đấu đôi 2v2 và chấm điểm DUPR định kỳ
              </p>
            </div>
          </div>

          <button
            onClick={onOpenJoinModal}
            className="hidden sm:inline-flex text-xs font-bold text-pickle-600 dark:text-pickle-lime hover:underline"
          >
            Đăng ký tham gia ca chơi →
          </button>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-pickle-border space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>📅 Thứ 3, Thứ 5, Thứ 7</span>
              <span className="px-2 py-0.5 rounded bg-pickle-lime/20 text-pickle-700 dark:text-pickle-lime text-[10px]">
                Ca Tối
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 text-pickle-500" />
              <span>18:00 - 21:30 (4 Sân Tiêu Chuẩn)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ghép cặp ngẫu nhiên và đấu xếp hạng ELO nội bộ.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-pickle-border space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>☀️ Sáng Chủ Nhật</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px]">
                Giải Mini & Huấn Luyện
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>07:30 - 11:30 (Giao lưu mở rộng)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tập huấn chiến thuật dinking, drop shot và giải đấu mini King of the Court.
            </p>
          </div>
        </div>

        {/* Location banner */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-pickle-lime/10 border border-pickle-lime/20 text-xs text-slate-800 dark:text-slate-200">
          <MapPin className="w-5 h-5 text-pickle-coral shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-bold block">Địa điểm sân nhà CLB Friends:</span>
            <span className="text-slate-600 dark:text-slate-400 text-[11px]">{settings.location}</span>
          </div>
        </div>
      </div>

      {/* Col 3: Latest News Feed Sidebar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black font-display text-slate-900 dark:text-white">
              Bảng Tin Nổi Bật
            </h3>
            <button
              onClick={() => setActiveTab('news')}
              className="text-xs font-bold text-pickle-600 dark:text-pickle-lime hover:underline"
            >
              Xem tất cả →
            </button>
          </div>

          <div className="space-y-4">
            {latestNews.slice(0, 3).map((post) => (
              <div
                key={post.id}
                onClick={() => setActiveTab('news')}
                className="cursor-pointer group space-y-1 pb-3 border-b border-slate-100 dark:border-pickle-border/60 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono">{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                  <span className="text-pickle-lime font-bold">❤ {post.likes}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-pickle-500 dark:group-hover:text-pickle-lime transition-colors line-clamp-2">
                  {post.title}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* Join Widget CTA */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-pickle-surface to-pickle-navy border border-white/10 text-white space-y-2">
          <div className="flex items-center gap-1.5 text-pickle-lime text-xs font-black uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Tham gia cùng chúng tôi</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Chưa phải là thành viên? Gửi đơn đăng ký online ngay để nhận thẻ số CLB!
          </p>
          <button
            onClick={onOpenJoinModal}
            className="w-full py-2 bg-pickle-lime text-pickle-dark font-black text-xs rounded-xl shadow-md hover:bg-pickle-400 transition-all text-center block mt-2"
          >
            Đăng Ký Thành Viên Ngay
          </button>
        </div>
      </div>
    </div>
  );
};
