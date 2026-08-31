import React, { useState } from 'react';
import { Member } from '../../types';
import { MemberCard } from './MemberCard';
import { DigitalMemberCardModal } from './DigitalMemberCardModal';
import { MemberFormModal } from './MemberFormModal';
import { useAuth } from '../../context/AuthContext';
import { Search, UserPlus, SlidersHorizontal, Users, Sparkles } from 'lucide-react';

interface MemberListProps {
  members: Member[];
  onSaveMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  onSaveMember,
  onDeleteMember,
}) => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [duprFilter, setDuprFilter] = useState<'all' | 'high' | 'mid' | 'beginner'>('all');
  const [handFilter, setHandFilter] = useState<'all' | 'right' | 'left'>('all');
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Filter logic
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.paddle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDupr =
      duprFilter === 'all'
        ? true
        : duprFilter === 'high'
        ? m.dupr_rating >= 4.0
        : duprFilter === 'mid'
        ? m.dupr_rating >= 3.5 && m.dupr_rating < 4.0
        : m.dupr_rating < 3.5;

    const matchesHand =
      handFilter === 'all' ? true : m.hand === handFilter;

    return matchesSearch && matchesDupr && matchesHand;
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-6 h-6 text-pickle-500 dark:text-pickle-lime" />
            <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              Thành Viên CLB Friends
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-pickle-lime/20 text-pickle-700 dark:text-pickle-lime text-xs font-black font-mono">
              {filteredMembers.length} / {members.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Danh sách vợt thủ chính thức, thông số DUPR, ELO và thẻ thành viên số QR
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-pickle-lime text-pickle-dark hover:bg-pickle-400 font-bold text-xs rounded-xl shadow-lg shadow-pickle-lime/20 transition-all hover:scale-105 active:scale-95 self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Thành Viên Mới</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-sm flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, biệt danh, loại vợt..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pickle-lime outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* DUPR Level Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={duprFilter}
            onChange={(e) => setDuprFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pickle-lime outline-none font-medium"
          >
            <option value="all">Tất cả trình độ DUPR</option>
            <option value="high">DUPR Cao (≥ 4.0+ Pro)</option>
            <option value="mid">DUPR Khá (3.5 - 3.95)</option>
            <option value="beginner">DUPR Mới (2.5 - 3.45)</option>
          </select>

          <select
            value={handFilter}
            onChange={(e) => setHandFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pickle-lime outline-none font-medium"
          >
            <option value="all">Tất cả tay thuận</option>
            <option value="right">Tay Phải</option>
            <option value="left">Tay Trái</option>
          </select>
        </div>
      </div>

      {/* Member Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onOpenCard={(m) => setSelectedMemberForCard(m)}
              onEdit={handleOpenEdit}
              onDelete={onDeleteMember}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-pickle-card rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            Không tìm thấy thành viên nào
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc trình độ
          </p>
        </div>
      )}

      {/* Digital Pass Modal */}
      <DigitalMemberCardModal
        member={selectedMemberForCard}
        onClose={() => setSelectedMemberForCard(null)}
      />

      {/* Edit/Add Member Modal */}
      <MemberFormModal
        member={editingMember}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={onSaveMember}
      />
    </div>
  );
};
