import React, { useState } from 'react';
import { Share2, Download, Copy, Check, X, Sparkles, Heart } from 'lucide-react';
import { ParsedMeal } from '../types/neis';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: ParsedMeal | null;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  meal,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !meal) return null;

  const handleCopyText = () => {
    const dishList = meal.dishes.map((d) => `• ${d.name}`).join('\n');
    const text = `🍱 [${meal.schoolName}] 오늘의 급식표 (${meal.dateFormatted})\n\n${dishList}\n\n⚡ 칼로리: ${meal.calories}\n💖 귀여운 급식표 보기: 얌얌급식`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-pink-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-base">
            <Share2 className="w-5 h-5" />
            <span>오늘의 급식 카드 공유</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-pink-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Cute Visual Card Preview */}
        <div
          id="meal-share-card"
          className="mt-4 p-5 rounded-3xl bg-gradient-to-b from-[#FFF0F5] via-[#FFF5F8] to-[#FFEBF2] border-2 border-dashed border-pink-300 shadow-md relative overflow-hidden text-center"
        >
          {/* Decorative cute stickers */}
          <div className="absolute top-2 left-3 text-xl select-none animate-pulse">🍓</div>
          <div className="absolute top-2 right-3 text-xl select-none">✨</div>
          <div className="absolute bottom-2 left-3 text-lg select-none">🍙</div>
          <div className="absolute bottom-2 right-3 text-lg select-none">🍮</div>

          {/* Stamp */}
          <div className="inline-block px-3 py-1 bg-white/80 border border-pink-300 rounded-full text-xs font-bold text-rose-500 shadow-xs mb-1">
            💮 얌얌급식 인증식단
          </div>

          <h3 className="text-lg font-black text-slate-800 tracking-tight mt-1">
            {meal.schoolName}
          </h3>
          <p className="text-xs font-semibold text-rose-400">
            {meal.dateFormatted} · {meal.mealType}
          </p>

          <div className="my-3 border-t border-pink-200/80 w-3/4 mx-auto" />

          {/* Dishes */}
          <div className="space-y-1.5 py-1 text-left px-4">
            {meal.dishes.map((dish, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white/80 py-1.5 px-3 rounded-xl border border-pink-100 shadow-xs"
              >
                <span className="text-base shrink-0">{dish.icon}</span>
                <span className="truncate">{dish.name}</span>
              </div>
            ))}
          </div>

          {/* Calorie Footer */}
          <div className="mt-4 pt-2 border-t border-pink-200/80 flex items-center justify-between px-3 text-xs">
            <span className="font-bold text-rose-500 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              {meal.calories}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">얌얌급식 알리미</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleCopyText}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '식단 텍스트가 복사되었어요! 💕' : '급식 메뉴 텍스트 복사하기'}
          </button>

          <button
            onClick={() => window.print()}
            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            프린트 / PDF로 저장
          </button>
        </div>
      </div>
    </div>
  );
};
