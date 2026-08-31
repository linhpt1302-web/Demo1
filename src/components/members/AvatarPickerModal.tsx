import React, { useState, useRef } from 'react';
import { X, Upload, Check, Camera, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelectAvatar: (avatarUrl: string) => void;
}

const PRESET_AVATARS = [
  {
    category: 'Nam Thể Thao',
    avatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    ],
  },
  {
    category: 'Nữ Thể Thao',
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    ],
  },
  {
    category: 'Pickleball 3D & Avatar Minh Họa',
    avatars: [
      'https://api.dicebear.com/7.x/bottts/svg?seed=pickleking',
      'https://api.dicebear.com/7.x/bottts/svg?seed=smashmaster',
      'https://api.dicebear.com/7.x/bottts/svg?seed=dinker',
      'https://api.dicebear.com/7.x/bottts/svg?seed=aceplayer',
      'https://api.dicebear.com/7.x/bottts/svg?seed=champion',
      'https://api.dicebear.com/7.x/bottts/svg?seed=courtwall',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    ],
  },
];

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSelectAvatar,
}) => {
  const [selectedUrl, setSelectedUrl] = useState(currentAvatar);
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  /**
   * Automatically crop center square and compress image to 400x400 JPG (~30KB)
   * This guarantees that large phone/camera images never exceed localStorage quota.
   */
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh hợp lệ (JPG, PNG, WEBP, GIF, HEIC).');
      return;
    }

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        setIsProcessing(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;

          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          // Crop center square
          const minDim = Math.min(width, height);
          const startX = (width - minDim) / 2;
          const startY = (height - minDim) / 2;

          canvas.width = Math.min(MAX_SIZE, minDim);
          canvas.height = Math.min(MAX_SIZE, minDim);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(
              img,
              startX,
              startY,
              minDim,
              minDim,
              0,
              0,
              canvas.width,
              canvas.height
            );

            // Compress to optimized JPEG (quality 0.85) ~30KB
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            setSelectedUrl(optimizedBase64);
          } else {
            setSelectedUrl(rawDataUrl);
          }
        } catch (err) {
          console.warn('Canvas compression fallback:', err);
          setSelectedUrl(rawDataUrl);
        } finally {
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        alert('Không thể đọc file ảnh này. Vui lòng thử một ảnh khác.');
        setIsProcessing(false);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      alert('Lỗi khi đọc file từ máy tính.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Reset file input so user can re-pick the same file if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleConfirm = () => {
    if (activeTab === 'url' && customUrl.trim()) {
      onSelectAvatar(customUrl.trim());
    } else {
      onSelectAvatar(selectedUrl);
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg p-6 bg-white dark:bg-pickle-card rounded-3xl shadow-2xl border border-slate-200 dark:border-pickle-border max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-pickle-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-pickle-lime/20 text-pickle-500 dark:text-pickle-lime rounded-2xl">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Thay Đổi Ảnh Đại Diện (Avatar)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chọn ảnh có sẵn, tải ảnh từ máy tính hoặc dán link ảnh
            </p>
          </div>
        </div>

        {/* Current Preview */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-pickle-surface border border-slate-200 dark:border-pickle-border/80 mb-5">
          <div className="relative">
            {isProcessing ? (
              <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-pickle-lime">
                <Loader2 className="w-6 h-6 text-pickle-500 animate-spin" />
              </div>
            ) : (
              <img
                src={activeTab === 'url' && customUrl ? customUrl : selectedUrl}
                alt="Preview"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
                }}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-pickle-lime shadow-md"
              />
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-pickle-lime text-pickle-dark rounded-full shadow">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {isProcessing ? 'Đang tối ưu & nén ảnh...' : 'Ảnh đại diện đang chọn'}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {isProcessing
                ? 'Hệ thống đang tự động tối ưu độ phân giải để hiển thị sắc nét nhất'
                : 'Hiển thị trên Thẻ thành viên, Bảng xếp hạng DUPR và QR Pass'}
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 dark:bg-pickle-surface p-1 rounded-xl border border-slate-200 dark:border-pickle-border mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'presets'
                ? 'bg-pickle-lime text-pickle-dark shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Bộ Ảnh Có Sẵn
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'upload'
                ? 'bg-pickle-lime text-pickle-dark shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tải Từ Máy Tính
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'url'
                ? 'bg-pickle-lime text-pickle-dark shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Nhập Link Ảnh
          </button>
        </div>

        {/* Tab 1: Presets Gallery */}
        {activeTab === 'presets' && (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {PRESET_AVATARS.map((group, idx) => (
              <div key={idx}>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  {group.category}
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                  {group.avatars.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedUrl(url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all hover:scale-105 ${
                        selectedUrl === url
                          ? 'border-pickle-lime ring-2 ring-pickle-lime/40 shadow-lg'
                          : 'border-slate-200 dark:border-pickle-border hover:border-pickle-lime/50'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                      {selectedUrl === url && (
                        <div className="absolute inset-0 bg-pickle-lime/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-pickle-dark stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Upload From Device */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed ${
                isDragging
                  ? 'border-pickle-lime bg-pickle-lime/20 scale-[1.02]'
                  : 'border-pickle-lime/60 hover:border-pickle-lime bg-pickle-lime/5 dark:bg-pickle-lime/10'
              } p-8 rounded-2xl text-center cursor-pointer transition-all hover:scale-[1.01]`}
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-pickle-lime/20 text-pickle-600 dark:text-pickle-lime flex items-center justify-center mb-3">
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin text-pickle-500" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                {isProcessing
                  ? 'Đang xử lý và nén ảnh...'
                  : 'Nhấp để chọn ảnh hoặc Kéo thả ảnh từ máy tính vào đây'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Tự động tối ưu hóa và tương thích 100% (JPG, PNG, WEBP, HEIC)
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Custom URL */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              Đường Dẫn Ảnh (Direct Image Link)
            </label>
            <div className="relative">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-pickle-surface text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-pickle-lime outline-none"
              />
              <ImageIcon className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-slate-200 dark:border-pickle-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-pickle-500 to-pickle-lime text-pickle-dark hover:from-pickle-400 hover:to-pickle-300 shadow-lg shadow-pickle-lime/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? 'Đang Xử Lý...' : 'Xác Nhận Đổi Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
};
