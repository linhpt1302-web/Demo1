import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PickleLogo } from '../common/PickleLogo';
import {
  Trophy,
  Users,
  Award,
  Newspaper,
  Sun,
  Moon,
  ShieldCheck,
  LogOut,
  UserPlus,
  LayoutDashboard,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenJoinModal: () => void;
  onOpenRecordMatchModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenJoinModal,
  onOpenRecordMatchModal,
}) => {
  const { isAdmin, openLoginModal, logoutAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'home', label: 'Trang Chủ', icon: Zap },
    { id: 'members', label: 'Thành Viên', icon: Users },
    { id: 'leaderboard', label: 'Bảng Xếp Hạng', icon: Award },
    { id: 'tournaments', label: 'Giải Đấu', icon: Trophy },
    { id: 'news', label: 'Bảng Tin', icon: Newspaper },
    ...(isAdmin ? [{ id: 'admin', label: 'Quản Trị', icon: LayoutDashboard }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-pickle-dark/90 border-b border-slate-200/80 dark:border-pickle-border/80 transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          
          {/* Brand / Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0 min-w-0"
          >
            <PickleLogo size="md" className="group-hover:scale-105 transition-transform" />
            
            <div className="flex flex-col justify-center min-w-0">
              {/* Single line brand title + club badge */}
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-extrabold font-display text-sm sm:text-base tracking-tight text-slate-900 dark:text-white group-hover:text-pickle-500 dark:group-hover:text-pickle-lime transition-colors whitespace-nowrap">
                  PICKLE FRIENDS
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-pickle-lime/20 text-pickle-700 dark:text-pickle-lime shrink-0">
                  CLUB
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-normal whitespace-nowrap truncate max-w-[140px] sm:max-w-none">
                Đam Mê • Kết Nối • Đấu Đôi 2v2
              </p>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-pickle-surface/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-pickle-border/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-pickle-lime text-pickle-dark shadow-md shadow-pickle-lime/25'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-pickle-card'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-pickle-dark' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Match Record Button (Admin only) */}
            {isAdmin && (
              <button
                onClick={onOpenRecordMatchModal}
                title="Ghi nhận kết quả trận đấu 2v2 (Admin)"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold bg-pickle-coral/15 hover:bg-pickle-coral text-pickle-coral hover:text-white border border-pickle-coral/30 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Ghi Trận 2v2</span>
                <span className="sm:hidden">Ghi Trận</span>
              </button>
            )}

            {/* Join Club Button (for Guests) */}
            <button
              onClick={onOpenJoinModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-gradient-to-r from-pickle-500 to-pickle-lime text-pickle-dark hover:from-pickle-400 hover:to-pickle-300 rounded-xl shadow-md shadow-pickle-lime/20 transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5 text-pickle-dark shrink-0" />
              <span>Gia Nhập</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Chuyển chế độ Sáng / Tối"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-pickle-surface rounded-xl border border-slate-200 dark:border-pickle-border transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* Admin Login / Logout */}
            {isAdmin ? (
              <div className="flex items-center gap-1 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 px-2 sm:px-2.5 py-1.5 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hidden lg:inline">
                  Admin
                </span>
                <button
                  onClick={logoutAdmin}
                  title="Đăng xuất Admin"
                  className="p-0.5 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-pickle-surface rounded-xl border border-slate-200 dark:border-pickle-border transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden lg:inline">Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2 gap-1 border-t border-slate-200/50 dark:border-pickle-border/40 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-pickle-lime/20 text-pickle-600 dark:text-pickle-lime font-black'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
