import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

/** 浏览器模式 Mock：Electron 外无 preload，提供占位 API 避免 undefined 报错 */
if (typeof window !== 'undefined' && !window.api) {
  const mockError = (name: string) => () => {
    window.alert(`浏览器模式下不支持“${name}”，请在 Electron 中运行。`)
    return null as never
  }
  window.api = {
    openLrmx: async (path: string) => {
      window.alert(`浏览器模式下不支持文件操作，请在 Electron 中运行。`)
      return {} as Record<string, unknown>
    },
    saveLrmx: async () => {
      window.alert(`浏览器模式下不支持文件操作，请在 Electron 中运行。`)
      return { success: false, error: '浏览器模式' }
    },
    newBlankDoc: async () => {
      return '' // 浏览器模式下返回空字符串，EditorLayout 会回退到本地 store
    },
    dialogOpen: async () => null,
    dialogSave: async () => null
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
