import React, { useState, useEffect } from 'react';
import { Search, MapPin, School, Star, Sparkles, X, Check, Loader2, Phone } from 'lucide-react';
import { SchoolInfo, POPULAR_PRESET_SCHOOLS } from '../types/neis';
import { searchSchools, getFavoriteSchools, saveFavoriteSchool, removeFavoriteSchool } from '../services/neisApi';

interface SchoolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSchool: (school: SchoolInfo) => void;
  currentSchool: SchoolInfo | null;
}

export const SchoolSearchModal: React.FC<SchoolSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSchool,
  currentSchool,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SchoolInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<SchoolInfo[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all'); // all, 초등학교, 중학교, 고등학교

  useEffect(() => {
    if (isOpen) {
      setFavorites(getFavoriteSchools());
      if (results.length === 0 && !query) {
        setResults(POPULAR_PRESET_SCHOOLS);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults(POPULAR_PRESET_SCHOOLS);
      return;
    }
    setLoading(true);
    try {
      const data = await searchSchools(searchTerm.trim());
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const toggleFavorite = (school: SchoolInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = favorites.some((f) => f.SD_SCHUL_CODE === school.SD_SCHUL_CODE);
    if (isFav) {
      removeFavoriteSchool(school.SD_SCHUL_CODE);
      setFavorites((prev) => prev.filter((f) => f.SD_SCHUL_CODE !== school.SD_SCHUL_CODE));
    } else {
      saveFavoriteSchool(school);
      setFavorites((prev) => [school, ...prev]);
    }
  };

  const filteredResults = results.filter((school) => {
    if (selectedType === 'all') return true;
    return school.SCHUL_KND_SC_NM === selectedType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[88vh] bg-white rounded-3xl p-6 shadow-2xl border-2 border-pink-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-pink-300 via-rose-400 to-pink-300" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-rose-500 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">학교 검색</h2>
              <p className="text-xs text-slate-500">전국 12,000여 개 초·중·고등학교 급식을 검색하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-pink-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="학교명을 입력하세요 (예: 서울고, 대치초, 판교중)"
              className="w-full pl-10 pr-10 py-2.5 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults(POPULAR_PRESET_SCHOOLS);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch(query)}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold rounded-2xl shadow-sm transition-all shrink-0 flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            검색
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 pt-1 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">구분:</span>
          {[
            { id: 'all', label: '전체' },
            { id: '초등학교', label: '초등학교' },
            { id: '중학교', label: '중학교' },
            { id: '고등학교', label: '고등학교' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1 rounded-xl font-medium transition-colors shrink-0 ${
                selectedType === type.id
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-pink-50 text-slate-600 hover:bg-pink-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Favorites bar if available */}
        {favorites.length > 0 && (
          <div className="mt-3 p-2.5 bg-pink-50/70 border border-pink-100 rounded-2xl">
            <div className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mb-1.5">
              <Star className="w-3.5 h-3.5 fill-rose-500" />
              <span>즐겨찾는 학교</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {favorites.map((fav) => (
                <button
                  key={fav.SD_SCHUL_CODE}
                  onClick={() => {
                    onSelectSchool(fav);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-pink-200 text-xs font-medium text-slate-700 rounded-xl transition-colors flex items-center gap-1 group"
                >
                  <span>{fav.SCHUL_NM}</span>
                  <Check
                    className={`w-3 h-3 ${
                      currentSchool?.SD_SCHUL_CODE === fav.SD_SCHUL_CODE
                        ? 'text-rose-500'
                        : 'opacity-0 group-hover:opacity-100 text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="mt-3 flex-1 overflow-y-auto divide-y divide-pink-100/80 pr-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
              <p className="text-xs">전국 학교 정보를 조회하고 있어요...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium">검색 결과가 없습니다 😢</p>
              <p className="text-xs text-slate-400 mt-1">정확한 학교 이름으로 다시 검색해보세요.</p>
            </div>
          ) : (
            filteredResults.map((school) => {
              const isSelected = currentSchool?.SD_SCHUL_CODE === school.SD_SCHUL_CODE;
              const isFav = favorites.some((f) => f.SD_SCHUL_CODE === school.SD_SCHUL_CODE);

              return (
                <div
                  key={school.SD_SCHUL_CODE}
                  onClick={() => {
                    onSelectSchool(school);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all my-1 ${
                    isSelected
                      ? 'bg-rose-50/90 border border-rose-200 shadow-xs'
                      : 'hover:bg-pink-50/60 border border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 truncate">
                        {school.SCHUL_NM}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                          school.SCHUL_KND_SC_NM === '초등학교'
                            ? 'bg-amber-100 text-amber-700'
                            : school.SCHUL_KND_SC_NM === '중학교'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-pink-100 text-rose-700'
                        }`}
                      >
                        {school.SCHUL_KND_SC_NM}
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        · {school.ATPT_OFCDC_SC_NM}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 truncate">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-pink-400 shrink-0" />
                        <span className="truncate">{school.ORG_RDNMA}</span>
                      </div>
                      {school.ORG_TELNO && (
                        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{school.ORG_TELNO}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => toggleFavorite(school, e)}
                      className={`p-2 rounded-xl transition-colors ${
                        isFav ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-amber-400'
                      }`}
                      title={isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                    {isSelected && (
                      <span className="text-xs font-semibold text-rose-500 bg-white px-2.5 py-1 rounded-xl border border-rose-200 shadow-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        선택됨
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer recommendation tags */}
        <div className="mt-3 pt-3 border-t border-pink-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>자주 찾는 학교:</span>
            {POPULAR_PRESET_SCHOOLS.slice(0, 3).map((ps) => (
              <button
                key={ps.SD_SCHUL_CODE}
                onClick={() => {
                  onSelectSchool(ps);
                  onClose();
                }}
                className="text-rose-500 hover:underline px-1"
              >
                {ps.SCHUL_NM}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
