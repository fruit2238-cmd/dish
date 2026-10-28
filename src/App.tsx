import React, { useState, useEffect, useCallback } from 'react';
import { 
  SchoolInfo, 
  ParsedMeal, 
  POPULAR_PRESET_SCHOOLS, 
  MealTimeType 
} from './types/neis';
import { 
  getMeals, 
  getWeekDates, 
  formatDateToYmd, 
  formatYmdToKorean, 
  getStoredApiKey, 
  getStoredUserAllergies, 
  getLastSchool, 
  setLastSchool, 
  getSampleMealsForWeek 
} from './services/neisApi';

import { Header } from './components/Header';
import { PinkyMascot } from './components/PinkyMascot';
import { MealTrayView } from './components/MealTrayView';
import { WeeklyMealView } from './components/WeeklyMealView';
import { MonthlyMealView } from './components/MonthlyMealView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SchoolSearchModal } from './components/SchoolSearchModal';
import { AllergyModal } from './components/AllergyModal';
import { NutritionModal } from './components/NutritionModal';
import { ShareCardModal } from './components/ShareCardModal';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

export default function App() {
  // Current selected school (default: saved or 서울고등학교)
  const [currentSchool, setCurrentSchool] = useState<SchoolInfo>(() => {
    return getLastSchool() || POPULAR_PRESET_SCHOOLS[0];
  });

  // Date and View states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMealType, setSelectedMealType] = useState<MealTimeType>('중식');
  const [activeTab, setActiveTab] = useState<'tray' | 'weekly' | 'monthly'>('tray');

  // Data states
  const [meals, setMeals] = useState<ParsedMeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSampleMode, setIsSampleMode] = useState(false);

  // Settings states
  const [hasCustomApiKey, setHasCustomApiKey] = useState<boolean>(() => Boolean(getStoredApiKey()));
  const [userAllergies, setUserAllergies] = useState<number[]>(() => getStoredUserAllergies());

  // Modal open states
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isSchoolSearchOpen, setIsSchoolSearchOpen] = useState(false);
  const [isAllergyOpen, setIsAllergyOpen] = useState(false);
  const [isNutritionOpen, setIsNutritionOpen] = useState(false);
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);

  // Fetch meals for the given school and date range
  const loadMeals = useCallback(async (school: SchoolInfo, targetDate: Date) => {
    setLoading(true);
    setIsSampleMode(false);

    try {
      // Fetch 3 weeks window around target date to populate week view, tray view, and calendar
      const start = new Date(targetDate);
      start.setDate(targetDate.getDate() - 14);
      const end = new Date(targetDate);
      end.setDate(targetDate.getDate() + 14);

      const fromYmd = formatDateToYmd(start);
      const toYmd = formatDateToYmd(end);

      const fetchedMeals = await getMeals(
        school.ATPT_OFCDC_SC_CODE,
        school.SD_SCHUL_CODE,
        fromYmd,
        toYmd
      );

      // If NEIS has meal records in this period, use them!
      if (fetchedMeals && fetchedMeals.length > 0) {
        setMeals(fetchedMeals);
      } else {
        // Fallback: Check if the school has any registered meals earlier this year (e.g. 2024~2025)
        const recentFallback = await getMeals(
          school.ATPT_OFCDC_SC_CODE,
          school.SD_SCHUL_CODE,
          '20240901',
          '20240930'
        );

        if (recentFallback && recentFallback.length > 0) {
          setMeals(recentFallback);
        } else {
          // If still empty (e.g. test school or offline), provide delicious sample meals
          const samples = getSampleMealsForWeek(school, targetDate);
          setMeals(samples);
          setIsSampleMode(true);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch from NEIS, loading sample mode:', err);
      const samples = getSampleMealsForWeek(school, targetDate);
      setMeals(samples);
      setIsSampleMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial and school change trigger
  useEffect(() => {
    if (currentSchool) {
      setLastSchool(currentSchool);
      loadMeals(currentSchool, selectedDate);
    }
  }, [currentSchool, loadMeals]);

  // Handle manual sample loader
  const handleLoadSample = () => {
    const samples = getSampleMealsForWeek(currentSchool, selectedDate);
    setMeals(samples);
    setIsSampleMode(true);
  };

  // Group meals by YMD date
  const mealsByDate: { [ymd: string]: ParsedMeal[] } = {};
  for (const m of meals) {
    if (!mealsByDate[m.date]) {
      mealsByDate[m.date] = [];
    }
    mealsByDate[m.date].push(m);
  }

  // Selected date helpers
  const selectedYmd = formatDateToYmd(selectedDate);
  const todayYmd = formatDateToYmd(new Date());
  const isToday = selectedYmd === todayYmd;
  const selectedDateFormatted = formatYmdToKorean(selectedYmd);

  // Current day meals
  const dayMeals = mealsByDate[selectedYmd] || [];
  const currentMeal =
    dayMeals.find((m) => m.mealType === selectedMealType) ||
    dayMeals[0] ||
    null;

  // Week helpers
  const weekInfo = getWeekDates(selectedDate);

  // Day navigation
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(selectedDate.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 1);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Week navigation
  const handlePrevWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(selectedDate.getDate() - 7);
    setSelectedDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 7);
    setSelectedDate(next);
  };

  const handleSelectYmd = (ymd: string) => {
    const year = parseInt(ymd.slice(0, 4), 10);
    const month = parseInt(ymd.slice(4, 6), 10) - 1;
    const day = parseInt(ymd.slice(6, 8), 10);
    setSelectedDate(new Date(year, month, day));
    setActiveTab('tray');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header
        currentSchool={currentSchool}
        hasCustomApiKey={hasCustomApiKey}
        userAllergiesCount={userAllergies.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSchoolSearch={() => setIsSchoolSearchOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyOpen(true)}
        onOpenAllergyModal={() => setIsAllergyOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Cute Mascot Greeting & School Banner */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <PinkyMascot
              schoolName={currentSchool?.SCHUL_NM || '우리 학교'}
              todayMenuName={currentMeal?.dishes[1]?.name || currentMeal?.dishes[0]?.name}
            />
          </div>

          {/* Quick Refresh / Status Badge */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isSampleMode && (
              <span className="text-[11px] font-bold bg-pink-100 text-rose-600 px-3 py-1.5 rounded-2xl border border-pink-200 flex items-center gap-1 shadow-2xs">
                <span>🍰</span>
                <span>체험 샘플 모드</span>
              </span>
            )}
            <button
              onClick={() => loadMeals(currentSchool, selectedDate)}
              disabled={loading}
              className="p-2.5 bg-white hover:bg-pink-50 border border-pink-200 text-slate-600 hover:text-rose-500 rounded-2xl shadow-2xs transition-all disabled:opacity-50"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Loading Spinner Indicator */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-xs font-bold text-rose-500 bg-white/70 rounded-3xl border border-pink-100">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>나이스 교육정보 개방포털에서 식단을 가져오고 있어요... 🍱</span>
          </div>
        )}

        {/* Dynamic View by activeTab */}
        {activeTab === 'tray' && (
          <MealTrayView
            currentMeal={currentMeal}
            allMealsForDay={dayMeals}
            userAllergies={userAllergies}
            onOpenNutrition={() => setIsNutritionOpen(true)}
            onOpenShare={() => setIsShareCardOpen(true)}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onToday={handleToday}
            selectedDateFormatted={selectedDateFormatted}
            isToday={isToday}
            onSelectMealType={setSelectedMealType}
            onLoadSample={handleLoadSample}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyMealView
            weekDays={weekInfo.days}
            mealsByDate={mealsByDate}
            userAllergies={userAllergies}
            onSelectDate={handleSelectYmd}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onCurrentWeek={handleToday}
            currentSelectedYmd={selectedYmd}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyMealView
            currentDate={selectedDate}
            mealsByDate={mealsByDate}
            onSelectDate={handleSelectYmd}
            onMonthChange={(newD) => {
              setSelectedDate(newD);
              loadMeals(currentSchool, newD);
            }}
            currentSelectedYmd={selectedYmd}
          />
        )}
      </main>

      {/* Cute Footer */}
      <footer className="mt-auto border-t border-pink-200/80 bg-white/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-bold text-rose-500">
            <span>🍱 얌얌급식</span>
            <span>·</span>
            <span className="text-slate-600">대한민국 학교 급식 맛있는 하루</span>
            <span>💖</span>
          </div>
          <p className="text-[11px] text-slate-400">
            본 서비스는 교육부 <span className="font-semibold text-slate-500">나이스(NEIS) 교육정보 개방 포털 Open API</span>를 정식 연동하여 제공됩니다.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-400">
            <button
              onClick={() => setIsApiKeyOpen(true)}
              className="hover:text-rose-500 hover:underline"
            >
              나이스 API키 설정
            </button>
            <span>·</span>
            <button
              onClick={() => setIsAllergyOpen(true)}
              className="hover:text-rose-500 hover:underline"
            >
              알레르기 필터 설정
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSchoolSearchOpen(true)}
              className="hover:text-rose-500 hover:underline"
            >
              학교 변경하기
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        onKeyUpdated={() => {
          setHasCustomApiKey(Boolean(getStoredApiKey()));
          loadMeals(currentSchool, selectedDate);
        }}
      />

      <SchoolSearchModal
        isOpen={isSchoolSearchOpen}
        onClose={() => setIsSchoolSearchOpen(false)}
        currentSchool={currentSchool}
        onSelectSchool={(school) => {
          setCurrentSchool(school);
          loadMeals(school, selectedDate);
        }}
      />

      <AllergyModal
        isOpen={isAllergyOpen}
        onClose={() => setIsAllergyOpen(false)}
        onAllergiesUpdated={() => {
          setUserAllergies(getStoredUserAllergies());
        }}
      />

      <NutritionModal
        isOpen={isNutritionOpen}
        onClose={() => setIsNutritionOpen(false)}
        meal={currentMeal}
      />

      <ShareCardModal
        isOpen={isShareCardOpen}
        onClose={() => setIsShareCardOpen(false)}
        meal={currentMeal}
      />
    </div>
  );
}
