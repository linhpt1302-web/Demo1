import React, { useState } from 'react';
import { Member, Tournament, Match, JoinRequest, ClubSettings } from '../../types';
import { JoinRequestManager } from './JoinRequestManager';
import { DatabaseConfigModal } from './DatabaseConfigModal';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Award,
  UserPlus,
  Database,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface AdminDashboardProps {
  members: Member[];
  tournaments: Tournament[];
  matches: Match[];
  joinRequests: JoinRequest[];
  settings: ClubSettings;
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onSaveSettings: (settings: ClubSettings) => void;
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  members,
  tournaments,
  matches,
  joinRequests,
  settings,
  onApproveRequest,
  onRejectRequest,
  onSaveSettings,
  setActiveTab,
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'requests' | 'settings'>('requests');
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const pendingRequests = joinRequests.filter((r) => r.status === 'pending');
  const activeTournaments = tournaments.filter((t) => t.status !== 'completed');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              Bảng Quản Trị CLB Friends
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Trung tâm điều hành thành viên, giải đấu đôi 2v2, duyệt đơn gia nhập và cơ sở dữ liệu
          </p>
        </div>

        <button
          onClick={() => setIsDbModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all self-start md:self-auto"
        >
          <Database className="w-4 h-4" />
          <span>Cấu Hình Supabase Cloud</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Members */}
        <div
          onClick={() => setActiveTab('members')}
          className="p-5 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm hover:border-pickle-lime/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổng Thành Viên</span>
            <div className="p-2 bg-pickle-lime/15 text-pickle-600 dark:text-pickle-lime rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {members.length}
          </div>
          <span className="text-[10px] text-pickle-600 dark:text-pickle-lime font-semibold">Xem danh sách →</span>
        </div>

        {/* Tournaments */}
        <div
          onClick={() => setActiveTab('tournaments')}
          className="p-5 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm hover:border-amber-400/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Giải Đấu Đang Chạy</span>
            <div className="p-2 bg-amber-500/15 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {activeTournaments.length} <span className="text-xs font-normal text-slate-400">/ {tournaments.length}</span>
          </div>
          <span className="text-[10px] text-amber-500 font-semibold">Xem giải đấu →</span>
        </div>

        {/* Matches */}
        <div
          onClick={() => setActiveTab('leaderboard')}
          className="p-5 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm hover:border-pickle-coral/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổng Trận 2v2</span>
            <div className="p-2 bg-pickle-coral/15 text-pickle-coral rounded-xl group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {matches.length}
          </div>
          <span className="text-[10px] text-pickle-coral font-semibold">Bảng xếp hạng →</span>
        </div>

        {/* Pending Requests */}
        <div
          onClick={() => setActiveAdminSubTab('requests')}
          className="p-5 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm hover:border-indigo-400/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đơn Chờ Duyệt</span>
            <div className="p-2 bg-indigo-500/15 text-indigo-500 rounded-xl group-hover:scale-110 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
            {pendingRequests.length}
          </div>
          <span className="text-[10px] text-indigo-500 font-semibold">Xử lý ngay →</span>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-pickle-border pb-3">
        <button
          onClick={() => setActiveAdminSubTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminSubTab === 'requests'
              ? 'bg-pickle-lime text-pickle-dark shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-pickle-card'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Đơn Xin Gia Nhập ({joinRequests.length})</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-mono">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminSubTab === 'settings'
              ? 'bg-pickle-lime text-pickle-dark shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-pickle-card'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Cài Đặt Thông Tin CLB</span>
        </button>
      </div>

      {/* Admin Sub Tab Content */}
      {activeAdminSubTab === 'requests' && (
        <JoinRequestManager
          requests={joinRequests}
          onApprove={onApproveRequest}
          onReject={onRejectRequest}
        />
      )}

      {activeAdminSubTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm max-w-2xl space-y-4">
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
            Thông Tin Chung Về CLB Friends
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Tên Câu Lạc Bộ</label>
              <input
                type="text"
                value={settings.club_name}
                onChange={(e) => onSaveSettings({ ...settings, club_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-pickle-surface border text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Khẩu Hiệu / Slogan</label>
              <input
                type="text"
                value={settings.slogan}
                onChange={(e) => onSaveSettings({ ...settings, slogan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-pickle-surface border text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Địa Điểm Sân Tập</label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => onSaveSettings({ ...settings, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-pickle-surface border text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Lịch Sinh Hoạt</label>
              <input
                type="text"
                value={settings.play_schedule}
                onChange={(e) => onSaveSettings({ ...settings, play_schedule: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-pickle-surface border text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Hotline Liên Hệ</label>
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => onSaveSettings({ ...settings, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-pickle-surface border text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Link Zalo Nhóm</label>
                <input
                  type="text"
                  value={settings.contact_zalo}
                  onChange={(e) => onSaveSettings({ ...settings, contact_zalo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-pickle-surface border text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Config Modal */}
      <DatabaseConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        settings={settings}
        onSaveSettings={onSaveSettings}
      />
    </div>
  );
};
