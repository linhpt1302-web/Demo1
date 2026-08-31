import React from 'react';
import { ClubSettings } from '../../types';
import { PickleLogo } from '../common/PickleLogo';
import { MapPin, Clock, Phone, MessageCircle, Heart } from 'lucide-react';

interface FooterProps {
  settings: ClubSettings;
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, setActiveTab }) => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-pickle-border bg-slate-100 dark:bg-pickle-navy/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <PickleLogo size="md" />
              <span className="font-extrabold font-display text-lg text-slate-900 dark:text-white tracking-tight">
                {settings.club_name}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              {settings.slogan} - Nơi quy tụ những người đam mê môn thể thao Pickleball, cùng chia sẻ niềm vui vận động, rèn luyện kỹ thuật và tranh tài các giải đấu đôi 2v2 kịch tính.
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pickle-coral shrink-0" />
                <span>{settings.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-pickle-lime shrink-0" />
                <span>{settings.play_schedule}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Khám Phá CLB
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setActiveTab('members')} className="hover:text-pickle-lime transition-colors">
                  Danh Sách Thành Viên & Thẻ Số
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('leaderboard')} className="hover:text-pickle-lime transition-colors">
                  Bảng Xếp Hạng DUPR / ELO
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('tournaments')} className="hover:text-pickle-lime transition-colors">
                  Giải Đấu Đôi & Sơ Đồ Cây
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('news')} className="hover:text-pickle-lime transition-colors">
                  Bảng Tin Hoạt Động & Lịch Thi Đấu
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Liên Hệ & Kết Nối
            </h4>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <a
                href={settings.contact_zalo || 'https://zalo.me/g/fxdqrzrost2yui5t1mlz'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-bold transition-all shadow-sm hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>Tham Gia Nhóm Zalo CLB</span>
              </a>
              <div className="pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pickle-lime/10 border border-pickle-lime/20 text-[11px] font-bold text-pickle-600 dark:text-pickle-lime">
                  <span>⚡ 2v2 Double Ranking Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-pickle-border/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© 2026 Friends Pickleball Club. Mọi quyền được bảo lưu.</p>
          <div className="flex items-center gap-1">
            <span>Thiết kế với</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>cho cộng đồng Pickleball Việt Nam</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
