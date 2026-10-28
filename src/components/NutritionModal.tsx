import React from 'react';
import { Activity, X, Flame, Users, Apple, MapPin } from 'lucide-react';
import { ParsedMeal } from '../types/neis';

interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: ParsedMeal | null;
}

export const NutritionModal: React.FC<NutritionModalProps> = ({
  isOpen,
  onClose,
  meal,
}) => {
  if (!isOpen || !meal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border-2 border-pink-200 flex flex-col overflow-hidden max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-300 via-teal-400 to-pink-300" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">영양 및 원산지 정보</h2>
              <p className="text-xs text-slate-500">
                {meal.dateFormatted} · {meal.mealType} ({meal.schoolName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-pink-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key Highlights */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-rose-500 flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">총 열량</div>
              <div className="text-base font-extrabold text-rose-600">{meal.calories}</div>
            </div>
          </div>

          <div className="p-3 bg-pink-50 border border-pink-200 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-pink-500 flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">급식 인원수</div>
              <div className="text-base font-extrabold text-slate-700">
                {meal.headCount ? `${meal.headCount.toLocaleString()}명` : '정보 없음'}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs / Scrollable area */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Nutrition List */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Apple className="w-4 h-4 text-emerald-500" />
              <span>영양성분 상세 (1인 기준)</span>
            </div>
            {meal.nutrition.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {meal.nutrition.map((item, index) => (
                  <div
                    key={index}
                    className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl"
                  >
                    <div className="text-[11px] text-slate-500 truncate">{item.label}</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                등록된 상세 영양성분 정보가 없습니다.
              </p>
            )}
          </div>

          {/* Origin Info */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>식재료 원산지 정보</span>
            </div>
            {meal.originInfo.length > 0 ? (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 divide-y divide-slate-200/60 max-h-48 overflow-y-auto text-xs">
                {meal.originInfo.map((origin, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between text-slate-700">
                    <span className="font-medium">{origin}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                등록된 원산지 정보가 없습니다.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-pink-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
