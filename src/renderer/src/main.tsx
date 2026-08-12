import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { flashError } from './utils/flash'

/** 浏览器模式 Mock：Electron 外无 preload，提供占位 API 避免 undefined 报错 */
if (typeof window !== 'undefined' && !window.api) {
  window.api = {
    openLrmx: async () => {
      flashError(`浏览器模式下不支持文件操作，请在 Electron 中运行。`)
      return {} as Record<string, unknown>
    },
    saveLrmx: async () => {
      flashError(`浏览器模式下不支持文件操作，请在 Electron 中运行。`)
      return { success: false, error: '浏览器模式' }
    },
    exportDocx: async () => {
      flashError(`浏览器模式下不支持文件操作，请在 Electron 中运行。`)
      return { success: false, error: '浏览器模式' }
    },
    newBlankDoc: async () => {
      return '' // 浏览器模式下返回空字符串，EditorLayout 会回退到本地 store
    },
    dialogOpen: async () => null,
    dialogSave: async () => null,
    windowMinimize: async () => undefined,
    windowMaximize: async () => undefined,
    windowClose: async () => {
      window.close()
    },
    onWindowStateChange: () => () => {},
    setDirtyCount: async () => undefined,
    onBeforeClose: () => () => {}
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
