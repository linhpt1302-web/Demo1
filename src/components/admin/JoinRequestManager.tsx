import React from 'react';
import { JoinRequest } from '../../types';
import { Check, X, Phone, MessageSquare, Clock, UserCheck, UserX } from 'lucide-react';

interface JoinRequestManagerProps {
  requests: JoinRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const JoinRequestManager: React.FC<JoinRequestManagerProps> = ({
  requests,
  onApprove,
  onReject,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
          Danh Sách Đơn Xin Gia Nhập CLB ({requests.length})
        </h3>
        <span className="text-xs text-slate-400">
          Duyệt đơn sẽ tự động tạo hồ sơ thành viên mới vào danh sách CLB
        </span>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';

            return (
              <div
                key={req.id}
                className={`p-5 rounded-2xl bg-white dark:bg-pickle-card border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isPending
                    ? 'border-amber-500/40 shadow-sm'
                    : isApproved
                    ? 'border-emerald-500/30 opacity-80'
                    : 'border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {req.full_name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-pickle-lime/20 text-pickle-700 dark:text-pickle-lime text-[10px] font-bold">
                      DUPR tự đánh giá: {req.self_rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      • {req.preferred_hand || 'Tay phải'} • Kinh nghiệm {req.experience_years}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      {req.phone}
                    </span>
                    {req.zalo_fb && (
                      <span className="text-cyan-500 truncate max-w-[200px]">
                        Link: {req.zalo_fb}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {req.message && (
                    <p className="text-xs text-slate-500 dark:text-slate-300 italic pt-1">
                      "{req.message}"
                    </p>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => onApprove(req.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Chấp Thuận</span>
                      </button>

                      <button
                        onClick={() => onReject(req.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-200 dark:bg-pickle-surface hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Từ Chối</span>
                      </button>
                    </>
                  ) : isApproved ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã Gia Nhập CLB</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/15 text-rose-500 text-xs font-bold">
                      <X className="w-3.5 h-3.5" />
                      <span>Đã Từ Chối</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-pickle-card rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-xs text-slate-400">Không có đơn xin gia nhập nào đang chờ xử lý.</p>
        </div>
      )}
    </div>
  );
};
