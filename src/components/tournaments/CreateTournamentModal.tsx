import React, { useState, useMemo } from 'react';
import { Member, Tournament, TournamentTeam } from '../../types';
import { generateGroupMatches } from '../../utils/tournamentEngine';
import { X, Trophy, Users, Shuffle, Plus, Trash2, CheckCircle2, Sparkles, Layers } from 'lucide-react';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSaveTournament: (tournament: Tournament) => void;
}

export const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  isOpen,
  onClose,
  members,
  onSaveTournament,
}) => {
  const [name, setName] = useState('Friends Autumn Cup 2026 🏆');
  const [description, setDescription] = useState('Giải đấu đôi 2v2 nội bộ CLB Friends. Vòng bảng 1 set chạm 15 điểm, Chung kết 3 set chạm 11 điểm.');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-10');

  // Groups: 1 to 10 groups
  const [numGroups, setNumGroups] = useState<number>(3); // Default 3 groups (A, B, C)
  const groupLetterList = useMemo(() => {
    return Array.from({ length: numGroups }, (_, i) => String.fromCharCode(65 + i)); // ['A', 'B', 'C'...]
  }, [numGroups]);

  // Selected participating members (club-only)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    members.slice(0, 12).map((m) => m.id)
  );

  // Pairing Mode: 'auto' | 'manual'
  const [pairingMode, setPairingMode] = useState<'auto' | 'manual'>('auto');
  const [autoDrawType, setAutoDrawType] = useState<'random' | 'balanced'>('balanced');

  // Manual Pairs State: Array<{ id: string, p1: string, p2: string, team_name: string, group_id: string }>
  const [manualPairs, setManualPairs] = useState<
    Array<{ id: string; p1: string; p2: string; team_name: string; group_id: string }>
  >([]);

  if (!isOpen) return null;

  const toggleMemberSelection = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter((x) => x !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleSelectAllMembers = () => {
    setSelectedMemberIds(members.map((m) => m.id));
  };

  const handleClearMembers = () => {
    setSelectedMemberIds([]);
  };

  // Add a manual pair
  const handleAddManualPair = () => {
    const availableMembers = members.filter((m) => selectedMemberIds.includes(m.id));
    const p1 = availableMembers[0]?.id || members[0]?.id;
    const p2 = availableMembers[1]?.id || members[1]?.id;
    const m1 = members.find((x) => x.id === p1);
    const m2 = members.find((x) => x.id === p2);

    setManualPairs([
      ...manualPairs,
      {
        id: `pair_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        p1,
        p2,
        team_name: `${m1?.nickname || 'VĐV 1'} & ${m2?.nickname || 'VĐV 2'}`,
        group_id: groupLetterList[manualPairs.length % groupLetterList.length] || 'A',
      },
    ]);
  };

  const handleRemoveManualPair = (id: string) => {
    setManualPairs(manualPairs.filter((p) => p.id !== id));
  };

  const handleUpdateManualPair = (
    id: string,
    field: 'p1' | 'p2' | 'team_name' | 'group_id',
    val: string
  ) => {
    setManualPairs(
      manualPairs.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: val };
          if (field === 'p1' || field === 'p2') {
            const m1 = members.find((x) => x.id === (field === 'p1' ? val : p.p1));
            const m2 = members.find((x) => x.id === (field === 'p2' ? val : p.p2));
            updated.team_name = `${m1?.nickname || 'VĐV 1'} & ${m2?.nickname || 'VĐV 2'}`;
          }
          return updated;
        }
        return p;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tournamentId = `tour_${Date.now()}`;
    let teams: TournamentTeam[] = [];

    if (pairingMode === 'manual') {
      if (manualPairs.length < 2) {
        alert('Vui lòng tạo ít nhất 2 cặp đấu thủ công!');
        return;
      }
      teams = manualPairs.map((p, idx) => ({
        id: `team_${tournamentId}_${idx + 1}`,
        tournament_id: tournamentId,
        team_name: p.team_name,
        player1_id: p.p1,
        player2_id: p.p2,
        group_id: p.group_id,
        seed: idx + 1,
        stats: {
          matches_played: 0,
          wins: 0,
          losses: 0,
          sets_won: 0,
          sets_lost: 0,
          points_scored: 0,
          points_conceded: 0,
          points_diff: 0,
          group_rank: 1,
        },
      }));
    } else {
      // Auto Draw pairing
      const selectedMembers = members.filter((m) => selectedMemberIds.includes(m.id));
      if (selectedMembers.length < 4 || selectedMembers.length % 2 !== 0) {
        alert('Vui lòng chọn số lượng thành viên chẵn (tối thiểu 4 thành viên) để ghép cặp đôi 2v2!');
        return;
      }

      let pairedMembers: Array<{ p1: Member; p2: Member }> = [];

      if (autoDrawType === 'random') {
        const shuffled = [...selectedMembers].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffled.length; i += 2) {
          pairedMembers.push({ p1: shuffled[i], p2: shuffled[i + 1] });
        }
      } else {
        // Balanced Seeding: Pair top DUPR with lower DUPR
        const sorted = [...selectedMembers].sort((a, b) => b.dupr_rating - a.dupr_rating);
        const half = sorted.length / 2;
        for (let i = 0; i < half; i++) {
          pairedMembers.push({
            p1: sorted[i],
            p2: sorted[sorted.length - 1 - i],
          });
        }
      }

      // Distribute pairs across groups evenly
      teams = pairedMembers.map((pair, idx) => {
        const groupId = groupLetterList[idx % groupLetterList.length];
        return {
          id: `team_${tournamentId}_${idx + 1}`,
          tournament_id: tournamentId,
          team_name: `${pair.p1.nickname} & ${pair.p2.nickname}`,
          player1_id: pair.p1.id,
          player2_id: pair.p2.id,
          group_id: groupId,
          seed: idx + 1,
          stats: {
            matches_played: 0,
            wins: 0,
            losses: 0,
            sets_won: 0,
            sets_lost: 0,
            points_scored: 0,
            points_conceded: 0,
            points_diff: 0,
            group_rank: 1,
          },
        };
      });
    }

    // Generate group matches (1 set chạm 15 điểm)
    const groupMatches = generateGroupMatches(tournamentId, teams, groupLetterList);

    const newTournament: Tournament = {
      id: tournamentId,
      name,
      description,
      banner_url: bannerUrl,
      start_date: startDate,
      end_date: endDate,
      status: 'group_stage',
      format: 'group_and_knockout',
      num_groups: numGroups,
      group_names: groupLetterList,
      teams,
      group_matches: groupMatches,
      created_at: new Date().toISOString(),
    };

    onSaveTournament(newTournament);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl p-6 bg-white dark:bg-pickle-card rounded-3xl shadow-2xl border border-slate-200 dark:border-pickle-border max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-pickle-lime text-pickle-dark rounded-2xl shadow-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Tạo Giải Đấu Đôi 2v2 Mới
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thi đấu từ Vòng Bảng (1-10 Bảng) $\rightarrow$ Tứ Kết $\rightarrow$ Bán Kết $\rightarrow$ Chung Kết
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tournament General Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tên Giải Đấu *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Friends Autumn Cup 2026"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pickle-lime outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ảnh Banner (URL)
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pickle-lime outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Số Bảng Đấu (1 đến 10 Bảng)
              </label>
              <select
                value={numGroups}
                onChange={(e) => setNumGroups(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} Bảng ({Array.from({ length: num }, (_, i) => String.fromCharCode(65 + i)).join(', ')})
                    {num % 2 !== 0 && num > 1 ? ' (Xét Đội Thứ 3 Tốt Nhất)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ngày Bắt Đầu
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ngày Bế Mạc
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Scoring Rules Reminder Alert */}
          <div className="p-3.5 rounded-2xl bg-pickle-lime/10 border border-pickle-lime/30 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-pickle-800 dark:text-pickle-lime">
              <Sparkles className="w-4 h-4" />
              <span>Quy chuẩn điểm số tự động áp dụng:</span>
            </div>
            <p>• Vòng bảng $\rightarrow$ Tứ kết $\rightarrow$ Bán kết: <strong>1 set chạm 15 điểm</strong>.</p>
            <p>• Trận Chung kết: <strong>3 set thắng 2 chạm 11 điểm (Best of 3)</strong>.</p>
          </div>

          {/* Member Selection (CLB-Only) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-pickle-500 dark:text-pickle-lime" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Tuyển chọn thành viên tham gia ({selectedMemberIds.length} VĐV đã chọn)
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllMembers}
                  className="text-[11px] text-pickle-600 dark:text-pickle-lime font-bold hover:underline"
                >
                  Chọn tất cả
                </button>
                <span className="text-slate-400">•</span>
                <button
                  type="button"
                  onClick={handleClearMembers}
                  className="text-[11px] text-slate-400 hover:text-rose-500"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {members.map((m) => {
                const isSelected = selectedMemberIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleMemberSelection(m.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-pickle-lime/15 border-pickle-lime text-pickle-900 dark:text-white'
                        : 'bg-white dark:bg-pickle-card border-slate-200 dark:border-pickle-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={m.avatar_url} alt={m.full_name} className="w-7 h-7 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate leading-tight">{m.nickname || m.full_name}</p>
                      <p className="text-[9px] text-slate-400 font-mono">DUPR {m.dupr_rating.toFixed(2)}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-pickle-lime shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pairing Mode (Auto vs Manual) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Phương thức ghép cặp đôi 2v2
              </label>
              <div className="flex bg-slate-100 dark:bg-pickle-surface p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPairingMode('auto')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pairingMode === 'auto'
                      ? 'bg-pickle-lime text-pickle-dark shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ⚡ Ghép Cặp Tự Động
                </button>
                <button
                  type="button"
                  onClick={() => setPairingMode('manual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pairingMode === 'manual'
                      ? 'bg-pickle-lime text-pickle-dark shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ✍️ Ghép Cặp Thủ Công
                </button>
              </div>
            </div>

            {pairingMode === 'auto' ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Thuật toán bốc thăm:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${autoDrawType === 'balanced' ? 'border-pickle-lime bg-pickle-lime/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-pickle-card'}`}>
                    <input
                      type="radio"
                      name="drawType"
                      checked={autoDrawType === 'balanced'}
                      onChange={() => setAutoDrawType('balanced')}
                      className="hidden"
                    />
                    <div className="w-8 h-8 rounded-lg bg-pickle-lime/20 text-pickle-lime flex items-center justify-center font-bold">
                      ⚖️
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Cân Bằng Hạt Giống (DUPR)</span>
                      <span className="text-[10px] text-slate-400">Ghép VĐV DUPR cao với DUPR thấp tạo sự cân bằng</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${autoDrawType === 'random' ? 'border-pickle-lime bg-pickle-lime/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-pickle-card'}`}>
                    <input
                      type="radio"
                      name="drawType"
                      checked={autoDrawType === 'random'}
                      onChange={() => setAutoDrawType('random')}
                      className="hidden"
                    />
                    <div className="w-8 h-8 rounded-lg bg-pickle-coral/20 text-pickle-coral flex items-center justify-center font-bold">
                      🎲
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Bốc Thăm Ngẫu Nhiên</span>
                      <span className="text-[10px] text-slate-400">Trộn ngẫu nhiên hoàn toàn các thành viên</span>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              /* Manual Pairing Table */
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Danh Sách Cặp Đấu Thủ Công ({manualPairs.length} cặp)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddManualPair}
                    className="px-3 py-1.5 bg-pickle-lime text-pickle-dark hover:bg-pickle-400 font-bold text-xs rounded-xl shadow-sm"
                  >
                    + Thêm Cặp Đấu
                  </button>
                </div>

                {manualPairs.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {manualPairs.map((pair, idx) => (
                      <div
                        key={pair.id}
                        className="grid grid-cols-12 gap-2 p-2.5 rounded-xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-slate-800 items-center text-xs"
                      >
                        <span className="col-span-1 font-bold text-slate-400 text-center">#{idx + 1}</span>
                        
                        <div className="col-span-3">
                          <select
                            value={pair.p1}
                            onChange={(e) => handleUpdateManualPair(pair.id, 'p1', e.target.value)}
                            className="w-full p-1.5 rounded-lg bg-slate-50 dark:bg-pickle-surface border text-[11px] outline-none truncate"
                          >
                            {members.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.nickname} (DUPR {m.dupr_rating.toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-3">
                          <select
                            value={pair.p2}
                            onChange={(e) => handleUpdateManualPair(pair.id, 'p2', e.target.value)}
                            className="w-full p-1.5 rounded-lg bg-slate-50 dark:bg-pickle-surface border text-[11px] outline-none truncate"
                          >
                            {members.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.nickname} (DUPR {m.dupr_rating.toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-3">
                          <input
                            type="text"
                            value={pair.team_name}
                            onChange={(e) => handleUpdateManualPair(pair.id, 'team_name', e.target.value)}
                            className="w-full p-1.5 rounded-lg bg-slate-50 dark:bg-pickle-surface border text-[11px] outline-none truncate"
                          />
                        </div>

                        <div className="col-span-1">
                          <select
                            value={pair.group_id}
                            onChange={(e) => handleUpdateManualPair(pair.id, 'group_id', e.target.value)}
                            className="w-full p-1.5 rounded-lg bg-slate-50 dark:bg-pickle-surface border text-[11px] font-bold outline-none"
                          >
                            {groupLetterList.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveManualPair(pair.id)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4 italic">
                    Chưa có cặp đấu nào. Bấm "+ Thêm Cặp Đấu" để ghép cặp thủ công.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-pickle-border">
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
              Tạo Giải & Sinh Lịch Vòng Bảng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
