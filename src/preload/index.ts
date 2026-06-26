import { contextBridge, ipcRenderer } from 'electron'

const api = {
  /** 打开 .lrmx 档案 → 返回 Person 数据 */
  openLrmx: (filePath: string): Promise<Record<string, unknown>> =>
    ipcRenderer.invoke('open-lrmx', filePath),

  /** 保存数据 → .lrmx */
  saveLrmx: (data: Record<string, unknown>, filePath: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('save-lrmx', data, filePath),

  /** 打开文件对话框 → 返回选中路径或 null */
  dialogOpen: (): Promise<string | null> => ipcRenderer.invoke('dialog-open'),

  /** 另存为对话框 → 返回路径或 null */
  dialogSave: (): Promise<string | null> => ipcRenderer.invoke('dialog-save')
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
