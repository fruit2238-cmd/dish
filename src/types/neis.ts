export interface SchoolInfo {
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드 (e.g. B10)
  ATPT_OFCDC_SC_NM: string;   // 교육청명 (e.g. 서울특별시교육청)
  SD_SCHUL_CODE: string;      // 행정표준코드 (학교코드 e.g. 7010083)
  SCHUL_NM: string;           // 학교명 (e.g. 서울고등학교)
  ENG_SCHUL_NM?: string;      // 영문학교명
  SCHUL_KND_SC_NM: string;    // 학교종류 (초등학교/중학교/고등학교/특수학교)
  LCTN_SC_NM?: string;        // 소재지 (e.g. 서울특별시)
  ORG_RDNMA: string;          // 도로명주소
  ORG_TELNO?: string;         // 전화번호
  HMPG_ADRES?: string;        // 홈페이지주소
  FOND_SC_NM?: string;        // 설립구분 (공립/사립)
}

export type MealTimeType = '조식' | '중식' | '석식';

export interface DishItem {
  id: string;
  name: string;
  allergens: number[];
  category: 'rice' | 'soup' | 'main' | 'side' | 'kimchi' | 'dessert';
  icon: string;
}

export interface NutritionItem {
  label: string;
  value: string;
  unit: string;
}

export interface ParsedMeal {
  id: string;
  schoolCode: string;
  schoolName: string;
  date: string;          // YYYYMMDD
  dateFormatted: string; // YYYY.MM.DD (요일)
  mealType: MealTimeType;
  dishes: DishItem[];
  rawDishes: string;
  calories: string;      // e.g. 1024.5 Kcal
  caloriesNumber: number;
  nutrition: NutritionItem[];
  originInfo: string[];
  headCount?: number;
}

export interface AllergenMeta {
  code: number;
  name: string;
  icon: string;
  shortName: string;
}

export const ALLERGEN_LIST: AllergenMeta[] = [
  { code: 1, name: '난류 (달걀/가금류)', shortName: '난류', icon: '🥚' },
  { code: 2, name: '우유', shortName: '우유', icon: '🥛' },
  { code: 3, name: '메밀', shortName: '메밀', icon: '🌾' },
  { code: 4, name: '땅콩', shortName: '땅콩', icon: '🥜' },
  { code: 5, name: '대두 (콩)', shortName: '대두', icon: '🫘' },
  { code: 6, name: '밀 (밀가루)', shortName: '밀', icon: '🍞' },
  { code: 7, name: '고등어', shortName: '고등어', icon: '🐟' },
  { code: 8, name: '게', shortName: '게', icon: '🦀' },
  { code: 9, name: '새우', shortName: '새우', icon: '🦐' },
  { code: 10, name: '돼지고기', shortName: '돼지고기', icon: '🥓' },
  { code: 11, name: '복숭아', shortName: '복숭아', icon: '🍑' },
  { code: 12, name: '토마토', shortName: '토마토', icon: '🍅' },
  { code: 13, name: '아황산류 (보존료)', shortName: '아황산염', icon: '🧪' },
  { code: 14, name: '호두', shortName: '호두', icon: '🌰' },
  { code: 15, name: '닭고기', shortName: '닭고기', icon: '🍗' },
  { code: 16, name: '쇠고기', shortName: '쇠고기', icon: '🥩' },
  { code: 17, name: '오징어', shortName: '오징어', icon: '🦑' },
  { code: 18, name: '조개류 (굴,전복,홍합 등)', shortName: '조개류', icon: '🦪' },
  { code: 19, name: '잣', shortName: '잣', icon: '🌲' },
];

export const POPULAR_PRESET_SCHOOLS: SchoolInfo[] = [
  {
    ATPT_OFCDC_SC_CODE: 'B10',
    ATPT_OFCDC_SC_NM: '서울특별시교육청',
    SD_SCHUL_CODE: '7010083',
    SCHUL_NM: '서울고등학교',
    SCHUL_KND_SC_NM: '고등학교',
    ORG_RDNMA: '서울특별시 서초구 효령로 197',
  },
  {
    ATPT_OFCDC_SC_CODE: 'B10',
    ATPT_OFCDC_SC_NM: '서울특별시교육청',
    SD_SCHUL_CODE: '7010057',
    SCHUL_NM: '경기고등학교',
    SCHUL_KND_SC_NM: '고등학교',
    ORG_RDNMA: '서울특별시 강남구 영동대로 643',
  },
  {
    ATPT_OFCDC_SC_CODE: 'J10',
    ATPT_OFCDC_SC_NM: '경기도교육청',
    SD_SCHUL_CODE: '7530528',
    SCHUL_NM: '분당고등학교',
    SCHUL_KND_SC_NM: '고등학교',
    ORG_RDNMA: '경기도 성남시 분당구 중앙공원로 76',
  },
  {
    ATPT_OFCDC_SC_CODE: 'B10',
    ATPT_OFCDC_SC_NM: '서울특별시교육청',
    SD_SCHUL_CODE: '7041175',
    SCHUL_NM: '서울대치초등학교',
    SCHUL_KND_SC_NM: '초등학교',
    ORG_RDNMA: '서울특별시 강남구 개포로 109길 34',
  },
  {
    ATPT_OFCDC_SC_CODE: 'C10',
    ATPT_OFCDC_SC_NM: '부산광역시교육청',
    SD_SCHUL_CODE: '7150143',
    SCHUL_NM: '해운대고등학교',
    SCHUL_KND_SC_NM: '고등학교',
    ORG_RDNMA: '부산광역시 해운대구 우동3로 91',
  },
  {
    ATPT_OFCDC_SC_CODE: 'P10',
    ATPT_OFCDC_SC_NM: '전북특별자치도교육청',
    SD_SCHUL_CODE: '8320087',
    SCHUL_NM: '전주제일고등학교',
    SCHUL_KND_SC_NM: '고등학교',
    ORG_RDNMA: '전북특별자치도 전주시 덕진구 태진로 109',
  }
];
