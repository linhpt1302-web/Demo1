import React, { useState } from 'react';
import { Tournament, Member } from '../../types';
import { CreateTournamentModal } from './CreateTournamentModal';
import { TournamentDetail } from './TournamentDetail';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Plus, Calendar, Users, ArrowRight, Sparkles, Layers } from 'lucide-react';

interface TournamentListProps {
  tournaments: Tournament[];
  members: Member[];
  onSaveTournament: (tournament: Tournament) => void;
  onDeleteTournament: (tournamentId: string, rollbackElo: boolean) => void;
  onSaveMemberBatch: (members: Member[]) => void;
}

export const TournamentList: React.FC<TournamentListProps> = ({
  tournaments,
  members,
  onSaveTournament,
  onDeleteTournament,
  onSaveMemberBatch,
}) => {
  const { isAdmin } = useAuth();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // If a tournament is selected, show its detail view
  if (selectedTournament) {
    // Keep reference updated
    const liveTournament = tournaments.find((t) => t.id === selectedTournament.id) || selectedTournament;
    return (
      <TournamentDetail
        tournament={liveTournament}
        members={members}
        onBack={() => setSelectedTournament(null)}
        onUpdateTournament={(updated) => {
          onSaveTournament(updated);
          setSelectedTournament(updated);
        }}
        onDeleteTournament={(id, rollback) => {
          onDeleteTournament(id, rollback);
          setSelectedTournament(null);
        }}
        onSaveMemberBatch={onSaveMemberBatch}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Create CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-6 h-6 text-pickle-lime" />
            <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              Giải Đấu Đôi 2v2 CLB Friends
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hệ thống giải đấu liên hoàn: Vòng bảng 1 set chạm 15 $\rightarrow$ Tứ Kết $\rightarrow$ Bán Kết $\rightarrow$ Chung Kết Bo3 11
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-pickle-lime text-pickle-dark hover:bg-pickle-400 font-bold text-xs rounded-xl shadow-lg shadow-pickle-lime/20 transition-all hover:scale-105 active:scale-95 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Giải Đấu Mới</span>
          </button>
        )}
      </div>

      {/* Tournament Cards Grid */}
      {tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => {
            const isCompleted = t.status === 'completed';
            const isKnockout = t.status === 'knockout';

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTournament(t)}
                className="group cursor-pointer rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border hover:border-pickle-lime/60 shadow-md hover:shadow-xl hover:shadow-pickle-lime/10 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Banner Image */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={t.banner_url}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow ${
                          isCompleted
                            ? 'bg-amber-400 text-pickle-dark'
                            : isKnockout
                            ? 'bg-pickle-coral text-white animate-pulse'
                            : 'bg-pickle-lime text-pickle-dark'
                        }`}
                      >
                        {isCompleted
                          ? '🏆 ĐÃ KẾT THÚC'
                          : isKnockout
                          ? '⚡ VÒNG KNOCKOUT'
                          : '🎾 ĐANG ĐÁNH VÒNG BẢNG'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-pickle-lime" />
                        {t.start_date} $\rightarrow$ {t.end_date}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white group-hover:text-pickle-500 dark:group-hover:text-pickle-lime transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {t.description}
                    </p>

                    {/* Stats pills */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-100 dark:border-pickle-border/80 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-pickle-500" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">BẢNG ĐẤU</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {t.num_groups} Bảng
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-100 dark:border-pickle-border/80 flex items-center gap-2">
                        <Users className="w-4 h-4 text-pickle-coral" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">CẶP ĐẤU</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {t.teams.length} Cặp
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Champion Badge if Completed */}
                    {t.champion_team && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-bold flex items-center gap-2">
                        <span>🏆</span>
                        <span className="truncate">Vô địch: {t.champion_team.team_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 dark:border-pickle-border/60 flex items-center justify-between text-xs font-bold text-pickle-600 dark:text-pickle-lime group-hover:translate-x-1 transition-transform">
                    <span>Xem Bảng Đấu & Sơ Đồ Cây</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-pickle-card rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            Chưa có giải đấu nào
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Đăng nhập quyền Admin để tạo giải đấu đôi 2v2 mới cho CLB Friends!
          </p>
        </div>
      )}

      {/* Create Tournament Modal */}
      <CreateTournamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        members={members}
        onSaveTournament={onSaveTournament}
      />
    </div>
  );
};
