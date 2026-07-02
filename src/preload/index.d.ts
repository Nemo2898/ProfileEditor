export interface LrmxApi {
  openLrmx: (filePath: string) => Promise<Record<string, unknown>>
  saveLrmx: (data: Record<string, unknown>, filePath: string) => Promise<{ success: boolean; error?: string }>
  newBlankDoc: () => Promise<string>
  dialogOpen: () => Promise<string[] | null>
  dialogSave: (defaultName?: string) => Promise<string | null>
  dialogSaveDocx: () => Promise<string | null>
  exportDocx: (data: Record<string, unknown>, outputPath: string) => Promise<{ success: boolean; error?: string }>
  windowMinimize: () => Promise<void>
  windowMaximize: () => Promise<void>
  windowClose: () => Promise<void>
  onWindowStateChange: (callback: (maximized: boolean) => void) => () => void
}

declare global {
  interface Window {
    api: LrmxApi
  }
}
