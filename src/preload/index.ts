import { contextBridge, ipcRenderer } from 'electron'

const api = {
  /** 打开 .lrmx 档案 → 返回 Person 数据 */
  openLrmx: (filePath: string): Promise<Record<string, unknown>> =>
    ipcRenderer.invoke('open-lrmx', filePath),

  /** 保存数据 → .lrmx */
  saveLrmx: (data: Record<string, unknown>, filePath: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('save-lrmx', data, filePath),

  /** 新建空白临时档案 → 返回临时路径 */
  newBlankDoc: (): Promise<string> =>
    ipcRenderer.invoke('new-blank-doc'),

  /** 打开文件对话框 → 返回选中路径或 null */
  dialogOpen: (): Promise<string | null> => ipcRenderer.invoke('dialog-open'),

  /** 另存为对话框 → 返回路径或 null */
  dialogSave: (): Promise<string | null> => ipcRenderer.invoke('dialog-save'),

  /** 导出 DOCX 对话框 → 返回路径或 null */
  dialogSaveDocx: (): Promise<string | null> => ipcRenderer.invoke('dialog-save-docx'),

  /** 窗口最小化 */
  windowMinimize: (): Promise<void> => ipcRenderer.invoke('window-minimize'),

  /** 窗口最大化/还原 */
  windowMaximize: (): Promise<void> => ipcRenderer.invoke('window-maximize'),

  /** 关闭窗口 */
  windowClose: (): Promise<void> => ipcRenderer.invoke('window-close'),

  /** 导出 DOCX：传入档案数据 + 输出路径 → 写 .docx */
  exportDocx: (data: Record<string, unknown>, outputPath: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('export-docx', data, outputPath),

  /** 监听窗口状态变化 */
  onWindowStateChange: (callback: (maximized: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, maximized: boolean) => callback(maximized)
    ipcRenderer.on('window-state-changed', handler)
    return () => { ipcRenderer.removeListener('window-state-changed', handler) }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.api = api
}
