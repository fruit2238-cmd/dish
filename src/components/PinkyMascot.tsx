import React, { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface PinkyMascotProps {
  schoolName: string;
  todayMenuName?: string;
}

export const PinkyMascot: React.FC<PinkyMascotProps> = ({ schoolName, todayMenuName }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isWaving, setIsWaving] = useState(false);

  const quotes = [
    `오늘도 맛있는 급식 먹고 힘찬 하루 보내요! 🍱✨`,
    `우리 학교 급식이 제일 맛있어! 😋💖`,
    todayMenuName ? `오늘의 메인 메뉴는 [${todayMenuName}]! 기대돼요 🎶` : `오늘 급식 메뉴를 확인해보세요! 🥢`,
    `편식 없이 골고루 먹고 건강해지기! 약속~ 🤙🍓`,
    `친구랑 같이 먹으면 두 배로 맛있어요! 👯‍♂️💕`,
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  return (
    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-pink-200/90 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all">
      {/* Mascot Avatar */}
      <button
        onClick={() => setIsWaving(true)}
        onAnimationEnd={() => setIsWaving(false)}
        className={`relative shrink-0 w-12 h-12 bg-gradient-to-tr from-pink-300 to-rose-200 rounded-2xl flex items-center justify-center shadow-inner cursor-pointer group transition-transform ${
          isWaving ? 'animate-bounce' : 'hover:scale-105'
        }`}
        title="얌얌이를 톡톡 두드려보세요!"
      >
        <div className="text-2xl select-none transform transition-transform group-hover:rotate-12">
          🍙
        </div>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
        </span>
        <div className="absolute -bottom-1 -right-1 text-xs">
          🍓
        </div>
      </button>

      {/* Mascot speech */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
          <span>급식 요정 얌얌이</span>
          <Sparkles className="w-3 h-3 text-pink-400" />
          <span className="text-[11px] text-pink-300 font-normal">· {schoolName}</span>
        </div>
        <p className="text-sm font-medium text-slate-700 truncate mt-0.5">
          {quotes[quoteIndex]}
        </p>
      </div>

      <button
        onClick={() => setQuoteIndex((prev) => (prev + 1) % quotes.length)}
        className="text-pink-400 hover:text-rose-500 p-1.5 rounded-xl hover:bg-pink-50 transition-colors shrink-0"
        title="다음 말풍선 보기"
      >
        <Heart className="w-4 h-4 fill-pink-100" />
      </button>
    </div>
  );
};
