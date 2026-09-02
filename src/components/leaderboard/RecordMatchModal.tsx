import React, { useState, useMemo, useEffect } from 'react';
import { Member, Match, MatchFormat } from '../../types';
import { calculate2v2Elo } from '../../utils/eloCalculator';
import { X, Award, Zap, Trophy, CheckCircle2, Plus, Minus, Users, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecordMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSaveMatch: (match: Match, updatedMembers: Member[]) => void;
}

export const RecordMatchModal: React.FC<RecordMatchModalProps> = ({
  isOpen,
  onClose,
  members = [],
  onSaveMatch,
}) => {
  const [matchType, setMatchType] = useState<'ranking' | 'casual'>('ranking');
  const [team1P1, setTeam1P1] = useState<string>(() => members[0]?.id || '');
  const [team1P2, setTeam1P2] = useState<string>(() => members[1]?.id || '');
  const [team2P1, setTeam2P1] = useState<string>(() => members[2]?.id || '');
  const [team2P2, setTeam2P2] = useState<string>(() => members[3]?.id || '');

  const [format, setFormat] = useState<MatchFormat>('1_set_15');
  const [courtName, setCourtName] = useState('Sân 1 - Sân Dũng/Vân Anh');

  // Single set 15 points
  const [t1ScoreSet1, setT1ScoreSet1] = useState<number>(15);
  const [t2ScoreSet1, setT2ScoreSet1] = useState<number>(11);

  // Best of 3 sets 11 points
  const [t1ScoreSet2, setT1ScoreSet2] = useState<number>(11);
  const [t2ScoreSet2, setT2ScoreSet2] = useState<number>(9);
  const [t1ScoreSet3, setT1ScoreSet3] = useState<number>(11);
  const [t2ScoreSet3, setT2ScoreSet3] = useState<number>(8);

  const [isSuccess, setIsSuccess] = useState(false);
  const [savedMatchSummary, setSavedMatchSummary] = useState<Match | null>(null);

  // Reset and auto-initialize valid selections whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setSavedMatchSummary(null);
      if (members && members.length >= 4) {
        const selected = [team1P1, team1P2, team2P1, team2P2];
        const allExist = selected.every((id) => id && members.some((m) => m.id === id));
        const isDistinct = new Set(selected.filter(Boolean)).size === 4;

        if (!allExist || !isDistinct) {
          setTeam1P1(members[0]?.id || '');
          setTeam1P2(members[1]?.id || '');
          setTeam2P1(members[2]?.id || '');
          setTeam2P2(members[3]?.id || '');
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected player objects
  const p1 = members.find((m) => m.id === team1P1) || members[0];
  const p2 = members.find((m) => m.id === team1P2) || members[1];
  const p3 = members.find((m) => m.id === team2P1) || members[2];
  const p4 = members.find((m) => m.id === team2P2) || members[3];

  // Determine winner and scores
  const { team1Scores, team2Scores, winnerTeam, isTied, isValidMatch } = useMemo(() => {
    let t1Scores: number[] = [];
    let t2Scores: number[] = [];
    let winner: 1 | 2 = 1;
    let tied = false;

    if (format === '1_set_15') {
      t1Scores = [Number(t1ScoreSet1) || 0];
      t2Scores = [Number(t2ScoreSet1) || 0];
      if (t1ScoreSet1 === t2ScoreSet1) {
        tied = true;
      } else {
        winner = t1ScoreSet1 > t2ScoreSet1 ? 1 : 2;
      }
    } else {
      let t1Wins = 0;
      let t2Wins = 0;
      if (t1ScoreSet1 > t2ScoreSet1) t1Wins++;
      else if (t2ScoreSet1 > t1ScoreSet1) t2Wins++;

      if (t1ScoreSet2 > t2ScoreSet2) t1Wins++;
      else if (t2ScoreSet2 > t1ScoreSet2) t2Wins++;

      if (t1Wins === 2) {
        t1Scores = [Number(t1ScoreSet1) || 0, Number(t1ScoreSet2) || 0];
        t2Scores = [Number(t2ScoreSet1) || 0, Number(t2ScoreSet2) || 0];
        winner = 1;
      } else if (t2Wins === 2) {
        t1Scores = [Number(t1ScoreSet1) || 0, Number(t1ScoreSet2) || 0];
        t2Scores = [Number(t2ScoreSet1) || 0, Number(t2ScoreSet2) || 0];
        winner = 2;
      } else {
        // Tied 1-1, check set 3
        t1Scores = [Number(t1ScoreSet1) || 0, Number(t1ScoreSet2) || 0, Number(t1ScoreSet3) || 0];
        t2Scores = [Number(t2ScoreSet1) || 0, Number(t2ScoreSet2) || 0, Number(t2ScoreSet3) || 0];
        if (t1ScoreSet3 > t2ScoreSet3) {
          winner = 1;
        } else if (t2ScoreSet3 > t1ScoreSet3) {
          winner = 2;
        } else {
          tied = true;
        }
      }
    }

    const currentP1Id = p1?.id;
    const currentP2Id = p2?.id;
    const currentP3Id = p3?.id;
    const currentP4Id = p4?.id;

    const uniqueIds = new Set([currentP1Id, currentP2Id, currentP3Id, currentP4Id].filter(Boolean));
    const isValid =
      uniqueIds.size === 4 &&
      Boolean(p1 && p2 && p3 && p4) &&
      !tied &&
      members.length >= 4;

    return {
      team1Scores: t1Scores,
      team2Scores: t2Scores,
      winnerTeam: winner,
      isTied: tied,
      isValidMatch: isValid,
    };
  }, [
    format,
    t1ScoreSet1,
    t2ScoreSet1,
    t1ScoreSet2,
    t2ScoreSet2,
    t1ScoreSet3,
    t2ScoreSet3,
    p1,
    p2,
    p3,
    p4,
    members.length,
  ]);

  // Preview ELO calculation
  const eloPreview = useMemo(() => {
    if (!isValidMatch || !p1 || !p2 || !p3 || !p4) return null;
    try {
      const isRanking = matchType === 'ranking';
      return calculate2v2Elo(p1, p2, p3, p4, winnerTeam, team1Scores, team2Scores, isRanking);
    } catch (e) {
      console.error('Error calculating ELO preview:', e);
      return null;
    }
  }, [isValidMatch, p1, p2, p3, p4, winnerTeam, team1Scores, team2Scores, matchType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidMatch || !p1 || !p2 || !p3 || !p4 || !eloPreview) return;

    try {
      const isRanking = matchType === 'ranking';
      const newMatch: Match = {
        id: `match_${Date.now()}`,
        match_type: matchType,
        team1_player1_id: p1.id,
        team1_player2_id: p2.id,
        team2_player1_id: p3.id,
        team2_player2_id: p4.id,
        team1_name: `${p1.nickname || p1.full_name} & ${p2.nickname || p2.full_name}`,
        team2_name: `${p3.nickname || p3.full_name} & ${p4.nickname || p4.full_name}`,
        format: format,
        team1_scores: team1Scores,
        team2_scores: team2Scores,
        winner_team: winnerTeam,
        played_at: new Date().toISOString(),
        court_name: courtName || 'Sân 1 - Sân Dũng/Vân Anh',
        status: 'completed',
        elo_changes: isRanking ? eloPreview.eloChanges : undefined,
      };

      // Always save updated member stats (wins, losses, streak, and elo/dupr if ranking)
      onSaveMatch(newMatch, eloPreview.updatedMembers);
      setSavedMatchSummary(newMatch);
      setIsSuccess(true);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }
    } catch (err) {
      console.error('Error saving match:', err);
    }
  };

  const handleNextMatch = () => {
    setIsSuccess(false);
    setSavedMatchSummary(null);
    if (format === '1_set_15') {
      setT1ScoreSet1(15);
      setT2ScoreSet1(11);
    } else {
      setT1ScoreSet1(11);
      setT2ScoreSet1(9);
      setT1ScoreSet2(11);
      setT2ScoreSet2(8);
      setT1ScoreSet3(0);
      setT2ScoreSet3(0);
    }
  };

  const handleApplyPreset = (s1: number, s2: number) => {
    if (format === '1_set_15') {
      setT1ScoreSet1(s1);
      setT2ScoreSet1(s2);
    } else {
      setT1ScoreSet1(s1);
      setT2ScoreSet1(s2);
      setT1ScoreSet2(s1);
      setT2ScoreSet2(s2 > 2 ? s2 - 2 : s2);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl p-5 sm:p-7 bg-white dark:bg-pickle-card rounded-3xl shadow-2xl border border-slate-200 dark:border-pickle-border max-h-[92vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-pickle-surface rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {members.length < 4 ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Cần Ít Nhất 4 Thành Viên Để Đấu 2v2
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hiện tại danh sách CLB chưa đủ 4 vận động viên. Vui lòng thêm thành viên vào CLB trước khi ghi nhận trận đấu.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-pickle-lime text-pickle-dark font-bold text-xs rounded-xl"
            >
              Đóng
            </button>
          </div>
        ) : isSuccess && savedMatchSummary ? (
          /* Success Screen */
          <div className="text-center py-6 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white">
                Ghi Nhận Trận Đấu Thành Công! 🏆
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {matchType === 'ranking'
                  ? 'Đã tự động tính toán ELO và cập nhật DUPR cho 4 vận động viên.'
                  : 'Trận giao lưu đã được ghi nhận vào lịch sử thi đấu CLB.'}
              </p>
            </div>

            {/* Match Result Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-pickle-border max-w-md mx-auto text-left space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>📍 {savedMatchSummary.court_name}</span>
                <span className="font-mono">
                  {new Date(savedMatchSummary.played_at).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-y border-slate-200/80 dark:border-pickle-border/80">
                <div
                  className={`flex-1 ${
                    savedMatchSummary.winner_team === 1
                      ? 'font-bold text-pickle-600 dark:text-pickle-lime'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs block">{savedMatchSummary.team1_name}</span>
                  {savedMatchSummary.winner_team === 1 && (
                    <span className="text-[10px] text-amber-500 font-extrabold uppercase">
                      Thắng Trận 🏆
                    </span>
                  )}
                </div>

                <div className="px-4 text-center">
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {savedMatchSummary.team1_scores.join(' / ')} - {savedMatchSummary.team2_scores.join(' / ')}
                  </span>
                </div>

                <div
                  className={`flex-1 text-right ${
                    savedMatchSummary.winner_team === 2
                      ? 'font-bold text-pickle-coral'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs block">{savedMatchSummary.team2_name}</span>
                  {savedMatchSummary.winner_team === 2 && (
                    <span className="text-[10px] text-amber-500 font-extrabold uppercase">
                      Thắng Trận 🏆
                    </span>
                  )}
                </div>
              </div>

              {savedMatchSummary.elo_changes && savedMatchSummary.elo_changes.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono">
                  {savedMatchSummary.elo_changes.map((c) => {
                    const m = members.find((x) => x.id === c.player_id);
                    const isPlus = (Number(c.elo_delta) || 0) >= 0;
                    return (
                      <div key={c.player_id} className="flex justify-between px-2 py-1 rounded bg-white dark:bg-pickle-card">
                        <span className="truncate max-w-[100px]">{m?.nickname || m?.full_name || 'VĐV'}:</span>
                        <span className={`font-bold ${isPlus ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isPlus ? `+${c.elo_delta}` : c.elo_delta} ({c.new_elo})
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleNextMatch}
                className="px-5 py-2.5 text-xs font-bold bg-slate-100 dark:bg-pickle-surface text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                + Ghi Trận Tiếp Theo
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-black bg-pickle-lime text-pickle-dark hover:bg-pickle-400 rounded-xl shadow-lg shadow-pickle-lime/25 transition-all"
              >
                Đóng & Xem Bảng Xếp Hạng
              </button>
            </div>
          </div>
        ) : (
          /* Form Entry Screen */
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-gradient-to-tr from-pickle-coral to-amber-500 text-white rounded-2xl shadow-md shadow-pickle-coral/20 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black font-display text-slate-900 dark:text-white">
                  Ghi Nhận Kết Quả Trận Đấu 2v2
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chọn 4 vận động viên, nhập tỉ số – hệ thống sẽ tự động tính điểm ELO và cập nhật DUPR
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Match Mode & Format Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-pickle-border/80">
                {/* Match Type */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Loại Trận Đấu
                  </label>
                  <select
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value as 'ranking' | 'casual')}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-pickle-lime"
                  >
                    <option value="ranking">⚡ Đấu Xếp Hạng (Tính ELO & DUPR)</option>
                    <option value="casual">🤝 Giao Lưu Thường (Không đổi ELO)</option>
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Thể Thức
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as MatchFormat)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-pickle-lime"
                  >
                    <option value="1_set_15">1 Set Chạm 15 Điểm</option>
                    <option value="3_sets_11">3 Set Chạm 11 Điểm (Thắng 2)</option>
                  </select>
                </div>

                {/* Court Name */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Sân Thi Đấu
                  </label>
                  <input
                    type="text"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    placeholder="VD: Sân 1 - Sân Dũng/Vân Anh"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pickle-lime"
                  />
                </div>
              </div>

              {/* Teams Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Team 1 (A) */}
                <div
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    winnerTeam === 1 && !isTied
                      ? 'border-pickle-lime bg-pickle-lime/5 dark:bg-pickle-lime/10 shadow-lg shadow-pickle-lime/10'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-pickle-surface/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-pickle-600 dark:text-pickle-lime flex items-center gap-1">
                      <span>🏸 CẶP ĐÔI 1 (ĐỘI A)</span>
                    </span>
                    {winnerTeam === 1 && !isTied && (
                      <span className="px-2 py-0.5 rounded-full bg-pickle-lime text-pickle-dark font-black text-[10px] uppercase shadow-sm">
                        Thắng Trận 🏆
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        VĐV 1 (Bên Trái)
                      </label>
                      <select
                        value={team1P1 || p1?.id || ''}
                        onChange={(e) => setTeam1P1(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pickle-lime font-medium"
                      >
                        {members.map((m) => (
                          <option
                            key={m.id}
                            value={m.id}
                            disabled={m.id === team1P2 || m.id === team2P1 || m.id === team2P2}
                          >
                            {m.full_name || 'VĐV'} ({m.nickname || 'Pickler'}) - DUPR{' '}
                            {Number(m.dupr_rating || 3.0).toFixed(2)}{' '}
                            {m.id === team1P2 || m.id === team2P1 || m.id === team2P2 ? '(Đã chọn)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        VĐV 2 (Bên Phải)
                      </label>
                      <select
                        value={team1P2 || p2?.id || ''}
                        onChange={(e) => setTeam1P2(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pickle-lime font-medium"
                      >
                        {members.map((m) => (
                          <option
                            key={m.id}
                            value={m.id}
                            disabled={m.id === team1P1 || m.id === team2P1 || m.id === team2P2}
                          >
                            {m.full_name || 'VĐV'} ({m.nickname || 'Pickler'}) - DUPR{' '}
                            {Number(m.dupr_rating || 3.0).toFixed(2)}{' '}
                            {m.id === team1P1 || m.id === team2P1 || m.id === team2P2 ? '(Đã chọn)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Team 2 (B) */}
                <div
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    winnerTeam === 2 && !isTied
                      ? 'border-pickle-coral bg-pickle-coral/5 dark:bg-pickle-coral/10 shadow-lg shadow-pickle-coral/10'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-pickle-surface/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-pickle-coral flex items-center gap-1">
                      <span>🏸 CẶP ĐÔI 2 (ĐỘI B)</span>
                    </span>
                    {winnerTeam === 2 && !isTied && (
                      <span className="px-2 py-0.5 rounded-full bg-pickle-coral text-white font-black text-[10px] uppercase shadow-sm">
                        Thắng Trận 🏆
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        VĐV 1 (Bên Trái)
                      </label>
                      <select
                        value={team2P1 || p3?.id || ''}
                        onChange={(e) => setTeam2P1(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pickle-coral font-medium"
                      >
                        {members.map((m) => (
                          <option
                            key={m.id}
                            value={m.id}
                            disabled={m.id === team1P1 || m.id === team1P2 || m.id === team2P2}
                          >
                            {m.full_name || 'VĐV'} ({m.nickname || 'Pickler'}) - DUPR{' '}
                            {Number(m.dupr_rating || 3.0).toFixed(2)}{' '}
                            {m.id === team1P1 || m.id === team1P2 || m.id === team2P2 ? '(Đã chọn)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        VĐV 2 (Bên Phải)
                      </label>
                      <select
                        value={team2P2 || p4?.id || ''}
                        onChange={(e) => setTeam2P2(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pickle-coral font-medium"
                      >
                        {members.map((m) => (
                          <option
                            key={m.id}
                            value={m.id}
                            disabled={m.id === team1P1 || m.id === team1P2 || m.id === team2P1}
                          >
                            {m.full_name || 'VĐV'} ({m.nickname || 'Pickler'}) - DUPR{' '}
                            {Number(m.dupr_rating || 3.0).toFixed(2)}{' '}
                            {m.id === team1P1 || m.id === team1P2 || m.id === team2P1 ? '(Đã chọn)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scores Input Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Tỉ Số Trận Đấu ({format === '1_set_15' ? '1 Set Chạm 15' : '3 Set Chạm 11'})
                  </h4>
                  {/* Preset quick scores */}
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-slate-400">Chọn nhanh:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(15, 11)}
                      className="px-2 py-0.5 rounded bg-white dark:bg-pickle-card border hover:border-pickle-lime text-slate-700 dark:text-slate-300 font-mono font-bold"
                    >
                      15-11
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(15, 13)}
                      className="px-2 py-0.5 rounded bg-white dark:bg-pickle-card border hover:border-pickle-lime text-slate-700 dark:text-slate-300 font-mono font-bold"
                    >
                      15-13
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(11, 15)}
                      className="px-2 py-0.5 rounded bg-white dark:bg-pickle-card border hover:border-pickle-coral text-slate-700 dark:text-slate-300 font-mono font-bold"
                    >
                      11-15
                    </button>
                  </div>
                </div>

                {format === '1_set_15' ? (
                  <div className="flex items-center justify-center gap-6 py-2">
                    {/* Team 1 Score */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setT1ScoreSet1((v) => Math.max(0, (Number(v) || 0) - 1))}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-pickle-card border flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-center">
                        <span className="text-[11px] font-bold text-pickle-600 dark:text-pickle-lime block mb-1">
                          Đội 1
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="35"
                          value={t1ScoreSet1}
                          onChange={(e) => setT1ScoreSet1(parseInt(e.target.value, 10) || 0)}
                          className="w-16 h-14 text-2xl font-black text-center rounded-xl bg-white dark:bg-pickle-card border-2 border-pickle-lime text-slate-900 dark:text-white font-mono shadow-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setT1ScoreSet1((v) => Math.min(35, (Number(v) || 0) + 1))}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-pickle-card border flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-2xl font-black text-slate-300 dark:text-slate-600">-</span>

                    {/* Team 2 Score */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setT2ScoreSet1((v) => Math.max(0, (Number(v) || 0) - 1))}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-pickle-card border flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-center">
                        <span className="text-[11px] font-bold text-pickle-coral block mb-1">
                          Đội 2
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="35"
                          value={t2ScoreSet1}
                          onChange={(e) => setT2ScoreSet1(parseInt(e.target.value, 10) || 0)}
                          className="w-16 h-14 text-2xl font-black text-center rounded-xl bg-white dark:bg-pickle-card border-2 border-pickle-coral text-slate-900 dark:text-white font-mono shadow-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setT2ScoreSet1((v) => Math.min(35, (Number(v) || 0) + 1))}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-pickle-card border flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 3 Sets 11 Points */
                  <div className="grid grid-cols-3 gap-3">
                    {/* Set 1 */}
                    <div className="p-3 bg-white dark:bg-pickle-card rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Set 1</span>
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          value={t1ScoreSet1}
                          onChange={(e) => setT1ScoreSet1(parseInt(e.target.value, 10) || 0)}
                          className="w-11 h-10 text-center font-black font-mono rounded-lg bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-base"
                        />
                        <span className="font-bold text-slate-400">-</span>
                        <input
                          type="number"
                          value={t2ScoreSet1}
                          onChange={(e) => setT2ScoreSet1(parseInt(e.target.value, 10) || 0)}
                          className="w-11 h-10 text-center font-black font-mono rounded-lg bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-base"
                        />
                      </div>
                    </div>

                    {/* Set 2 */}
                    <div className="p-3 bg-white dark:bg-pickle-card rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Set 2</span>
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          value={t1ScoreSet2}
                          onChange={(e) => setT1ScoreSet2(parseInt(e.target.value, 10) || 0)}
                          className="w-11 h-10 text-center font-black font-mono rounded-lg bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-base"
                        />
                        <span className="font-bold text-slate-400">-</span>
                        <input
                          type="number"
                          value={t2ScoreSet2}
                          onChange={(e) => setT2ScoreSet2(parseInt(e.target.value, 10) || 0)}
                          className="w-11 h-10 text-center font-black font-mono rounded-lg bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-base"
                        />
                      </div>
                    </div>

                    {/* Set 3 */}
                    <div className="p-3 bg-white dark:bg-pickle-card rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Set 3 (Nếu hòa 1-1)</span>
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          value={t1ScoreSet3}
                          onChange={(e) => setT1ScoreSet3(parseInt(e.target.value, 10) || 0)}
                          className="w-11 h-10 text-center font-black font-mono rounded-lg bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-base"
                        />
                        <span className="font-bold text-slate-400">-</span>
                        <input
                          type="number"
                          value={t2ScoreSet3}
                          onChange={(e) => setT2ScoreSet3(parseInt(e.target.value, 10) || 0)}
                          className="w-11 h-10 text-center font-black font-mono rounded-lg bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-base"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ELO Preview Card (Ranking Match only) */}
              {matchType === 'ranking' && eloPreview && isValidMatch && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-pickle-lime/10 via-emerald-500/10 to-cyan-500/10 border border-pickle-lime/30 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-pickle-800 dark:text-pickle-lime">
                      <Zap className="w-4 h-4" />
                      <span>Xem Trước Thay Đổi Điểm ELO & DUPR:</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Hệ số K=32</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {eloPreview.eloChanges.map((change) => {
                      const m = members.find((x) => x.id === change.player_id);
                      const isPlus = (Number(change.elo_delta) || 0) >= 0;
                      return (
                        <div
                          key={change.player_id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-pickle-surface/80 border border-white/40 dark:border-white/5"
                        >
                          <span className="truncate max-w-[120px] font-semibold">
                            {m?.nickname || m?.full_name || 'VĐV'}:
                          </span>
                          <span
                            className={`font-mono font-bold ${
                              isPlus
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isPlus ? `+${change.elo_delta}` : change.elo_delta} ELO ({change.new_elo})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error messages */}
              {isTied && (
                <p className="text-xs text-rose-500 text-center font-bold">
                  ⚠️ Trận đấu pickleball không thể có tỉ số hòa! Vui lòng nhập tỉ số có đội thắng.
                </p>
              )}

              {new Set([p1?.id, p2?.id, p3?.id, p4?.id].filter(Boolean)).size < 4 && (
                <p className="text-xs text-rose-500 text-center font-semibold">
                  ⚠️ Vui lòng chọn 4 vận động viên khác nhau cho 2 đội!
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-pickle-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!isValidMatch}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-black bg-gradient-to-r from-pickle-lime to-pickle-400 hover:from-pickle-400 hover:to-pickle-300 text-pickle-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-pickle-lime/25 transition-all hover:scale-105 active:scale-95"
                >
                  <Trophy className="w-4 h-4" />
                  <span>{matchType === 'ranking' ? 'Lưu Kết Quả & Cập Nhật DUPR' : 'Lưu Lịch Sử Giao Lưu'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
