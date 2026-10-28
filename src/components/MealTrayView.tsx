import React, { useState } from 'react';
import { 
  Flame, 
  Share2, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Sparkles, 
  AlertTriangle,
  Smile,
  Heart,
  ThumbsUp,
  Award
} from 'lucide-react';
import { ParsedMeal, DishItem, ALLERGEN_LIST } from '../types/neis';

interface MealTrayViewProps {
  currentMeal: ParsedMeal | null;
  allMealsForDay: ParsedMeal[];
  userAllergies: number[];
  onOpenNutrition: () => void;
  onOpenShare: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  selectedDateFormatted: string;
  isToday: boolean;
  onSelectMealType: (type: ParsedMeal['mealType']) => void;
  onLoadSample: () => void;
}

export const MealTrayView: React.FC<MealTrayViewProps> = ({
  currentMeal,
  allMealsForDay,
  userAllergies,
  onOpenNutrition,
  onOpenShare,
  onPrevDay,
  onNextDay,
  onToday,
  selectedDateFormatted,
  isToday,
  onSelectMealType,
  onLoadSample,
}) => {
  const [selectedDishDetail, setSelectedDishDetail] = useState<DishItem | null>(null);
  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    '😋': 18,
    '💖': 32,
    '🍚': 24,
    '✨': 15,
  });
  const [reactedKey, setReactedKey] = useState<string | null>(null);

  const handleReaction = (emoji: string) => {
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
    setReactedKey(emoji);
    setTimeout(() => setReactedKey(null), 1000);
  };

  // Helper to categorize dishes into tray wells
  // Compartment 1: Rice (밥)
  // Compartment 2: Soup (국/찌개)
  // Compartment 3: Main dish (고기, 치킨, 생선 등)
  // Compartment 4: Side dish (나물, 전, 볶음 등)
  // Compartment 5: Kimchi (김치, 깍두기, 피클)
  // Compartment 6: Dessert / Milk (디저트, 우유, 과일)
  const assignDishesToTray = (dishes: DishItem[]) => {
    let rice = dishes.find((d) => d.category === 'rice');
    let soup = dishes.find((d) => d.category === 'soup');
    let main = dishes.find((d) => d.category === 'main');
    let kimchi = dishes.find((d) => d.category === 'kimchi');
    let dessert = dishes.find((d) => d.category === 'dessert');

    // Fill remaining dishes into available slots
    const unassigned = dishes.filter(
      (d) => d !== rice && d !== soup && d !== main && d !== kimchi && d !== dessert
    );

    let side1 = unassigned[0] || dishes.find((d) => d.category === 'side');
    let side2 = unassigned[1];

    if (!rice && unassigned.length > 0) rice = unassigned.shift();
    if (!soup && unassigned.length > 0) soup = unassigned.shift();
    if (!main && unassigned.length > 0) main = unassigned.shift();
    if (!kimchi && unassigned.length > 0) kimchi = unassigned.shift();
    if (!dessert && unassigned.length > 0) dessert = unassigned.shift();

    return { rice, soup, main, side1, side2, kimchi, dessert };
  };

  const traySlots = currentMeal ? assignDishesToTray(currentMeal.dishes) : null;

  // Check if a dish contains user-selected allergens
  const getDishAllergyWarnings = (dish: DishItem | undefined) => {
    if (!dish) return [];
    return dish.allergens
      .filter((code) => userAllergies.includes(code))
      .map((code) => ALLERGEN_LIST.find((a) => a.code === code)!)
      .filter(Boolean);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Date Navigator & Bar */}
      <div className="bg-white/95 backdrop-blur-sm border border-pink-200/90 rounded-3xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Date Navigator */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrevDay}
            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-pink-50 rounded-xl transition-colors"
            title="이전 날짜"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-pink-50/70 border border-pink-100 rounded-2xl">
            <Calendar className="w-4 h-4 text-rose-500" />
            <span className="font-bold text-sm text-slate-800">
              {selectedDateFormatted}
            </span>
            {isToday && (
              <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                오늘
              </span>
            )}
          </div>

          <button
            onClick={onNextDay}
            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-pink-50 rounded-xl transition-colors"
            title="다음 날짜"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {!isToday && (
            <button
              onClick={onToday}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-2.5 py-1 hover:bg-pink-50 rounded-xl transition-colors ml-1"
            >
              오늘로
            </button>
          )}
        </div>

        {/* Meal Type Toggle (조식 / 중식 / 석식) */}
        {allMealsForDay.length > 1 ? (
          <div className="flex items-center bg-pink-100/70 p-1 rounded-2xl border border-pink-200">
            {allMealsForDay.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectMealType(m.mealType)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  currentMeal?.mealType === m.mealType
                    ? 'bg-white text-rose-600 shadow-xs scale-102'
                    : 'text-slate-600 hover:text-rose-500'
                }`}
              >
                {m.mealType === '조식' ? '☀️ 조식' : m.mealType === '석식' ? '🌙 석식' : '🍱 중식'}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs font-bold text-rose-600 bg-pink-50 border border-pink-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span>🍱</span>
            <span>{currentMeal?.mealType || '중식'}</span>
          </div>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {currentMeal && (
            <>
              <button
                onClick={onOpenNutrition}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-600 bg-slate-50 hover:bg-pink-50 border border-pink-200/80 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                title="영양성분 및 원산지"
              >
                <Info className="w-3.5 h-3.5 text-pink-500" />
                <span className="hidden sm:inline">영양·원산지</span>
              </button>

              <button
                onClick={onOpenShare}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                title="식단표 공유/저장"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">카드공유</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Tray Container */}
      {!currentMeal ? (
        /* Empty state: No meal served on this day */
        <div className="bg-white/90 backdrop-blur-sm border-2 border-dashed border-pink-200 rounded-3xl p-10 text-center shadow-sm">
          <div className="w-18 h-18 mx-auto bg-gradient-to-tr from-pink-200 to-rose-200 rounded-3xl flex items-center justify-center text-4xl shadow-inner mb-4">
            🍱
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            이 날은 등록된 급식이 없어요!
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            주말, 공휴일, 재량휴업일 또는 방학 기간이거나 학교에서 식단을 아직 등록하지 않은 상태예요.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={onPrevDay}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              ◀ 어제 급식 보기
            </button>
            <button
              onClick={onLoadSample}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              예시 식단으로 구경하기 🍓
            </button>
          </div>
        </div>
      ) : (
        /* The Realistic Cute Lunch Tray */
        <div className="relative bg-gradient-to-br from-[#FFF5F8] via-[#FFEBF1] to-[#FFDEE9] border-4 border-pink-200/90 rounded-[2.5rem] p-5 sm:p-7 lunch-tray-shadow transition-all">
          {/* Cute Tray Corner Screws / Dimples */}
          <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-pink-300/60 shadow-inner" />
          <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-pink-300/60 shadow-inner" />
          <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-pink-300/60 shadow-inner" />
          <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-pink-300/60 shadow-inner" />

          {/* Tray Header Bar */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-pink-200/60 mb-5 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-500 bg-white/80 px-3 py-1 rounded-full border border-pink-200 shadow-2xs">
                🍴 오늘의 식판
              </span>
              <span className="text-xs font-bold text-slate-700">
                {currentMeal.schoolName}
              </span>
            </div>

            {/* Calorie Pill with Cute Gauge */}
            <div className="flex items-center gap-2 bg-white/90 px-3.5 py-1.5 rounded-2xl border border-pink-200 shadow-xs">
              <Flame className="w-4 h-4 text-rose-500 shrink-0" />
              <div className="text-xs">
                <span className="font-extrabold text-rose-600">{currentMeal.calories}</span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-medium">
                  {currentMeal.caloriesNumber > 1000
                    ? '⚡ 든든에너지'
                    : '🥗 균형식단'}
                </span>
              </div>
            </div>
          </div>

          {/* THE TRAY COMPARTMENTS GRID */}
          <div className="space-y-4">
            {/* TOP ROW: 3 Side Wells (부반찬, 주반찬, 김치/절임) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Slot: Side 1 / Veggie */}
              <TrayCompartment
                label="반찬 1"
                defaultCategory="side"
                dish={traySlots?.side1 || currentMeal.dishes[2]}
                userAllergies={userAllergies}
                onClick={(d) => setSelectedDishDetail(d)}
              />

              {/* Slot: Main Protein / Cutlet / Meat */}
              <TrayCompartment
                label="주요리 (메인)"
                defaultCategory="main"
                isPrimary
                dish={traySlots?.main || currentMeal.dishes[1]}
                userAllergies={userAllergies}
                onClick={(d) => setSelectedDishDetail(d)}
              />

              {/* Slot: Kimchi / Banchan */}
              <TrayCompartment
                label="김치 / 나물"
                defaultCategory="kimchi"
                dish={traySlots?.kimchi || currentMeal.dishes[3]}
                userAllergies={userAllergies}
                onClick={(d) => setSelectedDishDetail(d)}
              />
            </div>

            {/* BOTTOM ROW: 2 Large Wells (밥 & 국) + Optional Dessert Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* Rice Well (Large) */}
              <div className="sm:col-span-5">
                <TrayCompartment
                  label="밥 (주식)"
                  defaultCategory="rice"
                  isLarge
                  dish={traySlots?.rice || currentMeal.dishes[0]}
                  userAllergies={userAllergies}
                  onClick={(d) => setSelectedDishDetail(d)}
                />
              </div>

              {/* Soup Well (Large) */}
              <div className="sm:col-span-4">
                <TrayCompartment
                  label="국 / 찌개"
                  defaultCategory="soup"
                  isLarge
                  dish={traySlots?.soup || currentMeal.dishes[1]}
                  userAllergies={userAllergies}
                  onClick={(d) => setSelectedDishDetail(d)}
                />
              </div>

              {/* Dessert / Drink Slot */}
              <div className="sm:col-span-3">
                <TrayCompartment
                  label="디저트 / 후식"
                  defaultCategory="dessert"
                  dish={traySlots?.dessert || traySlots?.side2 || currentMeal.dishes[4]}
                  userAllergies={userAllergies}
                  onClick={(d) => setSelectedDishDetail(d)}
                />
              </div>
            </div>
          </div>

          {/* Any remaining dishes in full menu */}
          {currentMeal.dishes.length > 5 && (
            <div className="mt-4 pt-3 border-t border-pink-200/50 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
              <span className="font-bold text-rose-500 text-[11px] mr-1">전체 식단:</span>
              {currentMeal.dishes.map((dish) => {
                const warnings = getDishAllergyWarnings(dish);
                return (
                  <button
                    key={dish.id}
                    onClick={() => setSelectedDishDetail(dish)}
                    className={`px-2.5 py-1 bg-white/80 hover:bg-white rounded-xl border border-pink-200 text-xs font-medium transition-all flex items-center gap-1 ${
                      warnings.length > 0 ? 'border-amber-300 bg-amber-50/60' : ''
                    }`}
                  >
                    <span>{dish.icon}</span>
                    <span>{dish.name}</span>
                    {warnings.length > 0 && (
                      <span className="text-[10px] text-amber-600 font-bold">⚠️</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Cute Reaction Stickers Bar */}
          <div className="mt-5 pt-3.5 border-t border-pink-200/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                오늘의 급식 반응:
              </span>
              {[
                { emoji: '😋', label: '꿀맛' },
                { emoji: '💖', label: '취향저격' },
                { emoji: '🍚', label: '밥도둑' },
                { emoji: '✨', label: '영양만점' },
              ].map((item) => (
                <button
                  key={item.emoji}
                  onClick={() => handleReaction(item.emoji)}
                  className={`px-2.5 py-1 rounded-xl bg-white/80 hover:bg-white border border-pink-200 text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1 active:scale-95 ${
                    reactedKey === item.emoji ? 'animate-ping' : ''
                  }`}
                  title={`${item.label} 누르기`}
                >
                  <span>{item.emoji}</span>
                  <span className="text-[11px] text-rose-500 font-bold">{reactions[item.emoji]}</span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              💡 반찬을 누르면 알레르기 유발물질 정보를 볼 수 있어요!
            </p>
          </div>
        </div>
      )}

      {/* Dish Detail Popup Modal */}
      {selectedDishDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedDishDetail(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border-2 border-pink-200 relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-100 to-rose-100 border border-pink-200 mx-auto flex items-center justify-center text-3xl shadow-inner mb-3">
              {selectedDishDetail.icon}
            </div>

            <h4 className="text-base font-bold text-slate-800">
              {selectedDishDetail.name}
            </h4>

            {/* Allergens In This Dish */}
            <div className="mt-3">
              <div className="text-xs font-bold text-slate-500 mb-2">
                포함된 알레르기 유발 성분
              </div>
              {selectedDishDetail.allergens.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {selectedDishDetail.allergens.map((code) => {
                    const meta = ALLERGEN_LIST.find((a) => a.code === code);
                    const isMyAllergy = userAllergies.includes(code);
                    return (
                      <span
                        key={code}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 border ${
                          isMyAllergy
                            ? 'bg-rose-100 text-rose-700 border-rose-300 ring-2 ring-rose-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span>{meta?.icon || '⚠️'}</span>
                        <span>{meta?.shortName || `알레르기 ${code}번`}</span>
                        {isMyAllergy && (
                          <span className="text-[10px] bg-rose-500 text-white px-1 rounded-sm">주의</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-100">
                  🌱 등록된 법정 알레르기 유발 성분이 없습니다.
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedDishDetail(null)}
              className="mt-5 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* Single Tray Compartment (Well) */
interface TrayCompartmentProps {
  label: string;
  defaultCategory: DishItem['category'];
  dish?: DishItem;
  isPrimary?: boolean;
  isLarge?: boolean;
  userAllergies: number[];
  onClick: (dish: DishItem) => void;
}

const TrayCompartment: React.FC<TrayCompartmentProps> = ({
  label,
  dish,
  isPrimary,
  isLarge,
  userAllergies,
  onClick,
}) => {
  const warnings = dish
    ? dish.allergens
        .filter((code) => userAllergies.includes(code))
        .map((code) => ALLERGEN_LIST.find((a) => a.code === code)!)
        .filter(Boolean)
    : [];

  const hasAllergyWarning = warnings.length > 0;

  return (
    <div
      onClick={() => dish && onClick(dish)}
      className={`relative group rounded-3xl p-4 transition-all flex flex-col justify-between cursor-pointer lunch-cell-shadow border ${
        dish
          ? hasAllergyWarning
            ? 'bg-amber-50/90 border-amber-300 hover:border-rose-400'
            : isPrimary
            ? 'bg-white/95 border-rose-200 hover:border-rose-300'
            : 'bg-white/90 border-pink-100/90 hover:border-pink-300'
          : 'bg-pink-100/30 border-dashed border-pink-200'
      } ${isLarge ? 'min-h-[140px]' : 'min-h-[110px]'}`}
    >
      {/* Category Tag */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
        <span className="font-semibold text-rose-400">{label}</span>
        {hasAllergyWarning && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300">
            <AlertTriangle className="w-2.5 h-2.5" />
            알레르기 주의
          </span>
        )}
      </div>

      {/* Dish Name & Visual Icon */}
      {dish ? (
        <div className="my-auto text-center py-1">
          <div className="text-3xl select-none mb-1 group-hover:scale-110 transition-transform">
            {dish.icon}
          </div>
          <div className="font-extrabold text-sm text-slate-800 leading-snug line-clamp-2">
            {dish.name}
          </div>
        </div>
      ) : (
        <div className="my-auto text-center text-xs text-slate-300 font-medium">
          메뉴 없음
        </div>
      )}

      {/* Bottom Allergens or Hint */}
      {dish && (
        <div className="mt-1 flex items-center justify-center gap-1 overflow-hidden">
          {dish.allergens.length > 0 ? (
            <div className="flex items-center gap-0.5 text-[10px] text-slate-400 truncate">
              <span>알레르기:</span>
              <span className="font-mono text-slate-500 font-semibold truncate">
                {dish.allergens.join(', ')}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-300">안심 메뉴</span>
          )}
        </div>
      )}
    </div>
  );
};
