/**
 * 注册所有 IPC handler
 */

import { ipcMain, BrowserWindow } from 'electron'
import { openLrmx, saveLrmx } from './xml'
import { showOpenDialog, showSaveDialog } from './dialog'

export function registerIpcHandlers(win: BrowserWindow): void {
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

  // 获取模板路径（新建时用 blank.xml）
  ipcMain.handle('get-blank-path', () => {
    return null // 留给 main 进程拼接，或直接返回内容
  })
}
