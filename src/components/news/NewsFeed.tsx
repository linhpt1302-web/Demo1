import React, { useState } from 'react';
import { NewsPost } from '../../types';
import { CreatePostModal } from './CreatePostModal';
import { PhotoGallery } from './PhotoGallery';
import { useAuth } from '../../context/AuthContext';
import {
  Newspaper,
  Plus,
  Heart,
  Calendar,
  User,
  Trash2,
  Share2,
  Sparkles,
} from 'lucide-react';

interface NewsFeedProps {
  news: NewsPost[];
  onSavePost: (post: NewsPost) => void;
  onDeletePost?: (id: string) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  news,
  onSavePost,
  onDeletePost,
}) => {
  const { isAdmin } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const filteredNews =
    activeCategory === 'all'
      ? news
      : news.filter((n) => n.category === activeCategory);

  const handleToggleLike = (post: NewsPost) => {
    const isLiked = likedPosts[post.id];
    setLikedPosts({ ...likedPosts, [post.id]: !isLiked });
    const updated = { ...post, likes: isLiked ? Math.max(0, post.likes - 1) : post.likes + 1 };
    onSavePost(updated);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'tournament':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase">🏆 Giải Đấu</span>;
      case 'schedule':
        return <span className="px-2.5 py-0.5 rounded-full bg-pickle-lime/20 text-pickle-700 dark:text-pickle-lime font-extrabold text-[10px] uppercase">📅 Lịch Sinh Hoạt</span>;
      case 'recap':
        return <span className="px-2.5 py-0.5 rounded-full bg-pickle-coral/15 text-pickle-coral font-extrabold text-[10px] uppercase">🌟 Vinh Danh</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase">📢 Thông Báo</span>;
    }
  };

  return (
    <div className="space-y-12">
      {/* Header & Post CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="w-6 h-6 text-pickle-lime" />
            <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              Bảng Tin & Hoạt Động CLB
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cập nhật tin tức, lịch đặt sân, kết quả thi đấu và thông báo quan trọng từ Ban Chủ Nhiệm
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-pickle-lime text-pickle-dark hover:bg-pickle-400 font-bold text-xs rounded-xl shadow-lg shadow-pickle-lime/20 transition-all hover:scale-105 active:scale-95 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Đăng Bài Viết Mới</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-pickle-lime text-pickle-dark shadow-sm'
              : 'bg-white dark:bg-pickle-card text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-pickle-border hover:bg-slate-50'
          }`}
        >
          Tất Cả Tin Tức ({news.length})
        </button>
        <button
          onClick={() => setActiveCategory('announcement')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeCategory === 'announcement'
              ? 'bg-pickle-lime text-pickle-dark shadow-sm'
              : 'bg-white dark:bg-pickle-card text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-pickle-border hover:bg-slate-50'
          }`}
        >
          📢 Thông Báo
        </button>
        <button
          onClick={() => setActiveCategory('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeCategory === 'schedule'
              ? 'bg-pickle-lime text-pickle-dark shadow-sm'
              : 'bg-white dark:bg-pickle-card text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-pickle-border hover:bg-slate-50'
          }`}
        >
          📅 Lịch Sinh Hoạt
        </button>
        <button
          onClick={() => setActiveCategory('tournament')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeCategory === 'tournament'
              ? 'bg-pickle-lime text-pickle-dark shadow-sm'
              : 'bg-white dark:bg-pickle-card text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-pickle-border hover:bg-slate-50'
          }`}
        >
          🏆 Giải Đấu
        </button>
        <button
          onClick={() => setActiveCategory('recap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeCategory === 'recap'
              ? 'bg-pickle-lime text-pickle-dark shadow-sm'
              : 'bg-white dark:bg-pickle-card text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-pickle-border hover:bg-slate-50'
          }`}
        >
          🌟 Vinh Danh
        </button>
      </div>

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((post) => {
          const isLiked = likedPosts[post.id];
          return (
            <div
              key={post.id}
              className="group rounded-3xl bg-white dark:bg-pickle-card border border-slate-200 dark:border-pickle-border shadow-md overflow-hidden flex flex-col justify-between hover:border-pickle-lime/50 transition-all hover:shadow-xl hover:shadow-pickle-lime/10"
            >
              <div>
                {/* Post Image */}
                {post.image_url && (
                  <div className="h-48 overflow-hidden bg-slate-900 relative">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      {getCategoryBadge(post.category)}
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5" />
                      {post.author_name}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-display text-slate-900 dark:text-white group-hover:text-pickle-500 dark:group-hover:text-pickle-lime transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                </div>
              </div>

              {/* Post Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-pickle-border/60 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleToggleLike(post)}
                  className={`flex items-center gap-1.5 font-bold transition-colors ${
                    isLiked
                      ? 'text-rose-500'
                      : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                  <span>{post.likes} Yêu thích</span>
                </button>

                {isAdmin && onDeletePost && (
                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                    title="Xóa bài viết"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo Gallery Section */}
      <PhotoGallery />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSavePost={onSavePost}
      />
    </div>
  );
};
