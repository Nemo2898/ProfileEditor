export interface LrmxApi {
  openLrmx: (filePath: string) => Promise<Record<string, unknown>>
  saveLrmx: (data: Record<string, unknown>, filePath: string) => Promise<{ success: boolean; error?: string }>
  newBlankDoc: () => Promise<string>
  dialogOpen: () => Promise<string | null>
  dialogSave: () => Promise<string | null>
}

declare global {
  interface Window {
    api: LrmxApi
  }
}
