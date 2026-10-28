import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { ALLERGEN_LIST } from '../types/neis';
import { getStoredUserAllergies, setStoredUserAllergies } from '../services/neisApi';

interface AllergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllergiesUpdated: () => void;
}

export const AllergyModal: React.FC<AllergyModalProps> = ({
  isOpen,
  onClose,
  onAllergiesUpdated,
}) => {
  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedAllergies(getStoredUserAllergies());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleAllergy = (code: number) => {
    setSelectedAllergies((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      return next;
    });
  };

  const handleSave = () => {
    setStoredUserAllergies(selectedAllergies);
    onAllergiesUpdated();
    onClose();
  };

  const handleReset = () => {
    setSelectedAllergies([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border-2 border-pink-200 flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-amber-300 via-rose-400 to-pink-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                알레르기 안심 설정
                {selectedAllergies.length > 0 && (
                  <span className="text-xs bg-rose-100 text-rose-600 font-semibold px-2 py-0.5 rounded-full">
                    {selectedAllergies.length}개 선택됨
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                주의해야 할 알레르기 식품을 선택하면 식단에 눈에 띄게 표시해드려요.
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

        {/* Notice */}
        <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            나이스 교육정보 개방포털에서 고시하는 <span className="font-bold">19종 법정 알레르기 유발물질 번호</span>를 기반으로 메뉴를 자동 분석합니다.
          </p>
        </div>

        {/* Allergen Grid */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALLERGEN_LIST.map((item) => {
              const isChecked = selectedAllergies.includes(item.code);
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => toggleAllergy(item.code)}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isChecked
                      ? 'bg-rose-50 border-rose-300 shadow-xs'
                      : 'bg-white hover:bg-pink-50/50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl select-none">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-slate-800">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        번호: {item.code}번
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      isChecked
                        ? 'bg-rose-500 border-rose-500 text-white shadow-xs'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            전체 해제
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl shadow-md transition-all active:scale-95"
            >
              설정 저장 완료 ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
