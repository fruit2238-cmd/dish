import { SchoolInfo, ParsedMeal, DishItem, NutritionItem, MealTimeType, ALLERGEN_LIST } from '../types/neis';

const API_KEY_STORAGE_KEY = 'yumyum_neis_api_key';
const FAVORITES_STORAGE_KEY = 'yumyum_favorite_schools';
const LAST_SCHOOL_STORAGE_KEY = 'yumyum_last_selected_school';
const USER_ALLERGIES_STORAGE_KEY = 'yumyum_user_allergies';

// Get and set user NEIS API key
export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

// User allergies management
export function getStoredUserAllergies(): number[] {
  try {
    const raw = localStorage.getItem(USER_ALLERGIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setStoredUserAllergies(allergies: number[]): void {
  try {
    localStorage.setItem(USER_ALLERGIES_STORAGE_KEY, JSON.stringify(allergies));
  } catch {
    // ignore
  }
}

// Favorite schools management
export function getFavoriteSchools(): SchoolInfo[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFavoriteSchool(school: SchoolInfo): void {
  try {
    const current = getFavoriteSchools();
    if (!current.some(s => s.SD_SCHUL_CODE === school.SD_SCHUL_CODE)) {
      const updated = [school, ...current].slice(0, 10);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch {
    // ignore
  }
}

export function removeFavoriteSchool(schoolCode: string): void {
  try {
    const current = getFavoriteSchools();
    const updated = current.filter(s => s.SD_SCHUL_CODE !== schoolCode);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getLastSchool(): SchoolInfo | null {
  try {
    const raw = localStorage.getItem(LAST_SCHOOL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLastSchool(school: SchoolInfo): void {
  try {
    localStorage.setItem(LAST_SCHOOL_STORAGE_KEY, JSON.stringify(school));
  } catch {
    // ignore
  }
}

// Low-level fetcher with dual fallback (proxy + direct open.neis.go.kr)
async function requestNeis(endpoint: string, params: Record<string, string | number>): Promise<any> {
  const apiKey = getStoredApiKey();
  const searchParams = new URLSearchParams();
  searchParams.set('Type', 'json');
  
  if (apiKey) {
    searchParams.set('KEY', apiKey);
  }

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      searchParams.set(k, String(v));
    }
  }

  const queryString = searchParams.toString();
  const directUrl = `https://open.neis.go.kr/hub/${endpoint}?${queryString}`;

  // 1. Direct fetch to NEIS API (open.neis.go.kr supports CORS Access-Control-Allow-Origin: *)
  try {
    const directRes = await fetch(directUrl);
    if (directRes.ok) {
      return await directRes.json();
    }
  } catch (err) {
    console.warn('Direct NEIS fetch failed, attempting proxy fallback...', err);
  }

  // 2. Proxy fetch fallback (for environments with Vite proxy or server route)
  try {
    const proxyUrl = `/api/neis/hub/${endpoint}?${queryString}`;
    const proxyRes = await fetch(proxyUrl, { headers: { Accept: 'application/json' } });
    if (proxyRes.ok) {
      return await proxyRes.json();
    }
  } catch (err) {
    console.warn('Proxy NEIS fetch failed:', err);
  }

  throw new Error('NEIS API 요청에 실패했습니다.');
}

// Search schools by name
export async function searchSchools(keyword: string): Promise<SchoolInfo[]> {
  const trimmed = keyword.trim();
  if (!trimmed) return [];

  const data = await requestNeis('schoolInfo', {
    pIndex: 1,
    pSize: 30,
    SCHUL_NM: trimmed,
  });

  if (!data?.schoolInfo || !data.schoolInfo[1]?.row) {
    return [];
  }

  return data.schoolInfo[1].row as SchoolInfo[];
}

// Test custom NEIS API key validity
export async function testNeisApiKey(testKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const params = new URLSearchParams({
      Type: 'json',
      KEY: testKey.trim(),
      pIndex: '1',
      pSize: '1',
      SCHUL_NM: '서울고등학교',
    });

    const directUrl = `https://open.neis.go.kr/hub/schoolInfo?${params.toString()}`;
    const res = await fetch(directUrl);
    const data = await res.json();

    if (data?.RESULT?.CODE && data.RESULT.CODE.startsWith('ERROR')) {
      return { success: false, message: data.RESULT.MESSAGE || '인증키가 유효하지 않습니다.' };
    }
    if (data?.schoolInfo) {
      return { success: true, message: '정상 작동하는 나이스 인증키입니다!' };
    }
    return { success: true, message: '인증키 연결에 성공했습니다.' };
  } catch (err: any) {
    return { success: false, message: err.message || '네트워크 연결 오류' };
  }
}

// Categorize dish to assign cute icon and lunch tray compartment
function categorizeDish(dishName: string): { category: DishItem['category']; icon: string } {
  const clean = dishName.toLowerCase();

  // Rice (밥, 덮밥, 볶음밥 등)
  if (clean.includes('밥') || clean.includes('라이스') || clean.includes('필라프') || clean.includes('죽') || clean.includes('리조또') || clean.includes('덮밥')) {
    return { category: 'rice', icon: '🍚' };
  }
  // Soup (국, 찌개, 탕, 스프, 전골)
  if (clean.includes('국') || clean.includes('찌개') || clean.includes('탕') || clean.includes('스프') || clean.includes('전골') || clean.includes('누룽지')) {
    return { category: 'soup', icon: '🍲' };
  }
  // Kimchi / Pickles
  if (clean.includes('김치') || clean.includes('깍두기') || clean.includes('석박지') || clean.includes('겉절이') || clean.includes('단무지') || clean.includes('피클') || clean.includes('생채')) {
    return { category: 'kimchi', icon: '🥬' };
  }
  // Dessert / Drinks / Fruit
  if (clean.includes('우유') || clean.includes('요구르트') || clean.includes('쥬스') || clean.includes('주스') || 
      clean.includes('케익') || clean.includes('과일') || clean.includes('사과') || clean.includes('바나나') || 
      clean.includes('딸기') || clean.includes('포도') || clean.includes('마카롱') || clean.includes('아이스크림') || 
      clean.includes('푸딩') || clean.includes('도넛') || clean.includes('와플') || clean.includes('음료') || clean.includes('젤리') || clean.includes('빵')) {
    return { category: 'dessert', icon: '🍓' };
  }
  // Main Dishes (Meat, Cutlet, Stew, Fish)
  if (clean.includes('불고기') || clean.includes('까스') || clean.includes('카츠') || clean.includes('고기') || 
      clean.includes('갈비') || clean.includes('치킨') || clean.includes('닭') || clean.includes('삼겹') || 
      clean.includes('스테이크') || clean.includes('함박') || clean.includes('탕수육') || clean.includes('볶음') || 
      clean.includes('구이') || clean.includes('조림') || clean.includes('찜') || clean.includes('파스타') || clean.includes('스파게티')) {
    return { category: 'main', icon: '🍗' };
  }
  // Side Dishes (Salad, Greens, Tofu, Egg)
  return { category: 'side', icon: '🥗' };
}

// Parse dish string from NEIS
export function parseDishes(dishRaw: string): DishItem[] {
  if (!dishRaw) return [];

  // NEIS dishes come separated by <br/> e.g.: "찰흑미밥 <br/>소고기미역국 (5.6.16)<br/>돈육불고기 (10.13)..."
  const lines = dishRaw
    .split(/<br\s*\/?>/gi)
    .map(line => line.trim())
    .filter(Boolean);

  return lines.map((line, idx) => {
    // Extract allergen numbers e.g. (1.2.5.6) or (5,6,13)
    const match = line.match(/\(([0-9.,\s]+)\)/);
    const allergens: number[] = [];
    if (match && match[1]) {
      const numbers = match[1].split(/[.,\s]+/).filter(Boolean);
      for (const num of numbers) {
        const parsed = parseInt(num, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 19) {
          if (!allergens.includes(parsed)) allergens.push(parsed);
        }
      }
    }

    // Clean dish name without brackets
    const name = line.replace(/\([0-9.,\s]+\)/g, '').trim();
    const { category, icon } = categorizeDish(name);

    return {
      id: `dish-${idx}-${name}`,
      name,
      allergens,
      category,
      icon,
    };
  });
}

// Parse nutrition string
export function parseNutrition(nutRaw: string): NutritionItem[] {
  if (!nutRaw) return [];
  const lines = nutRaw.split(/<br\s*\/?>/gi).map(l => l.trim()).filter(Boolean);
  return lines.map(line => {
    // e.g. "탄수화물(g) : 159.8"
    const parts = line.split(':');
    const label = parts[0]?.trim() || line;
    const value = parts[1]?.trim() || '';
    return {
      label,
      value,
      unit: '',
    };
  });
}

// Parse origin info string
export function parseOrigin(originRaw: string): string[] {
  if (!originRaw) return [];
  return originRaw.split(/<br\s*\/?>/gi).map(l => l.trim()).filter(l => Boolean(l) && !l.startsWith('비고'));
}

// Format YYYYMMDD to human readable Korean date: "2026.10.28 (수)"
export function formatYmdToKorean(ymd: string): string {
  if (ymd.length !== 8) return ymd;
  const year = ymd.slice(0, 4);
  const month = ymd.slice(4, 6);
  const day = ymd.slice(6, 8);
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${year}.${month}.${day} (${dayOfWeek})`;
}

// Fetch meals for date range
export async function getMeals(
  officeCode: string,
  schoolCode: string,
  fromYmd: string,
  toYmd: string
): Promise<ParsedMeal[]> {
  try {
    const data = await requestNeis('mealServiceDietInfo', {
      pIndex: 1,
      pSize: 100,
      ATPT_OFCDC_SC_CODE: officeCode,
      SD_SCHUL_CODE: schoolCode,
      MLSV_FROM_YMD: fromYmd,
      MLSV_TO_YMD: toYmd,
    });

    if (!data?.mealServiceDietInfo || !data.mealServiceDietInfo[1]?.row) {
      return [];
    }

    const rows = data.mealServiceDietInfo[1].row;
    return rows.map((row: any, index: number): ParsedMeal => {
      const dishes = parseDishes(row.DDISH_NM || '');
      const calStr = row.CAL_INFO || '0 Kcal';
      const calNum = parseFloat(calStr.replace(/[^0-9.]/g, '')) || 0;
      const mealType: MealTimeType = 
        row.MMEAL_SC_NM?.includes('조식') ? '조식' :
        row.MMEAL_SC_NM?.includes('석식') ? '석식' : '중식';

      return {
        id: `${row.SD_SCHUL_CODE}-${row.MLSV_YMD}-${row.MMEAL_SC_CODE || index}`,
        schoolCode: row.SD_SCHUL_CODE,
        schoolName: row.SCHUL_NM,
        date: row.MLSV_YMD,
        dateFormatted: formatYmdToKorean(row.MLSV_YMD),
        mealType,
        dishes,
        rawDishes: row.DDISH_NM || '',
        calories: calStr,
        caloriesNumber: calNum,
        nutrition: parseNutrition(row.NTR_INFO || ''),
        originInfo: parseOrigin(row.ORPLC_INFO || ''),
        headCount: row.MLSV_FGR ? Number(row.MLSV_FGR) : undefined,
      };
    });
  } catch (error) {
    console.warn('getMeals error:', error);
    return [];
  }
}

// Quick helper to get dates for a given week (Monday to Friday, or 7 days)
export function getWeekDates(baseDate: Date): { startYmd: string; endYmd: string; days: { date: Date; ymd: string; dayName: string; isToday: boolean }[] } {
  const current = new Date(baseDate);
  const day = current.getDay();
  // Calculate Monday (if day is Sunday 0, move back 6 days)
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));

  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const ymd = formatDateToYmd(d);
    const dayName = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
    const todayYmd = formatDateToYmd(new Date());
    days.push({
      date: d,
      ymd,
      dayName,
      isToday: ymd === todayYmd,
    });
  }

  return {
    startYmd: days[0].ymd,
    endYmd: days[days.length - 1].ymd,
    days,
  };
}

export function formatDateToYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// Generates delicious realistic sample meals for showcase or when school hasn't uploaded current semester data
export function getSampleMealsForWeek(school: SchoolInfo, baseDate: Date): ParsedMeal[] {
  const { days } = getWeekDates(baseDate);

  const sampleMenuBook = [
    {
      menu: '기장밥<br/>한우소고기미역국 (5.6.16)<br/>돈육간장불고기 (10.13)<br/>궁중떡볶이 (5.6.10.13.18)<br/>상추겉절이 (5.6.13)<br/>배추김치 (9)<br/>생딸기우유 (2)',
      calories: '785.4 Kcal',
      calNum: 785.4,
    },
    {
      menu: '흑미밥<br/>차돌된장찌개 (5.6.16)<br/>수제등심돈까스&소스 (1.2.5.6.10.12.13)<br/>감자마카로니샐러드 (1.5.6)<br/>배추김치 (9)<br/>샤인머스캣젤리 (13)',
      calories: '862.0 Kcal',
      calNum: 862.0,
    },
    {
      menu: '참치마요비빔밥 (1.5.6.13)<br/>맑은콩나물국 (5.9)<br/>치즈떡꼬치구이 (1.2.5.6.12.13)<br/>오이양파초무침 (13)<br/>깍두기 (9)<br/>달콤와플&생크림 (1.2.5.6)',
      calories: '840.5 Kcal',
      calNum: 840.5,
    },
    {
      menu: '발아현미밥<br/>얼큰육개장 (1.5.6.16)<br/>바삭치킨텐더&허니머스타드 (1.5.6.13.15)<br/>도토리묵야채무침 (5.6.13)<br/>총각김치 (9)<br/>제주감귤주스 (13)',
      calories: '798.2 Kcal',
      calNum: 798.2,
    },
    {
      menu: '스팸김치볶음밥 (1.2.5.6.9.10.15.16)<br/>미소된장국 (5.6)<br/>팽이버섯계란말이 (1.5)<br/>치즈어묵볶음 (1.5.6.13)<br/>깍두기 (9)<br/>초코마카롱 (1.2.6)',
      calories: '820.0 Kcal',
      calNum: 820.0,
    },
  ];

  return days.map((day, idx) => {
    const preset = sampleMenuBook[idx % sampleMenuBook.length];
    return {
      id: `sample-${school.SD_SCHUL_CODE}-${day.ymd}`,
      schoolCode: school.SD_SCHUL_CODE,
      schoolName: school.SCHUL_NM,
      date: day.ymd,
      dateFormatted: formatYmdToKorean(day.ymd),
      mealType: '중식',
      dishes: parseDishes(preset.menu),
      rawDishes: preset.menu,
      calories: preset.calories,
      caloriesNumber: preset.calNum,
      nutrition: [
        { label: '탄수화물(g)', value: '142.5', unit: 'g' },
        { label: '단백질(g)', value: '45.2', unit: 'g' },
        { label: '지방(g)', value: '24.1', unit: 'g' },
        { label: '칼슘(mg)', value: '230.0', unit: 'mg' },
        { label: '비타민C(mg)', value: '32.5', unit: 'mg' },
      ],
      originInfo: [
        '쌀 : 국내산',
        '쇠고기 : 국내산(한우)',
        '돼지고기 : 국내산',
        '닭고기 : 국내산',
        '배추김치 : 국내산',
      ],
      headCount: 850,
    };
  });
}
