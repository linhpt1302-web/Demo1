-- ==============================================================================
-- PICKLEBALL FRIENDS CLUB - SUPABASE DATABASE SCHEMA & INITIAL SEED DATA
-- ==============================================================================

-- 1. BẢNG THÀNH VIÊN (MEMBERS)
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    nickname TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    dupr_rating NUMERIC(4, 2) NOT NULL DEFAULT 3.00,
    elo_points INTEGER NOT NULL DEFAULT 1000,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    hand TEXT NOT NULL DEFAULT 'right' CHECK (hand IN ('right', 'left', 'both')),
    paddle TEXT,
    preferred_side TEXT NOT NULL DEFAULT 'flexible' CHECK (preferred_side IN ('left', 'right', 'flexible')),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    matches_played INTEGER NOT NULL DEFAULT 0,
    matches_won INTEGER NOT NULL DEFAULT 0,
    matches_lost INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    badges JSONB DEFAULT '[]'::jsonb,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. BẢNG GIẢI ĐẤU (TOURNAMENTS)
CREATE TABLE IF NOT EXISTS public.tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    banner_url TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'registration', 'group_stage', 'knockout', 'completed')),
    format TEXT NOT NULL DEFAULT 'group_and_knockout',
    num_groups INTEGER NOT NULL DEFAULT 3,
    group_names JSONB DEFAULT '["A", "B", "C"]'::jsonb,
    teams JSONB DEFAULT '[]'::jsonb,
    group_matches JSONB DEFAULT '[]'::jsonb,
    knockout_matches JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. BẢNG TRẬN ĐẤU (MATCHES - Lịch Sử Đấu 2v2 & Xếp Hạng)
CREATE TABLE IF NOT EXISTS public.matches (
    id TEXT PRIMARY KEY,
    tournament_id TEXT,
    tournament_stage TEXT,
    group_name TEXT,
    bracket_slot TEXT,
    match_type TEXT NOT NULL DEFAULT 'casual' CHECK (match_type IN ('casual', 'tournament', 'ranking')),
    team1_player1_id TEXT NOT NULL,
    team1_player2_id TEXT NOT NULL,
    team2_player1_id TEXT NOT NULL,
    team2_player2_id TEXT NOT NULL,
    team1_name TEXT,
    team2_name TEXT,
    format TEXT NOT NULL DEFAULT '1_set_15',
    team1_scores JSONB NOT NULL DEFAULT '[0]'::jsonb,
    team2_scores JSONB NOT NULL DEFAULT '[0]'::jsonb,
    winner_team INTEGER CHECK (winner_team IN (1, 2)),
    played_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    court_name TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
    elo_changes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. BẢNG TIN TỨC & SỰ KIỆN (NEWS)
CREATE TABLE IF NOT EXISTS public.news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'tournament', 'schedule', 'recap')),
    image_url TEXT,
    author_name TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. BẢNG ĐĂNG KÝ GIA NHẬP CLB (JOIN REQUESTS)
