import React, { useEffect } from 'react';
import { Tournament, Match, Member } from '../../types';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, Flame, CheckCircle, Shield } from 'lucide-react';

interface KnockoutTreeProps {
  tournament: Tournament;
  members: Member[];
  onOpenMatchScore: (match: Match) => void;
}

export const KnockoutTree: React.FC<KnockoutTreeProps> = ({
  tournament,
  members,
  onOpenMatchScore,
}) => {
  const { isAdmin } = useAuth();
  const knockout = tournament.knockout_matches;

  // Trigger celebration when champion is crowned
  useEffect(() => {
    if (tournament.champion_team && tournament.status === 'completed') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4FF00', '#FF5E36', '#FFD700', '#06B6D4'],
      });
    }
  }, [tournament.champion_team, tournament.status]);

  if (!knockout) {
    return (
      <div className="text-center py-16 bg-white dark:bg-pickle-card rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
        <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
          Chưa khởi tạo sơ đồ vòng loại trực tiếp (Knockout)
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Hoàn thành giai đoạn vòng bảng và bấm "Tiến Vào Vòng Tứ Kết" để tạo cây thi đấu!
        </p>
      </div>
    );
  }

  const { quarterfinals, semifinals, final, bronze } = knockout;

  const renderMatchCard = (m: Match, stageLabel: string, formatLabel: string) => {
    const isDone = m.status === 'completed';
    const isT1Win = m.winner_team === 1;
    const isT2Win = m.winner_team === 2;

    const hasTeams = Boolean(m.team1_name && m.team2_name && m.team1_name !== 'Chờ kết quả...' && m.team2_name !== 'Chờ kết quả...');

    return (
      <div
        onClick={() => isAdmin && hasTeams && onOpenMatchScore(m)}
        className={`relative p-4 rounded-2xl bg-white dark:bg-pickle-card border-2 transition-all ${
          isDone
            ? 'border-slate-200 dark:border-pickle-border shadow-sm'
            : hasTeams
            ? 'border-pickle-lime/50 shadow-md shadow-pickle-lime/10'
            : 'border-dashed border-slate-200 dark:border-slate-800 opacity-60'
        } ${isAdmin && hasTeams ? 'cursor-pointer hover:border-pickle-lime hover:scale-102' : ''}`}
      >
        {/* Stage header & Format badge */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-2.5">
          <span className="uppercase tracking-wider">{stageLabel}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-pickle-surface text-slate-500 dark:text-slate-400 font-mono">
            {formatLabel}
          </span>
        </div>

        {/* Team 1 */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl mb-1.5 transition-colors ${
            isDone && isT1Win
              ? 'bg-pickle-lime/15 text-pickle-800 dark:text-pickle-lime font-black'
              : 'bg-slate-50 dark:bg-pickle-surface text-slate-800 dark:text-slate-200 font-semibold'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {isDone && isT1Win && <span className="text-xs">🏆</span>}
            <span className="text-xs truncate">{m.team1_name || 'Chờ đội thắng...'}</span>
          </div>
          <span className="font-mono font-bold text-xs ml-2">
            {isDone ? m.team1_scores.join('-') : '-'}
          </span>
        </div>

        {/* Team 2 */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
            isDone && isT2Win
              ? 'bg-pickle-coral/15 text-pickle-coral font-black'
              : 'bg-slate-50 dark:bg-pickle-surface text-slate-800 dark:text-slate-200 font-semibold'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {isDone && isT2Win && <span className="text-xs">🏆</span>}
            <span className="text-xs truncate">{m.team2_name || 'Chờ đội thắng...'}</span>
          </div>
          <span className="font-mono font-bold text-xs ml-2">
            {isDone ? m.team2_scores.join('-') : '-'}
          </span>
        </div>

        {/* Admin hint */}
        {isAdmin && hasTeams && (
          <div className="mt-2 text-[9px] text-right text-pickle-600 dark:text-pickle-lime font-bold">
            {isDone ? 'Nhấp để sửa điểm' : 'Nhấp để nhập kết quả'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Champion Podium if Completed */}
      {tournament.champion_team && (
        <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-pickle-lime/15 to-pickle-coral/20 border-2 border-amber-400 shadow-2xl text-center relative overflow-hidden animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-pickle-dark font-black font-display text-xs uppercase mb-3 shadow-lg shadow-amber-400/30">
            <Sparkles className="w-4 h-4" />
            <span>NHÀ VÔ ĐỊCH GIẢI ĐẤU</span>
          </div>
          <h2 className="text-3xl font-black font-display text-slate-900 dark:text-white mb-2">
            🏆 {tournament.champion_team.team_name} 🏆
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-lg mx-auto mb-6">
            Chúc mừng cặp đôi xuất sắc nhất đã vượt qua tất cả các vòng đấu để đoạt Cúp Vô Địch danh giá {tournament.name}!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
            {tournament.runner_up_team && (
              <div className="px-4 py-2 rounded-2xl bg-white/80 dark:bg-pickle-card border border-slate-300 dark:border-slate-600">
                <span className="text-slate-400 block text-[10px] uppercase">🥈 Á Quân</span>
                <span className="text-slate-800 dark:text-slate-200">{tournament.runner_up_team.team_name}</span>
              </div>
            )}
            {tournament.third_place_team && (
              <div className="px-4 py-2 rounded-2xl bg-white/80 dark:bg-pickle-card border border-amber-700/40">
                <span className="text-amber-600 dark:text-amber-400 block text-[10px] uppercase">🥉 Hạng Ba</span>
                <span className="text-slate-800 dark:text-slate-200">{tournament.third_place_team.team_name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bracket Tree Layout */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-pickle-surface/40 border border-slate-200 dark:border-pickle-border overflow-x-auto">
        <div className="min-w-[900px] grid grid-cols-3 gap-8 items-center">
          
          {/* Col 1: Tứ Kết (Quarterfinals) */}
          <div className="space-y-6">
            <div className="text-center pb-2 border-b border-slate-200 dark:border-pickle-border">
              <h3 className="text-sm font-black font-display text-slate-900 dark:text-white uppercase tracking-wider">
                VÒNG TỨ KẾT (8 ĐỘI)
              </h3>
              <p className="text-[10px] text-slate-400">1 Set Chạm 15 Điểm</p>
            </div>

            <div className="space-y-4">
              {quarterfinals.map((qf, i) => (
                <div key={qf.id}>
                  {renderMatchCard(qf, `Tứ Kết ${i + 1}`, '1 Set 15')}
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Bán Kết (Semifinals) */}
          <div className="space-y-8">
            <div className="text-center pb-2 border-b border-slate-200 dark:border-pickle-border">
              <h3 className="text-sm font-black font-display text-slate-900 dark:text-white uppercase tracking-wider">
                VÒNG BÁN KẾT (4 ĐỘI)
              </h3>
              <p className="text-[10px] text-slate-400">1 Set Chạm 15 Điểm</p>
            </div>

            <div className="space-y-16">
              {semifinals.map((sf, i) => (
                <div key={sf.id}>
                  {renderMatchCard(sf, `Bán Kết ${i + 1}`, '1 Set 15')}
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Chung Kết & Tranh Hạng 3 */}
          <div className="space-y-8">
            <div className="text-center pb-2 border-b border-slate-200 dark:border-pickle-border">
              <h3 className="text-sm font-black font-display text-amber-500 uppercase tracking-wider">
                🏆 VÒNG CHUNG KẾT
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">3 Set Thắng 2 Chạm 11 (Bo3)</p>
            </div>

            <div className="space-y-8">
              {/* Final Match */}
              <div className="p-1 rounded-3xl bg-gradient-to-r from-amber-400 to-pickle-lime shadow-xl">
                {renderMatchCard(final, 'CHUNG KẾT TRANH CÚP', 'Bo3 11 Điểm')}
              </div>

              {/* Bronze Match */}
              {bronze && (
                <div>
                  <div className="text-center pb-1 mb-2">
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                      🥉 TRANH HẠNG BA
                    </span>
                  </div>
                  {renderMatchCard(bronze, 'Tranh Hạng 3', '1 Set 15')}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
