/**
 * 文件对话框 IPC handler
 */

import { dialog, BrowserWindow } from 'electron'

/**
 * 打开 .lrmx 文件对话框 → 返回选中路径或 null
 */
export async function showOpenDialog(win: BrowserWindow): Promise<string | null> {
  const result = await dialog.showOpenDialog(win, {
    title: '打开档案',
    filters: [
      { name: '档案文件', extensions: ['lrmx'] },
      { name: 'XML 文件', extensions: ['xml'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  return result.filePaths[0]
}

/**
 * 另存为 .lrmx 对话框 → 返回选中路径或 null
 */
export async function showSaveDialog(win: BrowserWindow): Promise<string | null> {
  const result = await dialog.showSaveDialog(win, {
    title: '保存档案',
    defaultPath: '新建档案.lrmx',
    filters: [
      { name: '档案文件', extensions: ['lrmx'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  })
  if (result.canceled || !result.filePath) {
    return null
  }
  // 强制补齐 .lrmx 后缀
  let path = result.filePath
  if (!path.endsWith('.lrmx')) {
    path += '.lrmx'
  }
  return path
}

/**
 * 另存为 .docx 对话框 → 返回选中路径或 null
 */
export async function showSaveDocxDialog(win: BrowserWindow): Promise<string | null> {
  const result = await dialog.showSaveDialog(win, {
    title: '导出 DOCX',
    defaultPath: '新建档案.docx',
    filters: [
      { name: 'Word 文档', extensions: ['docx'] }
    ]
  })
  if (result.canceled || !result.filePath) {
    return null
  }
  let path = result.filePath
  if (!path.endsWith('.docx')) {
    path += '.docx'
  }
  return path
}
