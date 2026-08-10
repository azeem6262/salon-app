'use client'

import { useState, useEffect } from 'react'
import { X, Download, Share } from 'lucide-react'

export default function InstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already in standalone (PWA) mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone || 
                         document.referrer.includes('android-app://')

    if (isStandalone) {
      return // Don't show if already installed
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show prompt after 3 seconds
    const timer = setTimeout(() => {
      setShowPrompt(true)
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timer)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-md mx-auto">
      <div className="bg-[#1c1c1e] text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight">Get the Salonly app</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Add to your home screen for the best experience</span>
            </div>
          </div>
          <button 
            onClick={() => setShowPrompt(false)}
            className="text-slate-400 hover:text-white p-1 rounded-full transition-colors bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-sm text-slate-300 leading-relaxed mt-1 shadow-inner">
          {isInstallable ? (
            <div className="flex items-center justify-between">
              <span className="text-xs">Install Salonly directly to your device.</span>
              <button 
                onClick={handleInstallClick}
                className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition-colors shadow-sm touch-scale"
              >
                Install <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : isIOS ? (
            <span className="text-xs">Tap the <Share className="w-4 h-4 inline-block mx-1 text-blue-400" /> Share icon at the bottom of Safari and select <strong>Add to Home Screen</strong>.</span>
          ) : (
            <span className="text-xs">Open this site in Chrome or Edge and click the install icon <Download className="w-3.5 h-3.5 inline-block text-fuchsia-400 mx-0.5" /> in the address bar to add Salonly as an app.</span>
          )}
        </div>
      </div>
    </div>
  )
}
