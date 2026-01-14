import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface ScanButtonProps {
  onImageSelected: (base64: string) => void;
  disabled?: boolean;
}

export const ScanButton: React.FC<ScanButtonProps> = ({ onImageSelected, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        onImageSelected(base64);
      };
      reader.readAsDataURL(file);
    }
    // Reset value so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={triggerInput}
        disabled={disabled}
        className={`
          relative group flex items-center justify-center
          w-20 h-20 rounded-full
          bg-emerald-500 text-white shadow-xl shadow-emerald-200
          transition-all duration-300 transform active:scale-95 hover:bg-emerald-600
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label="扫描食品标签"
      >
        <Camera size={32} />
        <div className="absolute -inset-1 rounded-full border border-emerald-100 opacity-50 scale-110 animate-pulse"></div>
      </button>
      <p className="mt-4 text-stone-500 font-medium text-sm tracking-wide">
        点击拍摄标签
      </p>
    </div>
  );
};