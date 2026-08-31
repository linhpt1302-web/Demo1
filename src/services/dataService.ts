import {
  Member,
  Tournament,
  Match,
  NewsPost,
  JoinRequest,
  ClubSettings,
} from '../types';
import {
  INITIAL_MEMBERS,
  INITIAL_TOURNAMENTS,
  INITIAL_MATCHES,
  INITIAL_NEWS,
  INITIAL_JOIN_REQUESTS,
  INITIAL_SETTINGS,
} from './sampleData';
import { rollbackMatchElo } from '../utils/eloCalculator';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  MEMBERS: 'pickle_friends_members',
  TOURNAMENTS: 'pickle_friends_tournaments',
  MATCHES: 'pickle_friends_matches',
  NEWS: 'pickle_friends_news',
  JOIN_REQUESTS: 'pickle_friends_join_requests',
  SETTINGS: 'pickle_friends_settings',
};

type Listener = () => void;

class DataService {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.initLocalStorage();
    this.syncFromSupabase();
  }

  private initLocalStorage() {
    const rawMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    let shouldMigrateMembers = false;

    if (!rawMembers) {
      shouldMigrateMembers = true;
    } else {
      try {
        const parsed: Member[] = JSON.parse(rawMembers);
        const hasOldData = parsed.some((m) => m.full_name === 'Nguyễn Thành Nam' || m.full_name === 'Trần Minh Hoàng');
        const cuong = parsed.find((m) => m.full_name === 'Hoàng Mạnh Cường');
        if (hasOldData || !cuong || parsed.length < 27 || cuong.elo_points !== 1100 || (cuong.matches_played || 0) > 0) {
          shouldMigrateMembers = true;
        }
      } catch {
        shouldMigrateMembers = true;
      }
    }

    if (shouldMigrateMembers) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(INITIAL_TOURNAMENTS));
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_NEWS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)) {
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(INITIAL_TOURNAMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NEWS)) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_NEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(INITIAL_JOIN_REQUESTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
        stored.location = INITIAL_SETTINGS.location;
        stored.contact_phone = INITIAL_SETTINGS.contact_phone;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(stored));
      } catch {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      }
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Background Synchronization with Supabase Cloud
   */
  public async syncFromSupabase(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // 1. Fetch Members
      const { data: remoteMembers, error: mErr } = await supabase.from('members').select('*');
      if (!mErr && remoteMembers && remoteMembers.length > 0) {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(remoteMembers));
      } else if (remoteMembers && remoteMembers.length === 0) {
        // Seed remote database if empty
        const local = this.getMembers();
        await supabase.from('members').upsert(local);
      }

      // 2. Fetch Tournaments
      const { data: remoteTournaments, error: tErr } = await supabase.from('tournaments').select('*');
      if (!tErr && remoteTournaments && remoteTournaments.length > 0) {
        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(remoteTournaments));
      } else if (remoteTournaments && remoteTournaments.length === 0) {
        const local = this.getTournaments();
        await supabase.from('tournaments').upsert(local);
      }

      // 3. Fetch Matches
      const { data: remoteMatches, error: matchErr } = await supabase.from('matches').select('*').order('played_at', { ascending: false });
      if (!matchErr && remoteMatches && remoteMatches.length > 0) {
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(remoteMatches));
      } else if (remoteMatches && remoteMatches.length === 0) {
        const local = this.getMatches();
        await supabase.from('matches').upsert(local);
      }

      // 4. Fetch News
      const { data: remoteNews, error: nErr } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      if (!nErr && remoteNews && remoteNews.length > 0) {
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(remoteNews));
      } else if (remoteNews && remoteNews.length === 0) {
        const local = this.getNews();
        await supabase.from('news').upsert(local);
      }

      // 5. Fetch Settings
      const { data: remoteSettings, error: sErr } = await supabase.from('club_settings').select('*').limit(1).single();
      if (!sErr && remoteSettings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(remoteSettings));
      }

      this.notify();
    } catch (e) {
      console.warn('Supabase sync notice:', e);
    }
  }

  // --- Members ---
  public getMembers(): Member[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return data ? JSON.parse(data) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  }

  public getMemberById(id: string): Member | undefined {
    return this.getMembers().find((m) => m.id === id);
  }

  public saveMember(member: Member): void {
    const members = this.getMembers();
    const index = members.findIndex((m) => m.id === member.id);
    if (index >= 0) {
      members[index] = member;
    } else {
      members.push(member);
    }
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify();

    // Async cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('members').upsert(member).then(({ error }) => {
        if (error) console.warn('Supabase member upsert error:', error);
      });
    }
  }

  public saveMembersBatch(updatedMembers: Member[]): void {
    const members = this.getMembers();
    const map = new Map(members.map((m) => [m.id, m]));
    for (const u of updatedMembers) {
      map.set(u.id, u);
    }
    const finalMembers = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(finalMembers));
    this.notify();

    // Async cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('members').upsert(updatedMembers).then(({ error }) => {
        if (error) console.warn('Supabase batch upsert error:', error);
      });
    }
  }

  public deleteMember(id: string): void {
    const members = this.getMembers().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify();

    // Async cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('members').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase member delete error:', error);
      });
    }
  }

  // --- Matches ---
  public getMatches(): Match[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
      return data ? JSON.parse(data) : INITIAL_MATCHES;
    } catch {
      return INITIAL_MATCHES;
    }
  }

  public saveMatch(match: Match): void {
    const matches = this.getMatches();
    const index = matches.findIndex((m) => m.id === match.id);
    if (index >= 0) {
      matches[index] = match;
    } else {
      matches.unshift(match);
    }
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    this.notify();

    // Async cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('matches').upsert(match).then(({ error }) => {
        if (error) console.warn('Supabase match upsert error:', error);
      });
    }
  }

  public deleteMatch(matchId: string, rollbackElo: boolean = true): void {
    const matches = this.getMatches();
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    if (rollbackElo) {
      const members = this.getMembers();
      const updatedMembers = rollbackMatchElo(match, members);
      this.saveMembersBatch(updatedMembers);
    }

    const filtered = matches.filter((m) => m.id !== matchId);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(filtered));
    this.notify();

    // Async cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('matches').delete().eq('id', matchId).then(({ error }) => {
        if (error) console.warn('Supabase match delete error:', error);
      });
    }
  }

  // --- Tournaments ---
  public getTournaments(): Tournament[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      return data ? JSON.parse(data) : INITIAL_TOURNAMENTS;
    } catch {
      return INITIAL_TOURNAMENTS;
    }
  }

  public getTournamentById(id: string): Tournament | undefined {
    return this.getTournaments().find((t) => t.id === id);
  }

  public saveTournament(tournament: Tournament): void {
    const tournaments = this.getTournaments();
    const index = tournaments.findIndex((t) => t.id === tournament.id);
    if (index >= 0) {
      tournaments[index] = tournament;
    } else {
      tournaments.unshift(tournament);
    }
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
    this.notify();

    // Async cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('tournaments').upsert(tournament).then(({ error }) => {
        if (error) console.warn('Supabase tournament upsert error:', error);
      });
    }
  }

  /**
   * Delete tournament with optional ELO Rollback and Win/Loss stats rollback for all participants
   */
  public deleteTournament(tournamentId: string, rollbackElo: boolean = true): void {
    const tournaments = this.getTournaments();
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return;

    if (rollbackElo) {
      let members = this.getMembers();

      // 1. Rollback all group matches
      if (tournament.group_matches) {
        for (const gm of tournament.group_matches) {
          if (gm.status === 'completed') {
            members = rollbackMatchElo(gm, members);
          }
        }
      }

      // 2. Rollback all knockout matches
      if (tournament.knockout_matches) {
        const { quarterfinals, semifinals, final, bronze } = tournament.knockout_matches;
        const allKnockout = [...(quarterfinals || []), ...(semifinals || []), final, bronze].filter(Boolean) as Match[];
        for (const km of allKnockout) {
          if (km.status === 'completed') {
            members = rollbackMatchElo(km, members);
          }
        }
      }

      this.saveMembersBatch(members);
    }

    // Delete tournament matches from global match history if any were linked
    const matches = this.getMatches().filter((m) => m.tournament_id !== tournamentId);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));

    // Delete tournament
    const remaining = tournaments.filter((t) => t.id !== tournamentId);
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(remaining));
    this.notify();

    // Async cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('tournaments').delete().eq('id', tournamentId).then(({ error }) => {
        if (error) console.warn('Supabase tournament delete error:', error);
      });
      supabase.from('matches').delete().eq('tournament_id', tournamentId).then(({ error }) => {
        if (error) console.warn('Supabase tournament matches delete error:', error);
      });
    }
  }

  // --- Join Requests ---
  public getJoinRequests(): JoinRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS);
      return data ? JSON.parse(data) : INITIAL_JOIN_REQUESTS;
    } catch {
      return INITIAL_JOIN_REQUESTS;
    }
  }

  public saveJoinRequest(req: JoinRequest): void {
    const requests = this.getJoinRequests();
    requests.unshift(req);
    localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(requests));
    this.notify();

    // Async cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('join_requests').upsert(req).then(({ error }) => {
        if (error) console.warn('Supabase join_requests upsert error:', error);
      });
    }
  }

  public updateJoinRequestStatus(id: string, status: 'approved' | 'rejected'): void {
    const requests = this.getJoinRequests();
    const req = requests.find((r) => r.id === id);
    if (req) {
      req.status = status;
      localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(requests));
      this.notify();

      // Async cloud sync
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.from('join_requests').update({ status }).eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase join_requests update status error:', error);
        });
      }
    }
  }

  public deleteJoinRequest(id: string): void {
    const requests = this.getJoinRequests().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(requests));
    this.notify();

    // Async cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('join_requests').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase join_requests delete error:', error);
      });
    }
  }

  // --- News ---
  public getNews(): NewsPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NEWS);
      return data ? JSON.parse(data) : INITIAL_NEWS;
    } catch {
      return INITIAL_NEWS;
    }
  }

  public saveNews(post: NewsPost): void {
    const news = this.getNews();
    const index = news.findIndex((n) => n.id === post.id);
    if (index >= 0) {
      news[index] = post;
    } else {
      news.unshift(post);
    }
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
    this.notify();

    // Async cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('news').upsert(post).then(({ error }) => {
        if (error) console.warn('Supabase news upsert error:', error);
      });
    }
  }

  public deleteNews(id: string): void {
    const news = this.getNews().filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
    this.notify();

    // Async cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('news').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase news delete error:', error);
      });
    }
  }

  // --- Settings ---
  public getSettings(): ClubSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  public saveSettings(settings: ClubSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notify();

    // Async cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('club_settings').upsert({ id: 'default_settings', ...settings }).then(({ error }) => {
        if (error) console.warn('Supabase club_settings upsert error:', error);
      });
    }
  }

  // --- Reset & Backup Tools ---
  public resetToSampleData(): void {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(INITIAL_TOURNAMENTS));
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_NEWS));
    localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(INITIAL_JOIN_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    this.notify();
  }

  public exportBackupJson(): string {
    const backup = {
      members: this.getMembers(),
      tournaments: this.getTournaments(),
      matches: this.getMatches(),
      news: this.getNews(),
      joinRequests: this.getJoinRequests(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.members) localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(parsed.members));
      if (parsed.tournaments) localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(parsed.tournaments));
      if (parsed.matches) localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(parsed.matches));
      if (parsed.news) localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(parsed.news));
      if (parsed.joinRequests) localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(parsed.joinRequests));
      if (parsed.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      this.notify();
      return true;
    } catch (e) {
      console.error('Import backup failed:', e);
      return false;
    }
  }
}

export const dataService = new DataService();
