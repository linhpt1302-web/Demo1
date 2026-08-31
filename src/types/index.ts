export type Role = 'admin' | 'member';

export interface Member {
  id: string;
  full_name: string;
  nickname: string;
  avatar_url: string;
  phone: string;
  email?: string;
  dupr_rating: number; // e.g. 3.75
  elo_points: number; // e.g. 1350
  role: Role;
  hand: 'right' | 'left' | 'both';
  paddle: string;
  preferred_side: 'left' | 'right' | 'flexible';
  join_date: string;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  current_streak: number; // >0 win streak, <0 lose streak
  badges: string[];
  bio?: string;
  created_at?: string;
}

export type MatchFormat = '1_set_15' | '3_sets_11';
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed';
export type TournamentStage = 'group' | 'quarter' | 'semi' | 'final' | 'bronze';

export interface EloDeltaInfo {
  player_id: string;
  elo_delta: number;
  old_elo: number;
  new_elo: number;
}

export interface Match {
  id: string;
  tournament_id?: string;
  tournament_stage?: TournamentStage;
  group_name?: string; // 'A', 'B', 'C', etc.
  bracket_slot?: string; // 'QF1', 'QF2', 'QF3', 'QF4', 'SF1', 'SF2', 'FINAL'
  match_type: 'casual' | 'tournament' | 'ranking';
  team1_player1_id: string;
  team1_player2_id: string;
  team2_player1_id: string;
  team2_player2_id: string;
  team1_name?: string;
  team2_name?: string;
  format: MatchFormat;
  team1_scores: number[];
  team2_scores: number[];
  winner_team?: 1 | 2;
  played_at: string;
  court_name?: string;
  status: MatchStatus;
  elo_changes?: EloDeltaInfo[];
}

export interface TournamentTeam {
  id: string;
  tournament_id: string;
  team_name: string;
  player1_id: string;
  player2_id: string;
  group_id?: string; // 'A', 'B', etc.
  seed?: number;
  stats: {
    matches_played: number;
    wins: number;
    losses: number;
    sets_won: number;
    sets_lost: number;
    points_scored: number;
    points_conceded: number;
    points_diff: number;
    group_rank?: number;
  };
}

export type TournamentStatus = 'draft' | 'group_stage' | 'knockout' | 'completed';

export interface KnockoutMatches {
  quarterfinals: Match[]; // 4 matches (8 teams)
  semifinals: Match[];    // 2 matches (4 teams)
  final: Match;           // 1 match (2 teams)
  bronze?: Match;         // 1 match (2 teams)
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  banner_url: string;
  start_date: string;
  end_date: string;
  status: TournamentStatus;
  format: 'group_and_knockout';
  num_groups: number; // 1 to 10
  group_names: string[]; // ['A', 'B', 'C'...]
  teams: TournamentTeam[];
  group_matches: Match[];
  knockout_matches?: KnockoutMatches;
  champion_team?: TournamentTeam;
  runner_up_team?: TournamentTeam;
  third_place_team?: TournamentTeam;
  created_at: string;
}

export interface JoinRequest {
  id: string;
  full_name: string;
  phone: string;
  zalo_fb?: string;
  self_rating: number;
  experience_years: string;
  preferred_hand?: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  category: 'announcement' | 'tournament' | 'recap' | 'schedule';
  image_url?: string;
  author_name: string;
  created_at: string;
  likes: number;
}

export interface ClubSettings {
  club_name: string;
  slogan: string;
  location: string;
  play_schedule: string;
  contact_phone: string;
  contact_zalo: string;
  admin_password_hash?: string;
  supabase_url?: string;
  supabase_anon_key?: string;
}