CREATE TABLE IF NOT EXISTS public.join_requests (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    zalo_fb TEXT,
    self_rating NUMERIC(3, 2) NOT NULL DEFAULT 3.0,
    experience_years TEXT,
    preferred_hand TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. BẢNG THÔNG TIN CLB (SETTINGS)
CREATE TABLE IF NOT EXISTS public.club_settings (
    id TEXT PRIMARY KEY DEFAULT 'default_settings',
    club_name TEXT NOT NULL DEFAULT 'Friends Pickleball Club',
    slogan TEXT DEFAULT 'Đam Mê - Kết Nối - Nâng Tầm Trình Độ 🎾⚡',
    location TEXT DEFAULT 'Sân Dũng/Vân Anh, địa chỉ: khu đô thị Eko Lake - Linh Sơn-Thái Nguyên',
    play_schedule TEXT DEFAULT 'Thứ 2 - Thứ 7: 18h00 - 21h00 | Chủ Nhật: 17h00 - 21h00',
    contact_phone TEXT DEFAULT '',
    contact_zalo TEXT DEFAULT 'https://zalo.me/g/fxdqrzrost2yui5t1mlz',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- BẢO MẬT & PHÂN QUYỀN (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Public Write Members" ON public.members FOR ALL USING (true);

CREATE POLICY "Public Read Tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Public Write Tournaments" ON public.tournaments FOR ALL USING (true);

CREATE POLICY "Public Read Matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public Write Matches" ON public.matches FOR ALL USING (true);

CREATE POLICY "Public Read News" ON public.news FOR SELECT USING (true);
CREATE POLICY "Public Write News" ON public.news FOR ALL USING (true);

CREATE POLICY "Public Read Join Requests" ON public.join_requests FOR SELECT USING (true);
CREATE POLICY "Public Write Join Requests" ON public.join_requests FOR ALL USING (true);

CREATE POLICY "Public Read Settings" ON public.club_settings FOR SELECT USING (true);
CREATE POLICY "Public Write Settings" ON public.club_settings FOR ALL USING (true);

-- ==============================================================================
-- DỮ LIỆU BAN ĐẦU (SEED DATA - 27 THÀNH VIÊN VỚI SỐ TRẬN = 0)
-- ==============================================================================
INSERT INTO public.members (id, full_name, nickname, avatar_url, phone, email, dupr_rating, elo_points, role, hand, paddle, preferred_side, join_date, matches_played, matches_won, matches_lost, current_streak, badges, bio)
VALUES
('m1', 'Hoàng Mạnh Cường', 'Cường Chủ Tịch', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', '0988.112.233', 'cuong.hm@friends.club', 3.25, 1100, 'admin', 'right', 'Joola Perseus 3S 16mm', 'left', '2024-01-10', 0, 0, 0, 0, '["👑 Chủ Tịch CLB", "🏆 Ban Quản Trị CLB"]'::jsonb, 'Chủ tịch CLB Pickleball Friends, điều hành và phát triển phong trào tập luyện thi đấu 2v2.'),
('m2', 'Hương Xoăn', 'Hương Xoăn', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', '0912.334.455', 'huong.xoan@friends.club', 3.25, 1100, 'admin', 'right', 'Selkirk Vanguard Control Invikta', 'right', '2024-01-15', 0, 0, 0, 0, '["⭐ Ban Điều Hành", "⚡ Nữ Tướng Pickleball"]'::jsonb, 'Ban điều hành CLB, phụ trách kết nối thành viên và tổ chức các sự kiện thi đấu nội bộ.'),
('m3', 'Loan', 'Loan BĐH', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', '0988.445.566', 'loan.bdh@friends.club', 3.13, 1050, 'admin', 'right', 'Paddletek Bantam TKO-C', 'flexible', '2024-01-15', 0, 0, 0, 0, '["⭐ Ban Điều Hành", "🎯 Tay Vợt Bền Bỉ"]'::jsonb, 'Ban điều hành CLB, điều phối hoạt động sân bãi và phong trào rèn luyện kỹ thuật.'),
('m4', 'Ngọc Tôm', 'Ngọc Tôm', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', '0977.556.677', 'ngoctom.kt@friends.club', 3.13, 1050, 'admin', 'right', 'Six Zero Double Black Diamond', 'right', '2024-02-01', 0, 0, 0, 0, '["💼 Kế Toán / Thủ Quỹ CLB", "🏸 Tay Lưới Vàng"]'::jsonb, 'Kế toán / Thủ quỹ CLB Friends, quản lý quỹ và công tác hậu cần các giải đấu.'),
('m5', 'Phạm Linh', 'Linh Phó CT', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', '0933.667.788', 'linh.pham@friends.club', 3.25, 1100, 'admin', 'left', 'CRBN 1X Power Series 16mm', 'left', '2024-01-10', 0, 0, 0, 0, '["🎖️ Phó Chủ Tịch CLB", "🔥 Chiến Thần Tốc Độ"]'::jsonb, 'Phó Chủ tịch CLB Pickleball Friends, phụ trách phát triển chuyên môn và tổ chức giải đấu.'),
('m6', 'Đặng Quyết', 'Quyết Đặng', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400', '0944.778.899', 'quyet.dang@friends.club', 3.13, 1050, 'member', 'right', 'Gearbox Pro Power Elongated', 'left', '2024-02-15', 0, 0, 0, 0, '["🚀 Cú Đánh Uy Lực"]'::jsonb, 'Đam mê thi đấu đôi, sở trường những cú smash uy lực cuối sân.'),
('m7', 'Đào Minh', 'Minh Đào', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400', '0966.889.900', 'minh.dao@friends.club', 3.13, 1050, 'member', 'right', 'Engage Pursuit Pro EX', 'flexible', '2024-03-01', 0, 0, 0, 0, '["🎯 Bậc Thầy Dinking"]'::jsonb, 'Điều bóng kiên trì gài góc hiểm, lối đánh chắc chắn và hiệu quả.'),
('m8', 'Duy Nguyen', 'Duy Nguyễn', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400', '0911.990.011', 'duy.nguyen@friends.club', 3.25, 1100, 'member', 'right', 'Franklin Sports Pro', 'right', '2024-03-10', 0, 0, 0, 0, '["⚡ Phản Xạ Nhạy Bén"]'::jsonb, 'Di chuyển linh hoạt, hỗ trợ đồng đội bọc lót tốt trong các pha bóng nhanh.'),
('m9', 'Giang', 'Giang Pickle', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400', '0922.112.233', 'giang@friends.club', 3.25, 1100, 'member', 'right', 'Head Radical Elite', 'flexible', '2024-03-15', 0, 0, 0, 0, '["🛡️ Bức Tường Kitchen"]'::jsonb, 'Thích lối chơi đồng đội gắn kết, luôn sẵn sàng ra sân giao lưu học hỏi.'),
('m10', 'Hạnh', 'Hạnh Pickle', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', '0933.223.344', 'hanh@friends.club', 3.00, 1000, 'member', 'right', 'Selkirk Luxx Control Air', 'right', '2024-03-20', 0, 0, 0, 0, '["🌸 Tay Vợt Nữ Năng Động"]'::jsonb, 'Tham gia tập luyện đều đặn, tích cực trong mọi hoạt động của CLB.'),
('m11', 'Hoang Diep', 'Hoàng Điệp', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400', '0944.334.455', 'hoangdiep@friends.club', 3.13, 1050, 'member', 'right', 'ProXR Signature Series', 'left', '2024-04-01', 0, 0, 0, 0, '["🌀 Xoáy Topspin"]'::jsonb, 'Cú drive topspin cuộn bóng khó chịu, phát bóng xoáy ổn định.'),
('m12', 'V Hoang Jp', 'Vũ Hoàng (JP)', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', '0955.445.566', 'vhoang.jp@friends.club', 3.13, 1050, 'member', 'right', 'JOOLA Collin Johns Scorpeus 3S', 'flexible', '2024-04-05', 0, 0, 0, 0, '["👟 Kỹ Thuật Erne"]'::jsonb, 'Lối đánh thông minh, nhãn quan chiến thuật tốt và các pha xử lý lưới tinh tế.'),
('m13', 'Dũng Hoạ', 'Dũng Họa', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', '0966.556.677', 'dung.hoa@friends.club', 3.13, 1050, 'member', 'right', 'Joola Perseus 3S 16mm', 'left', '2024-01-20', 0, 0, 0, 0, '["🏸 Chủ Sân Nhiệt Huyết", "🔥 Smash Uy Lực"]'::jsonb, 'Đóng góp to lớn cho sân bãi CLB Friends tại Eko Lake, luôn tràn đầy năng lượng thi đấu.'),
('m14', 'Dương Tuấn Anh', 'Tuấn Anh', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', '0977.667.788', 'tuananh.duong@friends.club', 3.38, 1150, 'member', 'right', 'CRBN 1X Power Series', 'left', '2024-02-10', 0, 0, 0, 0, '["⚡ Cú Smash Sấm Sét", "👑 Top 1 ELO CLB"]'::jsonb, 'Tay smash sắc bén, tấn công dồn dập khiến đối thủ khó phòng thủ.'),
('m15', 'Hiệu Hơn', 'Hiệu Hơn', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400', '0988.778.899', 'hieu.hon@friends.club', 3.25, 1100, 'member', 'right', 'Six Zero DBD', 'right', '2024-03-05', 0, 0, 0, 0, '["🎯 Chiến Binh Bền Bỉ"]'::jsonb, 'Bền bỉ trong từng đường bóng, tinh thần thể thao cao thượng.'),
('m16', 'Lê Hà', 'Hà Lê', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', '0903.998.877', 'ha.le@friends.club', 3.00, 1000, 'member', 'right', 'Paddletek Bantam', 'right', '2024-03-12', 0, 0, 0, 0, '["🛡️ Phòng Ngự Chắc Chắn"]'::jsonb, 'Khả năng cứu bóng và gài góc rất dẻo dai, thi đấu nhiệt tình.'),
('m17', 'Nguyễn Hằng', 'Hằng Nguyễn', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', '0912.887.766', 'hang.nguyen@friends.club', 3.00, 1000, 'member', 'right', 'Selkirk Vanguard Control', 'flexible', '2024-03-18', 0, 0, 0, 0, '["🌸 Hoa Khôi Sân Đấu"]'::jsonb, 'Vui vẻ hòa đồng, kỹ thuật dink bóng mềm mại và chuẩn xác.'),
('m18', 'Nguyễn Minh', 'Minh Nguyễn', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400', '0923.776.655', 'minh.nguyen@friends.club', 3.00, 1000, 'member', 'right', 'Engage Pursuit Pro', 'left', '2024-03-25', 0, 0, 0, 0, '["⚡ Tốc Độ & Linh Hoạt"]'::jsonb, 'Thích nhịp độ trận đấu nhanh, chủ động tấn công trên lưới.'),
('m19', 'Nhà Xe Tuấn Liên', 'Tuấn Liên', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400', '0934.665.544', 'tuanlien@friends.club', 3.25, 1100, 'member', 'right', 'Joola Perseus 16mm', 'flexible', '2024-02-01', 0, 0, 0, 0, '["🚚 Nhà Tài Trợ Vàng", "💪 Thể Lực Dồi Dào"]'::jsonb, 'Nhà tài trợ đồng hành cùng phong trào thể thao Pickleball Friends Thái Nguyên.'),
('m20', 'Ninh Van Quyen', 'Quyền Ninh', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400', '0945.554.433', 'quyen.ninh@friends.club', 3.13, 1050, 'member', 'right', 'ProXR Signature', 'right', '2024-03-01', 0, 0, 0, 0, '["🎯 Giao Bóng Chuẩn Xác"]'::jsonb, 'Phát bóng xoáy khó chịu và khả năng đọc tình huống trận đấu rất tốt.'),
('m21', 'Phạm Ngọc Tâm', 'Tâm Phạm', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', '0956.443.322', 'tam.pham@friends.club', 3.25, 1100, 'member', 'right', 'Franklin Sports Pro', 'flexible', '2024-03-08', 0, 0, 0, 0, '["🔥 Tay Vợt Tấn Công"]'::jsonb, 'Lối đánh mạnh mẽ, luôn tạo áp lực liên tục lên phần sân đối phương.'),
('m22', 'Tâm Mobile', 'Tâm Mobile', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', '0967.332.211', 'tam.mobile@friends.club', 3.00, 1000, 'member', 'right', 'Six Zero Double Black Diamond', 'left', '2024-02-15', 0, 0, 0, 0, '["📱 Chiến Binh Công Nghệ", "⚡ Phản Tạt Lưới"]'::jsonb, 'Kỹ thuật tốt, phản xạ nhanh và tinh thần thi đấu hết mình vì đồng đội.'),
('m23', 'Thanh Tuyến', 'Tuyến Thanh', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', '0978.221.100', 'tuyen.thanh@friends.club', 3.25, 1100, 'member', 'right', 'Selkirk Vanguard', 'right', '2024-03-20', 0, 0, 0, 0, '["🛡️ Lối Đánh Điềm Đạm"]'::jsonb, 'Điềm đạm trên sân, khả năng xử lý bóng bền bỉ và kiểm soát nhịp độ tuyệt vời.'),
('m24', 'Thầy Tân', 'Thầy Tân', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', '0989.110.099', 'thay.tan@friends.club', 3.00, 1000, 'member', 'right', 'CRBN 1X Power Series 16mm', 'flexible', '2024-01-18', 0, 0, 0, 0, '["🎓 Huấn Luyện Viên Tâm Huyết", "🏆 Bậc Thầy Chiến Thuật"]'::jsonb, 'Cố vấn chuyên môn và huấn luyện kỹ thuật đánh đôi cho các thành viên trong CLB Friends.'),
('m25', 'Thế Quyền', 'Quyền Thế', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400', '0901.009.988', 'thequyen@friends.club', 3.13, 1050, 'member', 'right', 'Gearbox Pro Power', 'left', '2024-03-10', 0, 0, 0, 0, '["🚀 Quả Giao Bóng Uy Lực"]'::jsonb, 'Thể lực sung mãn, di chuyển bao sân tốt và giao bóng tốc độ cao.'),
('m26', 'Trai Nhà Quê', 'Trai Nhà Quê', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400', '0912.998.877', 'trainhaque@friends.club', 3.13, 1050, 'member', 'right', 'Engage Pursuit Pro', 'flexible', '2024-03-01', 0, 0, 0, 0, '["🌾 Đam Mê Bất Tận", "🔥 Đánh Hết Mình"]'::jsonb, 'Mộc mạc, nhiệt huyết và luôn cống hiến hết mình trong từng đường bóng.'),
('m27', 'Tuan Nguyen', 'Tuan Nguyen', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400', '0923.887.766', 'tuan.nguyen@friends.club', 3.13, 1050, 'member', 'right', 'Head Radical Elite', 'right', '2024-03-15', 0, 0, 0, 0, '["🏸 Tay Vợt Đa Năng"]'::jsonb, 'Lối đánh toàn diện công thủ, luôn sẵn sàng tham gia các trận đấu đôi kịch tính.')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    nickname = EXCLUDED.nickname,
    avatar_url = EXCLUDED.avatar_url,
    phone = EXCLUDED.phone,
    dupr_rating = EXCLUDED.dupr_rating,
    elo_points = EXCLUDED.elo_points,
    role = EXCLUDED.role,
    matches_played = 0,
    matches_won = 0,
    matches_lost = 0,
    current_streak = 0;

-- 2. Insert Settings CLB Friends
INSERT INTO public.club_settings (id, club_name, slogan, location, play_schedule, contact_phone, contact_zalo)
VALUES (
    'default_settings',
    'Friends Pickleball Club',
    'Đam Mê - Kết Nối - Nâng Tầm Trình Độ 🎾⚡',
    'Sân Dũng/Vân Anh, địa chỉ: khu đô thị Eko Lake - Linh Sơn-Thái Nguyên',
    'Hàng ngày: 18h00 - 21h00',
    '',
    'https://zalo.me/g/fxdqrzrost2yui5t1mlz'
)
ON CONFLICT (id) DO UPDATE SET
    play_schedule = EXCLUDED.play_schedule,
    location = EXCLUDED.location,
    contact_phone = EXCLUDED.contact_phone,
    contact_zalo = EXCLUDED.contact_zalo;
