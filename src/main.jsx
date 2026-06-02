import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppWrapper } from './PageMeta'
import { ensureBossPwaEntry } from './utils/ensureBossPwaEntry.js'
import { registerBossServiceWorker } from './Boss/utils/bossPwaInstall.js'
import { applyStoredQrTheme } from './QR/hooks/useQrTheme.js'
import { hydrateBossAuth } from './utils/bossAuthStorage.js'

ensureBossPwaEntry()

if (typeof window !== 'undefined' && window.location.pathname.startsWith('/q/')) {
  applyStoredQrTheme()
}

if (typeof window !== 'undefined' && window.location.pathname.startsWith('/boss')) {
  void registerBossServiceWorker()
}

async function startApp() {
  await hydrateBossAuth()

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AppWrapper>
        <App />
      </AppWrapper>
    </StrictMode>,
  )
}

void startApp()