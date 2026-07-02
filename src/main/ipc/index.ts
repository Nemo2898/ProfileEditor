/**
 * 注册所有 IPC handler
 */

import { ipcMain, BrowserWindow, app } from 'electron'
import { join } from 'path'
import { openLrmx, saveLrmx, getRuntimeDir, newBlankDoc, clearRuntimeDocs } from './xml'
import { showOpenDialog, showSaveDialog, showSaveDocxDialog, showSavePdfDialog } from './dialog'
import { prepareDocxData, renderDocx, exportDocxToPdf } from './docx'
import type { ArchivePerson } from '../../renderer/src/types/archive'

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
  ipcMain.handle('dialog-save', async (_event, defaultName?: string) => {
    return showSaveDialog(win, defaultName)
  })

  // 导出 DOCX 对话框
  ipcMain.handle('dialog-save-docx', async () => {
    return showSaveDocxDialog(win)
  })

  // 导出 PDF 对话框
  ipcMain.handle('dialog-save-pdf', async () => {
    return showSavePdfDialog(win)
  })

  // 导出 DOCX
  ipcMain.handle('export-docx', async (_event, data: Record<string, unknown>, outputPath: string) => {
    try {
      const person = data as unknown as ArchivePerson
      const renderData = prepareDocxData(person)

      const templatePath = join(__dirname, '../../templates/output.docx')
      renderDocx(renderData, templatePath, outputPath)

      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // 导出 PDF
  ipcMain.handle('export-pdf', async (_event, data: Record<string, unknown>, outputPath: string) => {
    try {
      const person = data as unknown as ArchivePerson
      const templatePath = join(__dirname, '../../templates/output.docx')
      await exportDocxToPdf(person, templatePath, outputPath)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // 窗口控制
  ipcMain.handle('window-minimize', () => {
    win.minimize()
  })
  ipcMain.handle('window-maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  })
  ipcMain.handle('window-close', () => {
    win.close()
  })
  ipcMain.handle('window-is-maximized', () => {
    return win.isMaximized()
  })
}

/** App 退出时清空临时文件 */
export function onQuit(): void {
  if (runtimeDir) {
    clearRuntimeDocs(runtimeDir)
  }
}
