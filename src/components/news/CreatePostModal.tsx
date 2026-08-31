import React, { useState } from 'react';
import { NewsPost } from '../../types';
import { X, Newspaper, Image as ImageIcon } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePost: (post: NewsPost) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSavePost,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'announcement' | 'tournament' | 'recap' | 'schedule'>('announcement');
  const [imageUrl, setImageUrl] = useState('');
  const [authorName, setAuthorName] = useState('Ban Quản Trị CLB Friends');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newPost: NewsPost = {
      id: `news_${Date.now()}`,
      title,
      content,
      category,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
      author_name: authorName,
      created_at: new Date().toISOString(),
      likes: 0,
    };

    onSavePost(newPost);
    onClose();
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
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Đăng Bài Viết / Thông Báo Mới
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chia sẻ thông báo, lịch sinh hoạt hoặc hình ảnh hoạt động CLB
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tiêu Đề Bài Viết *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Lịch Giao Lưu Thứ 7 & Thông Báo Giải Mùa Thu"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pickle-lime outline-none font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chuyên Mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-semibold"
              >
                <option value="announcement">📢 Thông Báo Chung</option>
                <option value="schedule">📅 Lịch Sinh Hoạt / Thuê Sân</option>
                <option value="tournament">🏆 Giải Đấu & Sự Kiện</option>
                <option value="recap">🌟 Vinh Danh & Tổng Kết</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Người Đăng
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ảnh Minh Họa (URL)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nội Dung Chi Tiết *
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung bài viết, thời gian, địa điểm, thể thức..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-pickle-surface border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
            />
          </div>

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
              className="px-6 py-2 text-sm font-bold bg-pickle-lime text-pickle-dark hover:bg-pickle-400 rounded-xl shadow-lg shadow-pickle-lime/20"
            >
              Đăng Bài Viết
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
