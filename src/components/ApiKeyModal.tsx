import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertCircle, ExternalLink, Trash2, Eye, EyeOff, Sparkles, X, ShieldCheck } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, testNeisApiKey } from '../services/neisApi';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [currentSavedKey, setCurrentSavedKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      setApiKeyInput(stored);
      setCurrentSavedKey(stored);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKeyInput.trim());
    setCurrentSavedKey(apiKeyInput.trim());
    setTestResult({
      success: true,
      message: apiKeyInput.trim() ? 'API 키가 성공적으로 저장되었습니다! 💖' : 'API 키가 해제되었습니다. 기본 공용 조회로 전환됩니다.',
    });
    onKeyUpdated();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleTest = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, message: '테스트할 API 키를 먼저 입력해주세요.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testNeisApiKey(apiKeyInput.trim());
    setTesting(false);
    setTestResult(res);
  };

  const handleClear = () => {
    setApiKeyInput('');
    setStoredApiKey('');
    setCurrentSavedKey('');
    setTestResult({ success: true, message: 'API 키가 삭제되었습니다.' });
    onKeyUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border-2 border-pink-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cute Top Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-pink-300 via-rose-400 to-pink-300" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 shadow-inner">
              <Key className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                나이스(NEIS) API 키 설정
                <span className="text-xs bg-pink-100 text-rose-600 font-semibold px-2 py-0.5 rounded-full">
                  {currentSavedKey ? '등록됨 ✨' : '미등록 (기본모드)'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                교육부 나이스 오픈 API 인증키를 등록하여 제한 없이 급식을 불러옵니다.
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

        {/* Status Callout */}
        <div className="mt-4 p-3.5 bg-gradient-to-r from-pink-50 to-rose-50/70 border border-pink-200/80 rounded-2xl">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-rose-600">안내: </span>
              인증키가 없어도 나이스 공용 샘플 트래픽으로 기본 조회가 가능해요! 개인 인증키를 등록하면 트래픽 일일 한도(10만 건)가 부여되어 언제나 지연 없이 식단을 가져옵니다.
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="mt-5 space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            나이스 오픈API 인증키 (32자리)
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="예: 32a4b89c719e4a8b8c2d..."
              className="w-full pl-4 pr-20 py-2.5 bg-slate-50 border border-pink-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all font-mono"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                title={showKey ? '숨기기' : '보기'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {apiKeyInput && (
                <button
                  type="button"
                  onClick={() => setApiKeyInput('')}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  title="지우기"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Verification feedback */}
          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-pink-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={testing || !apiKeyInput.trim()}
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {testing ? '검증 중...' : '연결 테스트'}
            </button>
            {currentSavedKey && (
              <button
                onClick={handleClear}
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1"
                title="저장된 키 초기화"
              >
                <Trash2 className="w-3.5 h-3.5" />
                초기화
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              닫기
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              저장하기 ✨
            </button>
          </div>
        </div>

        {/* How to get a key guide */}
        <div className="mt-5 pt-4 border-t border-dashed border-pink-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">💡 나이스 인증키가 없으신가요? (무료 발급)</span>
            <a
              href="https://open.neis.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-600 hover:underline font-medium"
            >
              나이스 포털 바로가기
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <ol className="mt-2 text-[11px] text-slate-500 space-y-1 pl-4 list-decimal">
            <li>
              <span className="font-medium text-slate-600">나이스 교육정보 개방 포털</span>(open.neis.go.kr) 회원가입
            </li>
            <li>상단 메뉴의 [인증키 신청] 클릭 후 간단한 용도(예: 개인 급식 확인용) 기재</li>
            <li>발급 즉시 승인되는 인증키를 복사하여 위 칸에 붙여넣기 완료!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
