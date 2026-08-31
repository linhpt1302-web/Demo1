import React, { useState } from 'react';
import { Camera, Sparkles, X } from 'lucide-react';

const CLUB_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    title: 'Trận Chung Kết Đôi Nam Nữ - Friends Summer Cup 2026',
    date: '2026-08-20',
  },
  {
    url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=800',
    title: 'Buổi Tập Huấn Kỹ Thuật Dink & Drop Shot Cuối Tuần',
    date: '2026-08-15',
  },
  {
    url: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&q=80&w=800',
    title: 'Lễ Trao Cúp & Giao Lưu Ăn Mừng Thành Viên Mới',
    date: '2026-08-10',
  },
  {
    url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=800',
    title: 'Khoảnh Khắc Smash Đỉnh Cao Trên Sân Trung Tâm',
    date: '2026-08-05',
  },
  {
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
    title: 'Tập Luyện Thể Lực & Phản Xạ Lưới Kitchen',
    date: '2026-07-28',
  },
  {
    url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&q=80&w=800',
    title: 'Cụm Sân Dũng/Vân Anh Dưới Ánh Đèn Đêm',
    date: '2026-07-20',
  },
];

export const PhotoGallery: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<typeof CLUB_PHOTOS[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Camera className="w-5 h-5 text-pickle-lime" />
        <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
          Thư Viện Khoảnh Khắc & Hoạt Động CLB
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CLUB_PHOTOS.map((photo, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedPhoto(photo)}
            className="group cursor-pointer relative h-48 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-pickle-border shadow-sm hover:scale-102 transition-all"
          >
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
              <span className="text-[10px] text-pickle-lime font-mono">{photo.date}</span>
              <h4 className="text-xs font-bold text-white truncate">{photo.title}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedPhoto.url} alt={selectedPhoto.title} className="w-full max-h-[70vh] object-cover" />
            <div className="p-4 bg-slate-900 text-white">
              <span className="text-xs text-pickle-lime font-mono">{selectedPhoto.date}</span>
              <h3 className="text-base font-bold font-display">{selectedPhoto.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
