import React, { useState } from 'react';
import { ClubSettings } from '../../types';
import { dataService } from '../../services/dataService';
import { resetSupabaseClient } from '../../services/supabase';
import { X, Database, Check, Download, Upload, RefreshCw, Key, ShieldCheck, Copy } from 'lucide-react';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClubSettings;
  onSaveSettings: (settings: ClubSettings) => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabase_url || '');
  const [supabaseKey, setSupabaseKey] = useState(settings.supabase_anon_key || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...settings,
      supabase_url: supabaseUrl.trim(),
      supabase_anon_key: supabaseKey.trim(),
    };
    onSaveSettings(updated);

    if (supabaseUrl && supabaseKey) {
      resetSupabaseClient(supabaseUrl.trim(), supabaseKey.trim());
      setStatusMessage('✅ Đã lưu cấu hình kết nối Supabase Cloud Database thành công!');
    } else {
      setStatusMessage('ℹ️ Đang chạy ở chế độ Hybrid LocalStorage (Offline).');
    }
  };

  const handleExport = () => {
    const json = dataService.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pickle_friends_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (dataService.importBackupJson(text)) {
          alert('Đã phục hồi dữ liệu thành công từ file JSON!');
          window.location.reload();
        } else {
          alert('Lỗi: File JSON không đúng định dạng!');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu mẫu ban đầu của CLB Friends?')) {
      dataService.resetToSampleData();
      alert('Đã đặt lại dữ liệu mẫu thành công!');
      window.location.reload();
    }
  };

  const handleCopySqlPath = () => {
    navigator.clipboard.writeText('supabase/schema.sql');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 bg-white dark:bg-pickle-card rounded-3xl shadow-2xl border border-slate-200 dark:border-pickle-border max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/20 text-cyan-500 rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Cơ Sở Dữ Liệu & Kết Nối Supabase Cloud
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chế độ Hybrid: Chạy mượt mà trên LocalStorage và đồng bộ đám mây với Supabase
            </p>
          </div>
        </div>

        {/* Supabase Connection Form */}
        <form onSubmit={handleSaveConfig} className="space-y-4 mb-8">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Thông Số Kết Nối Supabase
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-pickle-card border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-pickle-card border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none"
              />
            </div>

            {statusMessage && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                {statusMessage}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-pickle-lime text-pickle-dark hover:bg-pickle-400 rounded-xl shadow-md"
              >
                Lưu Cấu Hình Kết Nối
              </button>
            </div>
          </div>
        </form>

        {/* SQL Schema helper */}
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-800 dark:text-cyan-300 space-y-2 mb-8">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <span>📄</span> File Migration SQL Supabase có sẵn trong mã nguồn:
            </span>
            <button
              onClick={handleCopySqlPath}
              className="text-[11px] font-bold underline flex items-center gap-1"
            >
              {copiedSql ? 'Đã sao chép!' : 'Copy đường dẫn'}
            </button>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Bạn có thể mở file <code className="px-1.5 py-0.5 bg-cyan-200/50 dark:bg-cyan-950/60 rounded font-mono font-bold">supabase/schema.sql</code> và dán vào Supabase SQL Editor để khởi tạo toàn bộ bảng dữ liệu & bảo mật RLS!
          </p>
        </div>

        {/* Backup & Reset Actions */}
        <div className="border-t border-slate-200 dark:border-pickle-border pt-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Sao Lưu & Phục Hồi Dữ Liệu
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-pickle-surface hover:bg-slate-200 dark:hover:bg-pickle-card border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all"
            >
              <Download className="w-4 h-4 text-pickle-lime" />
              <span>Xuất File JSON</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-pickle-surface hover:bg-slate-200 dark:hover:bg-pickle-card border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Nhập File JSON</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>

            <button
              onClick={handleResetData}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold text-rose-600 dark:text-rose-400 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-rose-500" />
              <span>Đặt Lại Dữ Liệu Gốc</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
