import React from 'react';
import { School, Key, ShieldAlert, Sparkles, ChevronDown } from 'lucide-react';
import { SchoolInfo } from '../types/neis';

interface HeaderProps {
  currentSchool: SchoolInfo | null;
  hasCustomApiKey: boolean;
  userAllergiesCount: number;
  activeTab: 'tray' | 'weekly' | 'monthly';
  onTabChange: (tab: 'tray' | 'weekly' | 'monthly') => void;
  onOpenSchoolSearch: () => void;
  onOpenApiKeyModal: () => void;
  onOpenAllergyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSchool,
  hasCustomApiKey,
  userAllergiesCount,
  activeTab,
  onTabChange,
  onOpenSchoolSearch,
  onOpenApiKeyModal,
  onOpenAllergyModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFF5F8]/90 backdrop-blur-md border-b border-pink-200/80 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-400 via-pink-400 to-rose-300 flex items-center justify-center text-xl shadow-md border-2 border-white select-none">
              🍱
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black tracking-tight text-slate-800">
                  얌얌급식
                </h1>
                <span className="text-xs bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                  NEIS 연동 ✨
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                한눈에 보는 귀여운 학교 급식 알리미
              </p>
            </div>
          </div>

          {/* Mobile School Switcher shortcut */}
          <button
            onClick={onOpenSchoolSearch}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-pink-200 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs"
          >
            <School className="w-3.5 h-3.5 text-rose-500" />
            <span className="truncate max-w-[100px]">{currentSchool?.SCHUL_NM || '학교 선택'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Center: Tabs Switcher */}
        <div className="flex items-center bg-pink-100/80 p-1 rounded-2xl border border-pink-200/90 shadow-inner">
          <button
            onClick={() => onTabChange('tray')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'tray'
                ? 'bg-white text-rose-600 shadow-xs scale-102'
                : 'text-slate-600 hover:text-rose-500'
            }`}
          >
            <span>🍱</span>
            <span>오늘의 식판</span>
          </button>
          <button
            onClick={() => onTabChange('weekly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'weekly'
                ? 'bg-white text-rose-600 shadow-xs scale-102'
                : 'text-slate-600 hover:text-rose-500'
            }`}
          >
            <span>📅</span>
            <span>주간 식단표</span>
          </button>
          <button
            onClick={() => onTabChange('monthly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'monthly'
                ? 'bg-white text-rose-600 shadow-xs scale-102'
                : 'text-slate-600 hover:text-rose-500'
            }`}
          >
            <span>🗓️</span>
            <span>월간 달력</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Desktop School Switcher */}
          <button
            onClick={onOpenSchoolSearch}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-pink-50/70 border border-pink-200 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs hover:shadow-xs transition-all"
            title="다른 학교 검색하기"
          >
            <School className="w-4 h-4 text-rose-500" />
            <span className="truncate max-w-[140px]">{currentSchool?.SCHUL_NM || '학교 선택'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Allergy Safe Filter Button */}
          <button
            onClick={onOpenAllergyModal}
            className={`px-3 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              userAllergiesCount > 0
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-white hover:bg-pink-50 text-slate-600 border-pink-200'
            }`}
            title="알레르기 안심 설정"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${userAllergiesCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">알레르기</span>
            {userAllergiesCount > 0 && (
              <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                {userAllergiesCount}
              </span>
            )}
          </button>

          {/* NEIS API Key Button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`px-3 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              hasCustomApiKey
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-white hover:bg-rose-50 text-rose-600 border-pink-200'
            }`}
            title="나이스 오픈API 인증키 등록 및 관리"
          >
            <Key className={`w-3.5 h-3.5 ${hasCustomApiKey ? 'text-emerald-600' : 'text-rose-500'}`} />
            <span className="hidden sm:inline">나이스 API키</span>
            <span
              className={`w-2 h-2 rounded-full ${
                hasCustomApiKey ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
              }`}
              title={hasCustomApiKey ? '개인 인증키 적용 중' : '기본 공용 트래픽 사용 중'}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
