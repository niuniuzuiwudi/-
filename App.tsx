import React, { useState, useEffect } from 'react';
import { ScanButton } from './components/ScanButton';
import { ResultView } from './components/ResultView';
import { analyzeFoodLabel } from './services/geminiService';
import { AppState, NutritionData } from './types';
import { Loader2, Leaf, Download, X, Share, PlusSquare } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [data, setData] = useState<NutritionData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Capture the PWA install prompt event (mostly for Android)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android / Desktop Chrome way
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // iOS or prompt already handled or not supported
      setShowInstallModal(true);
    }
  };

  const handleImageSelected = async (base64Image: string) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);
    try {
      const result = await analyzeFoodLabel(base64Image);
      setData(result);
      setAppState(AppState.RESULT);
    } catch (e) {
      setAppState(AppState.ERROR);
      setErrorMsg("发生了一些错误，请检查网络连接并重试。");
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setData(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-800 font-sans selection:bg-emerald-100">
      
      {/* View: IDLE (Home) */}
      {appState === AppState.IDLE && (
        <div className="flex flex-col h-screen max-w-md mx-auto relative animate-fadeIn">
          <header className="flex items-center justify-center p-8 pt-12">
            <div className="flex items-center gap-2 text-emerald-600">
              <Leaf size={28} strokeWidth={2.5} />
              <span className="text-2xl font-bold tracking-tight text-stone-800">知食</span>
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center px-8 pb-20 text-center">
            <div className="mb-12 space-y-4">
              <h1 className="text-4xl font-extrabold text-stone-900 leading-tight">
                读懂你的食物
              </h1>
              <p className="text-stone-500 text-lg leading-relaxed max-w-xs mx-auto">
                一键扫描食品标签，快速获取热量、成分与健康建议。
              </p>
            </div>

            <ScanButton onImageSelected={handleImageSelected} />
          </main>
          
          <footer className="p-6 pb-8 flex flex-col items-center gap-4">
             {/* Install Button */}
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium hover:bg-emerald-200 transition-colors"
            >
              <Download size={16} />
              下载 / 安装 App
            </button>
            <span className="text-xs text-stone-400">
              由 Gemini AI 驱动
            </span>
          </footer>
        </div>
      )}

      {/* View: ANALYZING (Loading) */}
      {appState === AppState.ANALYZING && (
        <div className="flex flex-col h-screen items-center justify-center bg-white/80 backdrop-blur-sm z-50">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Loader2 size={64} className="text-emerald-600 animate-spin relative z-10" />
          </div>
          <h2 className="mt-8 text-xl font-semibold text-stone-800 animate-pulse">正在分析...</h2>
          <p className="mt-2 text-stone-500 text-sm">识别成分与营养信息中</p>
        </div>
      )}

      {/* View: RESULT */}
      {appState === AppState.RESULT && data && (
        <ResultView data={data} onScanAgain={handleReset} />
      )}

      {/* View: ERROR */}
      {appState === AppState.ERROR && (
        <div className="flex flex-col h-screen items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
             <span className="text-3xl">😕</span>
          </div>
          <h3 className="text-xl font-bold text-stone-900 mb-2">抱歉</h3>
          <p className="text-stone-600 mb-8">{errorMsg}</p>
          <button
            onClick={handleReset}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-semibold shadow-md active:scale-95 transition-transform"
          >
            重试
          </button>
        </div>
      )}

      {/* Install Instruction Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-stone-800 mb-4">安装“知食”</h3>
            
            {isIOS ? (
              <div className="space-y-4 text-stone-600">
                <p>在 iOS (iPhone) 上安装：</p>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                    <span className="bg-stone-100 p-2 rounded-lg"><Share size={20} /></span>
                    <span>1. 点击浏览器底部的<strong>“分享”</strong>按钮</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-stone-100 p-2 rounded-lg"><PlusSquare size={20} /></span>
                    <span>2. 向下滑动，选择<strong>“添加到主屏幕”</strong></span>
                  </li>
                </ol>
              </div>
            ) : (
               <div className="space-y-4 text-stone-600">
                <p>在 Android 上安装：</p>
                <ol className="space-y-3 text-sm">
                   <li className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold mt-0.5">1.</span>
                    <span>点击浏览器右上角的菜单图标 (⋮)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold mt-0.5">2.</span>
                    <span>选择<strong>“安装应用”</strong>或<strong>“添加到主屏幕”</strong></span>
                  </li>
                </ol>
                <p className="text-xs text-stone-400 mt-2 bg-stone-50 p-2 rounded">
                  注：如果您使用的是微信，请点击右上角三个点，选择“在浏览器打开”后再试。
                </p>
              </div>
            )}
            
            <button
               onClick={() => setShowInstallModal(false)}
               className="w-full mt-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold"
            >
              知道了
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;