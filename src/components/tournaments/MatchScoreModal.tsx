import React, { useState, useEffect } from 'react';
import { Match, Member, MatchFormat } from '../../types';
import { calculate2v2Elo, rollbackMatchElo } from '../../utils/eloCalculator';
import { X, Award, Zap, Trophy } from 'lucide-react';

interface MatchScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  members: Member[];
  onSaveScore: (updatedMatch: Match, updatedMembers: Member[]) => void;
}

export const MatchScoreModal: React.FC<MatchScoreModalProps> = ({
  isOpen,
  onClose,
  match,
  members,
  onSaveScore,
}) => {
  const [format, setFormat] = useState<MatchFormat>('1_set_15');
  const [t1Score1, setT1Score1] = useState(15);
  const [t2Score1, setT2Score1] = useState(12);

  const [t1Score2, setT1Score2] = useState(11);
  const [t2Score2, setT2Score2] = useState(9);

  const [t1Score3, setT1Score3] = useState(0);
  const [t2Score3, setT2Score3] = useState(0);

  useEffect(() => {
    if (match) {
      setFormat(match.format || (match.tournament_stage === 'final' ? '3_sets_11' : '1_set_15'));
      if (match.team1_scores && match.team1_scores.length > 0) {
        setT1Score1(match.team1_scores[0] ?? 15);
        setT2Score1(match.team2_scores[0] ?? 12);
        setT1Score2(match.team1_scores[1] ?? 11);
        setT2Score2(match.team2_scores[1] ?? 9);
        setT1Score3(match.team1_scores[2] ?? 0);
        setT2Score3(match.team2_scores[2] ?? 0);
      } else {
        if (match.tournament_stage === 'final') {
          setT1Score1(11);
          setT2Score1(8);
          setT1Score2(11);
          setT2Score2(7);
        } else {
          setT1Score1(15);
          setT2Score1(11);
        }
      }
    }
  }, [match, isOpen]);

  if (!isOpen || !match) return null;

  // If match was already completed, roll back its stats from members before calculating preview
  let baseMembers = members;
  if (match.status === 'completed' && match.elo_changes && match.elo_changes.length > 0) {
    baseMembers = rollbackMatchElo(match, members);
  }

  const p1 = baseMembers.find((m) => m.id === match.team1_player1_id);
  const p2 = baseMembers.find((m) => m.id === match.team1_player2_id);
  const p3 = baseMembers.find((m) => m.id === match.team2_player1_id);
  const p4 = baseMembers.find((m) => m.id === match.team2_player2_id);

  // Compute winner and score arrays
  let team1Scores: number[] = [];
  let team2Scores: number[] = [];
  let winnerTeam: 1 | 2 = 1;

  if (format === '1_set_15') {
    team1Scores = [t1Score1];
    team2Scores = [t2Score1];
    winnerTeam = t1Score1 >= t2Score1 ? 1 : 2;
  } else {
    team1Scores = [t1Score1, t1Score2];
    team2Scores = [t2Score1, t2Score2];
    let t1Wins = 0;
    let t2Wins = 0;
    if (t1Score1 > t2Score1) t1Wins++; else t2Wins++;
    if (t1Score2 > t2Score2) t1Wins++; else t2Wins++;

    if (t1Wins === t2Wins) {
      team1Scores.push(t1Score3);
      team2Scores.push(t2Score3);
      if (t1Score3 > t2Score3) t1Wins++; else t2Wins++;
    }
    winnerTeam = t1Wins > t2Wins ? 1 : 2;
  }

  const hasAllPlayers = Boolean(p1 && p2 && p3 && p4);

  let eloPreview = null;
  if (hasAllPlayers && p1 && p2 && p3 && p4) {
    eloPreview = calculate2v2Elo(p1, p2, p3, p4, winnerTeam, team1Scores, team2Scores, true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;

    const updatedMatch: Match = {
      ...match,
      format,
      team1_scores: team1Scores,
      team2_scores: team2Scores,
      winner_team: winnerTeam,
      status: 'completed',
      elo_changes: eloPreview ? eloPreview.eloChanges : match.elo_changes,
      played_at: new Date().toISOString(),
    };

    onSaveScore(updatedMatch, eloPreview ? eloPreview.updatedMembers : []);
    onClose();
  };

  const getStageTitle = (stage?: string) => {
    switch (stage) {
      case 'group': return `Trận Vòng Bảng (Bảng ${match.group_name || 'A'})`;
      case 'quarter': return `Trận Tứ Kết (${match.bracket_slot || 'QF'})`;
      case 'semi': return `Trận Bán Kết (${match.bracket_slot || 'SF'})`;
      case 'final': return 'Trận CHUNG KẾT 🏆';
      case 'bronze': return 'Trận Tranh Hạng Ba 🥉';
      default: return 'Cập Nhật Tỉ Số';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 bg-white dark:bg-pickle-card rounded-3xl shadow-2xl border border-slate-200 dark:border-pickle-border max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-pickle-lime/20 text-pickle-lime rounded-2xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-pickle-lime">
              {getStageTitle(match.tournament_stage)}
            </span>
            <h3 className="text-xl font-black font-display text-slate-900 dark:text-white">
              Cập Nhật Điểm Số Trận Đấu
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Format indicator note */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-pickle-surface text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>Quy chuẩn điểm:</span>
            <span className="px-2 py-0.5 rounded-lg bg-pickle-lime/20 text-pickle-700 dark:text-pickle-lime font-bold">
              {format === '1_set_15' ? '1 Set Chạm 15 Điểm' : '3 Set Thắng 2 Chạm 11 (Bo3)'}
            </span>
          </div>

          {/* Teams Header */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border-2 text-center transition-all ${winnerTeam === 1 ? 'border-pickle-lime bg-pickle-lime/10' : 'border-slate-200 dark:border-slate-800'}`}>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Đội 1</span>
              <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {match.team1_name || `${p1?.nickname || 'VĐV 1'} & ${p2?.nickname || 'VĐV 2'}`}
              </p>
              {winnerTeam === 1 && (
                <span className="text-[10px] font-black text-amber-500 uppercase">Thắng Trận 🏆</span>
              )}
            </div>

            <div className={`p-3 rounded-xl border-2 text-center transition-all ${winnerTeam === 2 ? 'border-pickle-coral bg-pickle-coral/10' : 'border-slate-200 dark:border-slate-800'}`}>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Đội 2</span>
              <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {match.team2_name || `${p3?.nickname || 'VĐV 3'} & ${p4?.nickname || 'VĐV 4'}`}
              </p>
              {winnerTeam === 2 && (
                <span className="text-[10px] font-black text-amber-500 uppercase">Thắng Trận 🏆</span>
              )}
            </div>
          </div>

          {/* Score Inputs */}
          {format === '1_set_15' ? (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-3">
                Tỉ số Set 1 (Chạm 15)
              </span>
              <div className="flex items-center justify-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={t1Score1}
                  onChange={(e) => setT1Score1(parseInt(e.target.value, 10) || 0)}
                  className="w-16 h-14 text-2xl font-black text-center rounded-xl bg-white dark:bg-pickle-card border-2 border-pickle-lime font-mono text-slate-900 dark:text-white"
                />
                <span className="text-2xl font-black text-slate-400">-</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={t2Score1}
                  onChange={(e) => setT2Score1(parseInt(e.target.value, 10) || 0)}
                  className="w-16 h-14 text-2xl font-black text-center rounded-xl bg-white dark:bg-pickle-card border-2 border-pickle-coral font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block text-center">
                Tỉ số 3 Set Chạm 11 (Chung Kết)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {/* Set 1 */}
                <div className="p-2.5 bg-white dark:bg-pickle-card rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Set 1</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      value={t1Score1}
                      onChange={(e) => setT1Score1(parseInt(e.target.value, 10) || 0)}
                      className="w-10 h-9 text-center font-bold font-mono rounded-lg bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-sm"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={t2Score1}
                      onChange={(e) => setT2Score1(parseInt(e.target.value, 10) || 0)}
                      className="w-10 h-9 text-center font-bold font-mono rounded-lg bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-sm"
                    />
                  </div>
                </div>

                {/* Set 2 */}
                <div className="p-2.5 bg-white dark:bg-pickle-card rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Set 2</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      value={t1Score2}
                      onChange={(e) => setT1Score2(parseInt(e.target.value, 10) || 0)}
                      className="w-10 h-9 text-center font-bold font-mono rounded-lg bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-sm"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={t2Score2}
                      onChange={(e) => setT2Score2(parseInt(e.target.value, 10) || 0)}
                      className="w-10 h-9 text-center font-bold font-mono rounded-lg bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-sm"
                    />
                  </div>
                </div>

                {/* Set 3 */}
                <div className="p-2.5 bg-white dark:bg-pickle-card rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Set 3</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      value={t1Score3}
                      onChange={(e) => setT1Score3(parseInt(e.target.value, 10) || 0)}
                      className="w-10 h-9 text-center font-bold font-mono rounded-lg bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-sm"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={t2Score3}
                      onChange={(e) => setT2Score3(parseInt(e.target.value, 10) || 0)}
                      className="w-10 h-9 text-center font-bold font-mono rounded-lg bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ELO Delta info */}
          {eloPreview && hasAllPlayers && (
            <div className="p-3 bg-pickle-lime/10 border border-pickle-lime/30 rounded-xl text-xs">
              <div className="flex items-center gap-1 font-bold text-pickle-lime mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Cập nhật ELO & DUPR sau trận:</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                {eloPreview.eloChanges.map((c) => {
                  const m = members.find((x) => x.id === c.player_id);
                  const isPlus = c.elo_delta >= 0;
                  return (
                    <div key={c.player_id} className="flex justify-between">
                      <span className="truncate max-w-[120px]">{m?.nickname || 'VĐV'}:</span>
                      <span className={`font-mono font-bold ${isPlus ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPlus ? `+${c.elo_delta}` : c.elo_delta}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-pickle-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold bg-pickle-lime text-pickle-dark hover:bg-pickle-400 rounded-xl shadow-lg shadow-pickle-lime/20"
            >
              Xác Nhận Tỉ Số
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
