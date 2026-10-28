import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { ParsedMeal } from '../types/neis';
import { formatDateToYmd } from '../services/neisApi';

interface MonthlyMealViewProps {
  currentDate: Date;
  mealsByDate: { [ymd: string]: ParsedMeal[] };
  onSelectDate: (ymd: string) => void;
  onMonthChange: (newDate: Date) => void;
  currentSelectedYmd: string;
}

export const MonthlyMealView: React.FC<MonthlyMealViewProps> = ({
  currentDate,
  mealsByDate,
  onSelectDate,
  onMonthChange,
  currentSelectedYmd,
}) => {
  const [viewDate, setViewDate] = useState<Date>(new Date(currentDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed

  // Prev / Next month
  const handlePrevMonth = () => {
    const next = new Date(year, month - 1, 1);
    setViewDate(next);
    onMonthChange(next);
  };

  const handleNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setViewDate(next);
    onMonthChange(next);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setViewDate(now);
    onMonthChange(now);
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  // Blank days before 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(new Date(year, month, d));
  }

  const todayYmd = formatDateToYmd(new Date());

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Month Navigator */}
      <div className="bg-white/95 backdrop-blur-sm border border-pink-200/90 rounded-3xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-100 text-rose-500 rounded-2xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              월간 급식 달력
            </h3>
            <p className="text-xs text-rose-500 font-semibold">
              {year}년 {month + 1}월
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-pink-50 rounded-xl transition-colors"
            title="이전 달"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleCurrentMonth}
            className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl transition-colors"
          >
            이번 달
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-pink-50 rounded-xl transition-colors"
            title="다음 달"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/95 backdrop-blur-sm border border-pink-200/90 rounded-3xl p-4 sm:p-6 shadow-sm">
        {/* Day of week headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs pb-3 border-b border-pink-100">
          <div className="text-rose-500">일</div>
          <div className="text-slate-700">월</div>
          <div className="text-slate-700">화</div>
          <div className="text-slate-700">수</div>
          <div className="text-slate-700">목</div>
          <div className="text-slate-700">금</div>
          <div className="text-blue-500">토</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-3">
          {calendarCells.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="min-h-[70px] sm:min-h-[85px]" />;
            }

            const ymd = formatDateToYmd(date);
            const isToday = ymd === todayYmd;
            const isSelected = ymd === currentSelectedYmd;
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const meals = mealsByDate[ymd] || [];
            const hasMeal = meals.length > 0;
            const primaryMeal = meals[0];

            return (
              <div
                key={ymd}
                onClick={() => onSelectDate(ymd)}
                className={`min-h-[70px] sm:min-h-[85px] p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-rose-50/90 border-2 border-rose-400 ring-2 ring-pink-200 shadow-sm'
                    : isToday
                    ? 'bg-pink-50/60 border-2 border-pink-300'
                    : hasMeal
                    ? 'bg-white hover:bg-pink-50/40 border-pink-100 hover:border-pink-200'
                    : 'bg-slate-50/50 border-slate-100 text-slate-300'
                }`}
              >
                {/* Date number */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      dayOfWeek === 0
                        ? 'text-rose-500'
                        : dayOfWeek === 6
                        ? 'text-blue-500'
                        : isWeekend
                        ? 'text-slate-400'
                        : 'text-slate-700'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {isToday && (
                    <span className="text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                      오늘
                    </span>
                  )}
                </div>

                {/* Meal preview */}
                <div className="my-auto">
                  {hasMeal ? (
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold text-rose-600 truncate bg-pink-100/70 px-1 py-0.5 rounded-md">
                        {primaryMeal.dishes[1]?.name || primaryMeal.dishes[0]?.name || '급식'}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate hidden sm:block">
                        {primaryMeal.calories.replace(' Kcal', '')} kcal
                      </div>
                    </div>
                  ) : isWeekend ? (
                    <span className="text-[10px] text-slate-300 select-none block text-center">
                      주말
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300 select-none block text-center">
                      -
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
