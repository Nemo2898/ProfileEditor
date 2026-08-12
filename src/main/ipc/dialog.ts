/**
 * 文件对话框 IPC handler
 */

import { dialog, BrowserWindow } from 'electron'

/**
 * 打开 .lrmx 文件对话框（多选）→ 返回选中路径数组或 null
 */
export async function showOpenDialog(win: BrowserWindow): Promise<string[] | null> {
  const result = await dialog.showOpenDialog(win, {
    title: '打开档案',
    filters: [
      { name: '档案文件', extensions: ['lrmx'] },
      { name: 'XML 文件', extensions: ['xml'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    properties: ['openFile', 'multiSelections']
  })
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  return result.filePaths
}

/**
 * 另存为对话框（.lrmx / .docx）→ 返回选中路径或 null
 * @param win
 * @param defaultName 默认文件名（不含后缀），默认"新建档案"
 */
export async function showSaveDialog(
  win: BrowserWindow,
  defaultName?: string
): Promise<string | null> {
  const name = defaultName || '新建档案'
  const result = await dialog.showSaveDialog(win, {
    title: '另存为',
    defaultPath: `${name}.lrmx`,
    filters: [
      { name: '档案文件 (.lrmx)', extensions: ['lrmx'] },
      { name: 'Word 文档 (.docx)', extensions: ['docx'] }
    ]
  })
  if (result.canceled || !result.filePath) {
    return null
  }
  let path = result.filePath
  if (!path.endsWith('.lrmx') && !path.endsWith('.docx')) {
    path += '.lrmx'
  }
  return path
}
