import { contextBridge, ipcRenderer } from 'electron'

const api = {
  /** 打开 .lrmx 档案 → 返回 Person 数据 */
  openLrmx: (filePath: string): Promise<Record<string, unknown>> =>
    ipcRenderer.invoke('open-lrmx', filePath),

  /** 保存数据 → .lrmx */
  saveLrmx: (
    data: Record<string, unknown>,
    filePath: string
  ): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('save-lrmx', data, filePath),

  /** 新建空白临时档案 → 返回临时路径 */
  newBlankDoc: (): Promise<string> => ipcRenderer.invoke('new-blank-doc'),

  /** 打开文件对话框（多选）→ 返回选中路径数组或 null */
  dialogOpen: (): Promise<string[] | null> => ipcRenderer.invoke('dialog-open'),

  /** 另存为对话框 → 返回路径或 null，可选默认文件名（不含后缀） */
  dialogSave: (defaultName?: string): Promise<string | null> =>
    ipcRenderer.invoke('dialog-save', defaultName),

  /** 窗口最小化 */
  windowMinimize: (): Promise<void> => ipcRenderer.invoke('window-minimize'),

  /** 窗口最大化/还原 */
  windowMaximize: (): Promise<void> => ipcRenderer.invoke('window-maximize'),

  /** 关闭窗口 */
  windowClose: (): Promise<void> => ipcRenderer.invoke('window-close'),

  /** 导出 DOCX：传入档案数据 + 输出路径 → 写 .docx */
  exportDocx: (
    data: Record<string, unknown>,
    outputPath: string
  ): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('export-docx', data, outputPath),

  /** 监听窗口状态变化 */
  onWindowStateChange: (callback: (maximized: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, maximized: boolean): void =>
      callback(maximized)
    ipcRenderer.on('window-state-changed', handler)
    return (): void => {
      ipcRenderer.removeListener('window-state-changed', handler)
    }
  },

  /** 上报未保存文档数（窗口关闭保护） */
  setDirtyCount: (count: number): Promise<void> => ipcRenderer.invoke('set-dirty-count', count),

  /** 监听"窗口即将关闭但有未保存修改"→ 返回取消订阅函数 */
  onBeforeClose: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on('before-close', handler)
    return (): void => {
      ipcRenderer.removeListener('before-close', handler)
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // 非 contextIsolated 场景（开发调试）直接挂到 window
  // @ts-ignore window 在未隔离时存在
  window.api = api
}
