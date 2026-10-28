import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Flame, AlertTriangle, ArrowRight } from 'lucide-react';
import { ParsedMeal, ALLERGEN_LIST } from '../types/neis';

interface WeeklyMealViewProps {
  weekDays: { date: Date; ymd: string; dayName: string; isToday: boolean }[];
  mealsByDate: { [ymd: string]: ParsedMeal[] };
  userAllergies: number[];
  onSelectDate: (ymd: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  currentSelectedYmd: string;
}

export const WeeklyMealView: React.FC<WeeklyMealViewProps> = ({
  weekDays,
  mealsByDate,
  userAllergies,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  currentSelectedYmd,
}) => {
  const weekStart = weekDays[0];
  const weekEnd = weekDays[weekDays.length - 1];

  const formatWeekRange = () => {
    if (!weekStart || !weekEnd) return '';
    const s = weekStart.date;
    const e = weekEnd.date;
    return `${s.getFullYear()}.${s.getMonth() + 1}.${s.getDate()} ~ ${e.getMonth() + 1}.${e.getDate()}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Week Navigator */}
      <div className="bg-white/95 backdrop-blur-sm border border-pink-200/90 rounded-3xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-100 text-rose-500 rounded-2xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              주간 급식 식단표 (월~금)
            </h3>
            <p className="text-xs text-rose-500 font-medium">
              {formatWeekRange()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrevWeek}
            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-pink-50 rounded-xl transition-colors"
            title="지난주"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onCurrentWeek}
            className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl transition-colors"
          >
            이번 주
          </button>
          <button
            onClick={onNextWeek}
            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-pink-50 rounded-xl transition-colors"
            title="다음주"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 5-Day Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
        {weekDays.map((day) => {
          const meals = mealsByDate[day.ymd] || [];
          const meal = meals.find((m) => m.mealType === '중식') || meals[0];
          const isSelected = currentSelectedYmd === day.ymd;

          return (
            <div
              key={day.ymd}
              onClick={() => onSelectDate(day.ymd)}
              className={`relative rounded-3xl p-4 border transition-all flex flex-col justify-between cursor-pointer group shadow-2xs hover:shadow-md ${
                isSelected
                  ? 'bg-gradient-to-b from-rose-50/90 to-pink-50/90 border-2 border-rose-400 ring-2 ring-pink-200'
                  : day.isToday
                  ? 'bg-white border-2 border-pink-300'
                  : 'bg-white/90 hover:bg-white border-pink-100 hover:border-pink-200'
              }`}
            >
              {/* Day Header */}
              <div className="pb-2.5 border-b border-pink-100 flex items-center justify-between">
                <div>
                  <span
                    className={`text-xs font-black ${
                      day.dayName === '월'
                        ? 'text-amber-600'
                        : day.dayName === '금'
                        ? 'text-rose-600'
                        : 'text-slate-700'
                    }`}
                  >
                    {day.dayName}요일
                  </span>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {day.date.getMonth() + 1}.{day.date.getDate()}
                  </div>
                </div>

                {day.isToday && (
                  <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-2xs">
                    오늘
                  </span>
                )}
              </div>

              {/* Meal dishes */}
              <div className="my-3 flex-1">
                {meal && meal.dishes.length > 0 ? (
                  <ul className="space-y-1.5 text-xs">
                    {meal.dishes.map((dish, idx) => {
                      const warnings = dish.allergens
                        .filter((code) => userAllergies.includes(code))
                        .map((code) => ALLERGEN_LIST.find((a) => a.code === code)!)
                        .filter(Boolean);

                      return (
                        <li
                          key={idx}
                          className={`flex items-start gap-1.5 py-1 px-1.5 rounded-lg transition-colors ${
                            warnings.length > 0
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'text-slate-700 hover:bg-pink-50/50'
                          }`}
                        >
                          <span className="text-sm shrink-0 select-none">{dish.icon}</span>
                          <span className="font-semibold text-[11px] leading-tight line-clamp-2">
                            {dish.name}
                          </span>
                          {warnings.length > 0 && (
                            <span className="text-[9px] text-amber-600 font-bold ml-auto shrink-0">
                              ⚠️
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                    <span className="text-xl mb-1">🍰</span>
                    <span>급식 없음</span>
                  </div>
                )}
              </div>

              {/* Footer info: Calories and tray link */}
              <div className="pt-2 border-t border-pink-100 flex items-center justify-between text-[11px]">
                {meal ? (
                  <>
                    <div className="flex items-center gap-1 font-bold text-rose-500">
                      <Flame className="w-3 h-3" />
                      <span>{meal.calories.replace(' Kcal', '')} kcal</span>
                    </div>
                    <span className="text-rose-400 group-hover:text-rose-600 flex items-center gap-0.5 font-bold">
                      식판보기
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">쉬는 날</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
