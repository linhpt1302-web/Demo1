import React, { useState } from 'react';
import { Tournament } from '../../types';
import { Trash2, AlertTriangle, X, Undo2, Check } from 'lucide-react';

interface DeleteTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  onConfirmDelete: (tournamentId: string, rollbackElo: boolean) => void;
}

export const DeleteTournamentModal: React.FC<DeleteTournamentModalProps> = ({
  isOpen,
  onClose,
  tournament,
  onConfirmDelete,
}) => {
  const [rollbackElo, setRollbackElo] = useState(true);

  if (!isOpen || !tournament) return null;

  const totalMatches =
    tournament.group_matches.length +
    (tournament.knockout_matches
      ? tournament.knockout_matches.quarterfinals.length +
        tournament.knockout_matches.semifinals.length +
        1
      : 0);

  const completedMatches =
    tournament.group_matches.filter((m) => m.status === 'completed').length +
    (tournament.knockout_matches
      ? [
          ...tournament.knockout_matches.quarterfinals,
          ...tournament.knockout_matches.semifinals,
          tournament.knockout_matches.final,
        ].filter((m) => m && m.status === 'completed').length
      : 0);

  const handleConfirm = () => {
    onConfirmDelete(tournament.id, rollbackElo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-white dark:bg-pickle-card rounded-3xl shadow-2xl border border-rose-500/30">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-rose-500/20 text-rose-500 rounded-2xl">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Xóa Giải Đấu & Hoàn Trả ELO
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Giải: {tournament.name}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 space-y-2 mb-5">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Hành động này không thể hoàn tác!</span>
          </div>
          <p>
            Giải đấu này có <span className="font-bold">{tournament.teams.length} cặp đấu</span> và đã thi đấu <span className="font-bold">{completedMatches} trận</span>.
          </p>
        </div>

        {/* Rollback ELO & Win/Loss Stats Toggle Checkbox */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-slate-800 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rollbackElo}
              onChange={(e) => setRollbackElo(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded-lg text-pickle-lime focus:ring-pickle-lime border-slate-300 dark:border-slate-700 bg-white dark:bg-pickle-card cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                <Undo2 className="w-4 h-4 text-pickle-lime" />
                <span>Thu hồi điểm ELO/DUPR & Khôi phục tỉ lệ Thắng/Thua của VĐV</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Tất cả điểm số ELO, DUPR, số trận thắng, số trận thua và tỉ lệ thắng của các VĐV từ {completedMatches} trận đấu trong giải này sẽ được tự động hoàn trả về nguyên trạng trước khi giải đấu diễn ra.
              </p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-600/25 transition-all"
          >
            Xác Nhận Xóa Giải Đấu
          </button>
        </div>
      </div>
    </div>
  );
};
