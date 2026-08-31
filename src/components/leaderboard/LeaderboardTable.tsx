import React, { useState } from 'react';
import { Member, Match } from '../../types';
import { DigitalMemberCardModal } from '../members/DigitalMemberCardModal';
import { useAuth } from '../../context/AuthContext';
import {
  Trophy,
  Award,
  Flame,
  QrCode,
  History,
  TrendingUp,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface LeaderboardTableProps {
  members: Member[];
  matches: Match[];
  onOpenRecordMatch: () => void;
  onDeleteMatch?: (matchId: string) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  members,
  matches,
  onOpenRecordMatch,
  onDeleteMatch,
}) => {
  const { isAdmin } = useAuth();
  const [viewTab, setViewTab] = useState<'ranking' | 'history'>('ranking');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Sort members by DUPR rating descending, then ELO points
  const sortedMembers = [...members].sort((a, b) => {
    if (b.dupr_rating !== a.dupr_rating) return b.dupr_rating - a.dupr_rating;
    return b.elo_points - a.elo_points;
  });

  const top1 = sortedMembers[0];
  const top2 = sortedMembers[1];
  const top3 = sortedMembers[2];

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              Bảng Xếp Hạng CLB Friends
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hệ thống xếp hạng chuẩn DUPR và điểm tích lũy ELO qua các trận đấu đôi 2v2
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle tabs */}
          <div className="flex bg-slate-100 dark:bg-pickle-card p-1 rounded-xl border border-slate-200 dark:border-pickle-border">
            <button
              onClick={() => setViewTab('ranking')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewTab === 'ranking'
                  ? 'bg-pickle-lime text-pickle-dark shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Xếp Hạng DUPR</span>
            </button>
            <button
              onClick={() => setViewTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewTab === 'history'
                  ? 'bg-pickle-lime text-pickle-dark shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch Sử Đấu 2v2 ({matches.length})</span>
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenRecordMatch}
              className="flex items-center gap-1.5 px-4 py-2 bg-pickle-coral hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-pickle-coral/25 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Award className="w-4 h-4" />
              <span>+ Ghi Trận Đấu 2v2</span>
            </button>
          )}
        </div>
      </div>

      {viewTab === 'ranking' ? (
        <>
          {/* Top 3 Podium Cards */}
          {sortedMembers.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
              {/* Top 2 - Silver */}
              <div
                onClick={() => setSelectedMember(top2)}
                className="order-2 md:order-1 cursor-pointer group p-5 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800/80 dark:to-pickle-card border-2 border-slate-300 dark:border-slate-600/60 shadow-lg hover:scale-102 transition-all text-center relative overflow-hidden"
              >
                <div className="absolute top-2 left-2 text-2xl font-black text-slate-400 font-display">#2</div>
                <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md mb-3 relative">
                  <img src={top2.avatar_url} alt={top2.full_name} className="w-full h-full object-cover" />
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-slate-300/40 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold uppercase mb-1">
                  🥈 Á Quân CLB
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white truncate font-display">
                  {top2.full_name}
                </h4>
                <p className="text-xs text-pickle-500 font-semibold mb-3">@{top2.nickname}</p>
                <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-300/60 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">DUPR</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{top2.dupr_rating.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">ELO</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{top2.elo_points}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">THẮNG</span>
                    <span className="text-sm font-black text-amber-500 font-mono">
                      {top2.matches_played > 0 ? Math.round((top2.matches_won / top2.matches_played) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Top 1 - Gold Champion */}
              <div
                onClick={() => setSelectedMember(top1)}
                className="order-1 md:order-2 cursor-pointer group p-6 rounded-3xl bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-pickle-card border-2 border-amber-400 shadow-xl shadow-amber-400/10 hover:scale-105 transition-all text-center relative overflow-hidden -mt-2"
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-400/20 rounded-full blur-xl"></div>
                <div className="absolute top-2 left-3 text-3xl font-black text-amber-400 font-display">#1</div>
                <div className="w-20 h-20 mx-auto rounded-3xl overflow-hidden border-3 border-amber-400 shadow-xl mb-3 relative group-hover:rotate-2 transition-transform">
                  <img src={top1.avatar_url} alt={top1.full_name} className="w-full h-full object-cover" />
                  <div className="absolute top-0 right-0 bg-amber-400 text-pickle-dark px-1.5 py-0.5 rounded-bl-lg font-black text-[10px]">
                    👑
                  </div>
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-pickle-dark text-[11px] font-black uppercase mb-1 shadow-md shadow-amber-400/30">
                  🏆 QUÁN QUÂN CLB
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white truncate font-display">
                  {top1.full_name}
                </h4>
                <p className="text-xs text-pickle-lime font-bold mb-3">@{top1.nickname}</p>
                <div className="flex items-center justify-center gap-4 pt-3 border-t border-amber-400/30 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">DUPR RATING</span>
                    <span className="text-base font-black text-pickle-lime font-mono">{top1.dupr_rating.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">ĐIỂM ELO</span>
                    <span className="text-base font-black text-amber-400 font-mono">{top1.elo_points}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">CHUỖI THẮNG</span>
                    <span className="text-base font-black text-rose-500 font-mono">🔥 {top1.current_streak}W</span>
                  </div>
                </div>
              </div>

              {/* Top 3 - Bronze */}
              <div
                onClick={() => setSelectedMember(top3)}
                className="order-3 cursor-pointer group p-5 rounded-2xl bg-gradient-to-b from-amber-700/10 to-pickle-card border-2 border-amber-700/40 shadow-lg hover:scale-102 transition-all text-center relative overflow-hidden"
              >
                <div className="absolute top-2 left-2 text-2xl font-black text-amber-700 font-display">#3</div>
                <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 border-amber-700/50 shadow-md mb-3 relative">
                  <img src={top3.avatar_url} alt={top3.full_name} className="w-full h-full object-cover" />
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-amber-700/20 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase mb-1">
                  🥉 Hạng Ba CLB
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white truncate font-display">
                  {top3.full_name}
                </h4>
                <p className="text-xs text-pickle-500 font-semibold mb-3">@{top3.nickname}</p>
                <div className="flex items-center justify-center gap-3 pt-2 border-t border-amber-700/30 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">DUPR</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{top3.dupr_rating.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">ELO</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{top3.elo_points}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">THẮNG</span>
                    <span className="text-sm font-black text-amber-500 font-mono">
                      {top3.matches_played > 0 ? Math.round((top3.matches_won / top3.matches_played) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="overflow-x-auto rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-pickle-surface/80 border-b border-slate-200 dark:border-pickle-border text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-4 px-4 text-center">#</th>
                  <th className="py-4 px-4">Vận Động Viên</th>
                  <th className="py-4 px-3 text-center">DUPR</th>
                  <th className="py-4 px-3 text-center">Điểm ELO</th>
                  <th className="py-4 px-3 text-center">Thắng/Thua</th>
                  <th className="py-4 px-3 text-center">Tỉ Lệ Thắng</th>
                  <th className="py-4 px-3 text-center">Phong Độ</th>
                  <th className="py-4 px-4">Danh Hiệu</th>
                  <th className="py-4 px-4 text-center">Thẻ Số</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-pickle-border/60">
                {sortedMembers.map((member, index) => {
                  const winRate =
                    member.matches_played > 0
                      ? Math.round((member.matches_won / member.matches_played) * 100)
                      : 0;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50 dark:hover:bg-pickle-surface/50 transition-colors"
                    >
                      {/* Rank Number */}
                      <td className="py-3 px-4 text-center font-black font-display text-sm">
                        {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}
                      </td>

                      {/* Player info */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setSelectedMember(member)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-pickle-border group-hover:border-pickle-lime transition-colors"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-pickle-500 dark:group-hover:text-pickle-lime block">
                              {member.full_name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              @{member.nickname} • {member.hand === 'left' ? 'Tay Trái' : 'Tay Phải'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DUPR */}
                      <td className="py-3 px-3 text-center font-black font-display text-sm text-pickle-600 dark:text-pickle-lime">
                        {member.dupr_rating.toFixed(2)}
                      </td>

                      {/* ELO */}
                      <td className="py-3 px-3 text-center font-extrabold font-mono text-slate-900 dark:text-slate-100">
                        {member.elo_points}
                      </td>

                      {/* W/L */}
                      <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-300 font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{member.matches_won}W</span> - <span className="text-rose-500 font-semibold">{member.matches_lost}L</span>
                      </td>

                      {/* Win Rate */}
                      <td className="py-3 px-3 text-center font-bold text-amber-500">
                        {winRate}%
                      </td>

                      {/* Streak */}
                      <td className="py-3 px-3 text-center">
                        {member.current_streak > 0 ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                            <Flame className="w-3 h-3" />
                            W{member.current_streak}
                          </span>
                        ) : member.current_streak < 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-200 dark:bg-pickle-surface text-slate-500 font-semibold text-[10px]">
                            L{Math.abs(member.current_streak)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Badges */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {member.badges?.slice(0, 1).map((b, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pickle-lime/10 text-pickle-600 dark:text-pickle-lime border border-pickle-lime/20 truncate"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* QR Modal Trigger */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="p-1.5 text-slate-400 hover:text-pickle-lime hover:bg-slate-100 dark:hover:bg-pickle-surface rounded-lg transition-colors"
                          title="Xem Thẻ Số & QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Match History Tab */
        <div className="space-y-4">
          {matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((m) => {
                const isT1Win = m.winner_team === 1;
                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm flex flex-col justify-between hover:border-pickle-lime/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(m.played_at).toLocaleDateString('vi-VN')} {m.court_name && `• ${m.court_name}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-pickle-surface text-[10px] font-bold">
                          {m.format === '1_set_15' ? '1 Set 15 Điểm' : '3 Set 11 Điểm'}
                        </span>
                      </div>

                      {/* Teams & Score Box */}
                      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-pickle-border/80 mb-3">
                        {/* Team 1 */}
                        <div className={`flex-1 ${isT1Win ? 'font-bold text-pickle-600 dark:text-pickle-lime' : 'text-slate-600 dark:text-slate-300'}`}>
                          <div className="text-xs truncate">{m.team1_name || 'Đội 1'}</div>
                          {isT1Win && <span className="text-[10px] font-black uppercase text-amber-500">Thắng 🏆</span>}
                        </div>

                        {/* Scores */}
                        <div className="px-4 text-center">
                          <div className="text-base font-black font-mono text-slate-900 dark:text-white">
                            {m.team1_scores.join(' / ')} - {m.team2_scores.join(' / ')}
                          </div>
                        </div>

                        {/* Team 2 */}
                        <div className={`flex-1 text-right ${!isT1Win ? 'font-bold text-pickle-coral' : 'text-slate-600 dark:text-slate-300'}`}>
                          <div className="text-xs truncate">{m.team2_name || 'Đội 2'}</div>
                          {!isT1Win && <span className="text-[10px] font-black uppercase text-amber-500">Thắng 🏆</span>}
                        </div>
                      </div>

                      {/* ELO Changes badge if any */}
                      {m.elo_changes && m.elo_changes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                          {m.elo_changes.map((c) => {
                            const player = members.find((x) => x.id === c.player_id);
                            const isPlus = c.elo_delta >= 0;
                            return (
                              <span
                                key={c.player_id}
                                className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                                  isPlus
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {player?.nickname || 'VĐV'}: {isPlus ? `+${c.elo_delta}` : c.elo_delta}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Admin Delete Match with ELO Rollback */}
                    {isAdmin && onDeleteMatch && (
                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-pickle-border/60 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {m.match_type === 'ranking' ? '⚡ Trận xếp hạng tính ELO' : '🤝 Trận giao lưu CLB'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const conf = window.confirm(
                              `Xác nhận xóa trận đấu?\n\n• ${m.team1_name} vs ${m.team2_name}\n• Tỉ số: ${m.team1_scores.join('/')} - ${m.team2_scores.join('/')}\n\n👉 Khi xóa trận, điểm ELO và kết quả Thắng/Thua của các VĐV tham gia sẽ được tự động THU HỒI / HOÀN TRẢ về trước thời điểm đấu.`
                            );
                            if (conf) {
                              onDeleteMatch(m.id);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                          title="Xóa trận đấu này và thu hồi điểm ELO của các VĐV"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa trận & Thu hồi ELO</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-pickle-card rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <History className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Chưa có lịch sử trận đấu nào
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Các trận đấu 2v2 và trận đấu giải sẽ xuất hiện tại đây
              </p>
            </div>
          )}
        </div>
      )}

      {/* Digital Member Card Modal */}
      <DigitalMemberCardModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};
