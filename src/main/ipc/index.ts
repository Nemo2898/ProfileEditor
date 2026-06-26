/**
 * 注册所有 IPC handler
 */

import { ipcMain, BrowserWindow, app } from 'electron'
import { openLrmx, saveLrmx, getRuntimeDir, newBlankDoc, clearRuntimeDocs } from './xml'
import { showOpenDialog, showSaveDialog } from './dialog'

/** runtime_docs 目录缓存 */
let runtimeDir = ''

export function getCachedRuntimeDir(): string {
  return runtimeDir
}

export function registerIpcHandlers(win: BrowserWindow): void {
  // 初始化 runtime_docs
  runtimeDir = getRuntimeDir(app)
  clearRuntimeDocs(runtimeDir)

  // 新建空白档案 → 返回临时路径
  ipcMain.handle('new-blank-doc', () => {
    return newBlankDoc(runtimeDir)
  })

  // 打开 .lrmx
  ipcMain.handle('open-lrmx', async (_event, filePath: string) => {
    return openLrmx(filePath)
  })

  // 保存 .lrmx
  ipcMain.handle('save-lrmx', async (_event, data: Record<string, unknown>, filePath: string) => {
    try {
      saveLrmx(data, filePath)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // 打开文件对话框
  ipcMain.handle('dialog-open', async () => {
    return showOpenDialog(win)
  })

  // 另存为对话框
  ipcMain.handle('dialog-save', async () => {
    return showSaveDialog(win)
  })
}

/** App 退出时清空临时文件 */
export function onQuit(): void {
  if (runtimeDir) {
    clearRuntimeDocs(runtimeDir)
  }
}
