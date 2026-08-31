import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LoginModal } from './components/layout/LoginModal';
import { HeroSection } from './components/home/HeroSection';
import { QuickStats } from './components/home/QuickStats';
import { UpcomingEvents } from './components/home/UpcomingEvents';
import { MemberList } from './components/members/MemberList';
import { LeaderboardTable } from './components/leaderboard/LeaderboardTable';
import { TournamentList } from './components/tournaments/TournamentList';
import { NewsFeed } from './components/news/NewsFeed';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { JoinClubModal } from './components/join/JoinClubModal';
import { RecordMatchModal } from './components/leaderboard/RecordMatchModal';
import { dataService } from './services/dataService';
import { useAuth } from './context/AuthContext';
import {
  Member,
  Tournament,
  Match,
  NewsPost,
  JoinRequest,
  ClubSettings,
} from './types';

export const App: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');

  // App Data States
  const [members, setMembers] = useState<Member[]>(() => dataService.getMembers());
  const [tournaments, setTournaments] = useState<Tournament[]>(() => dataService.getTournaments());
  const [matches, setMatches] = useState<Match[]>(() => dataService.getMatches());
  const [news, setNews] = useState<NewsPost[]>(() => dataService.getNews());
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(() => dataService.getJoinRequests());
  const [settings, setSettings] = useState<ClubSettings>(() => dataService.getSettings());

  // Global Modals
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isRecordMatchModalOpen, setIsRecordMatchModalOpen] = useState(false);

  // Subscribe to DataService updates
  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setMembers(dataService.getMembers());
      setTournaments(dataService.getTournaments());
      setMatches(dataService.getMatches());
      setNews(dataService.getNews());
      setJoinRequests(dataService.getJoinRequests());
      setSettings(dataService.getSettings());
    });
    return () => unsubscribe();
  }, []);

  // --- Handlers ---
  const handleSaveMember = (member: Member) => {
    dataService.saveMember(member);
  };

  const handleSaveMemberBatch = (updatedMembers: Member[]) => {
    dataService.saveMembersBatch(updatedMembers);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi CLB?')) {
      dataService.deleteMember(id);
    }
  };

  const handleSaveMatch = (match: Match, updatedMembers: Member[]) => {
    dataService.saveMatch(match);
    if (updatedMembers.length > 0) {
      dataService.saveMembersBatch(updatedMembers);
    }
  };

  const handleDeleteMatch = (matchId: string) => {
    if (confirm('Bạn có chắc muốn hủy trận đấu này? Điểm ELO của các VĐV sẽ được hoàn trả.')) {
      dataService.deleteMatch(matchId, true);
    }
  };

  const handleSaveTournament = (tournament: Tournament) => {
    dataService.saveTournament(tournament);
  };

  const handleDeleteTournament = (tournamentId: string, rollbackElo: boolean) => {
    dataService.deleteTournament(tournamentId, rollbackElo);
  };

  const handleSavePost = (post: NewsPost) => {
    dataService.saveNews(post);
  };

  const handleDeletePost = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      dataService.deleteNews(id);
    }
  };

  const handleSubmitJoinRequest = (req: JoinRequest) => {
    dataService.saveJoinRequest(req);
  };

  const handleApproveRequest = (id: string) => {
    dataService.updateJoinRequestStatus(id, 'approved');
  };

  const handleRejectRequest = (id: string) => {
    dataService.updateJoinRequestStatus(id, 'rejected');
  };

  const handleSaveSettings = (updatedSettings: ClubSettings) => {
    dataService.saveSettings(updatedSettings);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-pickle-dark text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
        onOpenRecordMatchModal={() => setIsRecordMatchModalOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab 1: Trang Chủ (Home) */}
        {activeTab === 'home' && (
          <div className="space-y-12 animate-fadeIn">
            <HeroSection
              members={members}
              tournaments={tournaments}
              setActiveTab={setActiveTab}
              onOpenJoinModal={() => setIsJoinModalOpen(true)}
              onOpenRecordMatchModal={() => setIsRecordMatchModalOpen(true)}
            />

            <QuickStats
              members={members}
              tournaments={tournaments}
              matches={matches}
            />

            <UpcomingEvents
              settings={settings}
              latestNews={news}
              setActiveTab={setActiveTab}
              onOpenJoinModal={() => setIsJoinModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 2: Thành Viên (Members) */}
        {activeTab === 'members' && (
          <div className="animate-fadeIn">
            <MemberList
              members={members}
              onSaveMember={handleSaveMember}
              onDeleteMember={handleDeleteMember}
            />
          </div>
        )}

        {/* Tab 3: Bảng Xếp Hạng (Leaderboard) */}
        {activeTab === 'leaderboard' && (
          <div className="animate-fadeIn">
            <LeaderboardTable
              members={members}
              matches={matches}
              onOpenRecordMatch={() => setIsRecordMatchModalOpen(true)}
              onDeleteMatch={handleDeleteMatch}
            />
          </div>
        )}

        {/* Tab 4: Giải Đấu (Tournaments) */}
        {activeTab === 'tournaments' && (
          <div className="animate-fadeIn">
            <TournamentList
              tournaments={tournaments}
              members={members}
              onSaveTournament={handleSaveTournament}
              onDeleteTournament={handleDeleteTournament}
              onSaveMemberBatch={handleSaveMemberBatch}
            />
          </div>
        )}

        {/* Tab 5: Bảng Tin & Gallery (News) */}
        {activeTab === 'news' && (
          <div className="animate-fadeIn">
            <NewsFeed
              news={news}
              onSavePost={handleSavePost}
              onDeletePost={handleDeletePost}
            />
          </div>
        )}

        {/* Tab 6: Quản Trị CLB (Admin Dashboard) */}
        {activeTab === 'admin' && isAdmin && (
          <div className="animate-fadeIn">
            <AdminDashboard
              members={members}
              tournaments={tournaments}
              matches={matches}
              joinRequests={joinRequests}
              settings={settings}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
              onSaveSettings={handleSaveSettings}
              setActiveTab={setActiveTab}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer settings={settings} setActiveTab={setActiveTab} />

      {/* Global Modals */}
      <LoginModal />
      <JoinClubModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSubmitRequest={handleSubmitJoinRequest}
      />
      {isRecordMatchModalOpen && (
        <RecordMatchModal
          isOpen={isRecordMatchModalOpen}
          onClose={() => setIsRecordMatchModalOpen(false)}
          members={members}
          onSaveMatch={handleSaveMatch}
        />
      )}

    </div>
  );
};
