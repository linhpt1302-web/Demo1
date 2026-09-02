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
import { rollbackMatchElo, recalculateAllMemberStats } from '../utils/eloCalculator';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  VERSION: 'pickle_friends_v3_sync_clean',
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
    const isV3 = localStorage.getItem(STORAGE_KEYS.VERSION);

    if (!isV3) {
      // First-time or upgrade initialization
      localStorage.setItem(STORAGE_KEYS.VERSION, 'true');
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_NEWS));
      localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(INITIAL_JOIN_REQUESTS));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return;
    }

    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)) {
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NEWS)) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_NEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(INITIAL_JOIN_REQUESTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
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
      }

      // 2. Fetch Tournaments
      const { data: remoteTournaments, error: tErr } = await supabase.from('tournaments').select('*');
      if (!tErr && remoteTournaments) {
        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(remoteTournaments));
      }

      // 3. Fetch Matches
      const { data: remoteMatches, error: matchErr } = await supabase.from('matches').select('*').order('played_at', { ascending: false });
      if (!matchErr && remoteMatches) {
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(remoteMatches));
      }

      // 4. Fetch News
      const { data: remoteNews, error: nErr } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      if (!nErr && remoteNews && remoteNews.length > 0) {
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(remoteNews));
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

  public async saveMember(member: Member): Promise<void> {
    const members = this.getMembers();
    const index = members.findIndex((m) => m.id === member.id);
    if (index >= 0) {
      members[index] = member;
    } else {
      members.push(member);
    }
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify();

    // Cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('members').upsert(member);
        if (error) console.warn('Supabase member upsert error:', error.message);
      } catch (e) {
        console.warn('Supabase exception on saveMember:', e);
      }
    }
  }

  public async saveMembersBatch(updatedMembers: Member[]): Promise<void> {
    if (updatedMembers.length === 0) return;
    const members = this.getMembers();
    const map = new Map(members.map((m) => [m.id, m]));
    for (const u of updatedMembers) {
      map.set(u.id, u);
    }
    const finalMembers = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(finalMembers));
    this.notify();

    // Cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('members').upsert(updatedMembers);
        if (error) console.warn('Supabase batch upsert error:', error.message);
      } catch (e) {
        console.warn('Supabase exception on saveMembersBatch:', e);
      }
    }
  }

  public async deleteMember(id: string): Promise<void> {
    const members = this.getMembers().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify();

    // Cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('members').delete().eq('id', id);
        if (error) console.warn('Supabase member delete error:', error.message);
      } catch (e) {
        console.warn('Supabase exception on deleteMember:', e);
      }
    }
  }

  // --- Matches ---
  public getMatches(): Match[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public async saveMatch(match: Match, updatedMembers?: Member[]): Promise<void> {
    const matches = this.getMatches();
    const index = matches.findIndex((m) => m.id === match.id);
    if (index >= 0) {
      matches[index] = match;
    } else {
      matches.unshift(match);
    }
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));

    if (updatedMembers && updatedMembers.length > 0) {
      const members = this.getMembers();
      const map = new Map(members.map((m) => [m.id, m]));
      for (const u of updatedMembers) {
        map.set(u.id, u);
      }
      const finalMembers = Array.from(map.values());
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(finalMembers));
    }

    this.notify();

    // Cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const matchUpsert = supabase.from('matches').upsert(match);
        const membersUpsert =
          updatedMembers && updatedMembers.length > 0
            ? supabase.from('members').upsert(updatedMembers)
            : Promise.resolve({ error: null });

        const [mRes, memRes] = await Promise.all([matchUpsert, membersUpsert]);
        if (mRes.error) console.warn('Supabase match upsert error:', mRes.error.message);
        if (memRes.error) console.warn('Supabase members upsert error:', memRes.error.message);
      } catch (e) {
        console.warn('Supabase exception on saveMatch:', e);
      }
    }
  }

  public async deleteMatch(id: string, rollbackElo: boolean = false): Promise<void> {
    const matches = this.getMatches();
    const targetMatch = matches.find((m) => m.id === id);

    if (targetMatch && rollbackElo && targetMatch.elo_changes && targetMatch.elo_changes.length > 0) {
      const currentMembers = this.getMembers();
      const rolledBackMembers = rollbackMatchElo(targetMatch, currentMembers);
      await this.saveMembersBatch(rolledBackMembers);
    }

    const filtered = matches.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(filtered));
    this.notify();

    // Cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('matches').delete().eq('id', id);
        if (error) console.warn('Supabase match delete error:', error.message);
      } catch (e) {
        console.warn('Supabase exception on deleteMatch:', e);
      }
    }
  }

  /**
   * Recalculates and synchronizes all member stats and ELO ratings from the complete match history.
   */
  public async recalculateAllClubStats(): Promise<{ memberCount: number; matchCount: number }> {
    const members = this.getMembers();
    const standaloneMatches = this.getMatches();

    const tournaments = this.getTournaments();
    const tournamentMatches: Match[] = [];
    for (const t of tournaments) {
      if (t.group_matches) tournamentMatches.push(...t.group_matches);
      if (t.knockout_matches) {
        const km = t.knockout_matches;
        if (km.quarterfinals) tournamentMatches.push(...km.quarterfinals);
        if (km.semifinals) tournamentMatches.push(...km.semifinals);
        if (km.final) tournamentMatches.push(km.final);
        if (km.bronze) tournamentMatches.push(km.bronze);
      }
    }

    // Deduplicate matches by id
    const allMatchesMap = new Map<string, Match>();
    standaloneMatches.forEach((m) => allMatchesMap.set(m.id, m));
    tournamentMatches.forEach((m) => allMatchesMap.set(m.id, m));
    const allMatches = Array.from(allMatchesMap.values());

    const initialEloMap: Record<string, number> = {};
    INITIAL_MEMBERS.forEach((m) => {
      initialEloMap[m.id] = m.elo_points;
    });

    const { recalculatedMembers, recalculatedMatches } = recalculateAllMemberStats(
      members,
      allMatches,
      initialEloMap
    );

    // Save recalculated members and standalone matches
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(recalculatedMembers));
    
    // Update standalone matches
    const updatedStandalone = standaloneMatches.map((sm) => {
      const rec = recalculatedMatches.find((rm) => rm.id === sm.id);
      return rec || sm;
    });
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updatedStandalone));

    this.notify();

    // Sync to Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await Promise.all([
          supabase.from('members').upsert(recalculatedMembers),
          supabase.from('matches').upsert(updatedStandalone),
        ]);
      } catch (e) {
        console.warn('Supabase sync exception on recalculate:', e);
      }
    }

    return {
      memberCount: recalculatedMembers.length,
      matchCount: allMatches.filter((m) => m.status === 'completed').length,
    };
  }

  // --- Tournaments ---
  public getTournaments(): Tournament[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getTournamentById(id: string): Tournament | undefined {
    return this.getTournaments().find((t) => t.id === id);
  }

  public async saveTournament(tournament: Tournament): Promise<void> {
    const tournaments = this.getTournaments();
    const index = tournaments.findIndex((t) => t.id === tournament.id);
    if (index >= 0) {
      tournaments[index] = tournament;
    } else {
      tournaments.unshift(tournament);
    }
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
    this.notify();

    // Cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('tournaments').upsert(tournament);
        if (error) console.warn('Supabase tournament upsert error:', error.message);
      } catch (e) {
        console.warn('Supabase exception on saveTournament:', e);
      }
    }
  }

  public async deleteTournament(id: string, rollbackElo: boolean = false): Promise<void> {
    const tournaments = this.getTournaments();
    const targetTournament = tournaments.find((t) => t.id === id);

    if (targetTournament && rollbackElo) {
      const completedTournamentMatches = this.getMatches().filter(
        (m) => m.tournament_id === id && m.status === 'completed' && m.elo_changes && m.elo_changes.length > 0
      );

      let currentMembers = this.getMembers();
      for (const m of completedTournamentMatches) {
        currentMembers = rollbackMatchElo(m, currentMembers);
      }
      await this.saveMembersBatch(currentMembers);

      const remainingMatches = this.getMatches().filter((m) => m.tournament_id !== id);
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(remainingMatches));
    }

    const filtered = tournaments.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(filtered));
    this.notify();

    // Cloud sync
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('tournaments').delete().eq('id', id);
        if (error) console.warn('Supabase tournament delete error:', error.message);
        if (rollbackElo) {
          await supabase.from('matches').delete().eq('tournament_id', id);
        }
      } catch (e) {
        console.warn('Supabase exception on deleteTournament:', e);
      }
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

  public async saveNews(post: NewsPost): Promise<void> {
    const news = this.getNews();
    const index = news.findIndex((n) => n.id === post.id);
    if (index >= 0) {
      news[index] = post;
    } else {
      news.unshift(post);
    }
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
    this.notify();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('news').upsert(post);
        if (error) console.warn('Supabase news upsert error:', error.message);
      } catch (e) {
        console.warn('Supabase exception on saveNews:', e);
      }
    }
  }

  public async deleteNews(id: string): Promise<void> {
    const news = this.getNews().filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
    this.notify();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (error) console.warn('Supabase news delete error:', error.message);
      } catch (e) {
        console.warn('Supabase exception on deleteNews:', e);
      }
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

  public async saveJoinRequest(request: JoinRequest): Promise<void> {
    const list = this.getJoinRequests();
    list.unshift(request);
    localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(list));
    this.notify();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('join_requests').upsert(request);
        if (error) console.warn('Supabase join_requests error:', error.message);
      } catch (e) {
        console.warn('Supabase exception on saveJoinRequest:', e);
      }
    }
  }

  public async updateJoinRequestStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const list = this.getJoinRequests();
    const req = list.find((r) => r.id === id);
    if (req) {
      req.status = status;
      localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(list));
      this.notify();

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { error } = await supabase.from('join_requests').update({ status }).eq('id', id);
          if (error) console.warn('Supabase update join status error:', error.message);
        } catch (e) {
          console.warn('Supabase exception on updateJoinRequestStatus:', e);
        }
      }
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

  public async saveSettings(settings: ClubSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notify();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('club_settings').upsert({ id: 'default_settings', ...settings });
        if (error) console.warn('Supabase settings upsert error:', error.message);
      } catch (e) {
        console.warn('Supabase exception on saveSettings:', e);
      }
    }
  }

  // --- Backup & Restore ---
  public exportBackupJson(): string {
    const backup = {
      version: 'pickle_friends_v3',
      exported_at: new Date().toISOString(),
      members: this.getMembers(),
      tournaments: this.getTournaments(),
      matches: this.getMatches(),
      news: this.getNews(),
      join_requests: this.getJoinRequests(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.members)) {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(parsed.members));
        if (Array.isArray(parsed.tournaments)) localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(parsed.tournaments));
        if (Array.isArray(parsed.matches)) localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(parsed.matches));
        if (Array.isArray(parsed.news)) localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(parsed.news));
        if (Array.isArray(parsed.join_requests)) localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(parsed.join_requests));
        if (parsed.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));

        this.notify();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public resetToSampleData(): void {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_NEWS));
    localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(INITIAL_JOIN_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    this.notify();
  }
}

export const dataService = new DataService();
