/**
 * EditorLayout — 主布局容器（左右分栏）
 */

import { useCallback } from 'react'
import TitleBar from './TitleBar'
import TabBar from './TabBar'
import PageViewer from './PageViewer'
import ToolPanel from './ToolPanel'
import Page1 from '../Page1'
import Page2 from '../Page2'
import { useArchiveStore } from '../../store/archive'
import type { ArchivePerson } from '../../types/archive'
import { validateBirthDate } from '../../utils/validators'
import { restoreLastFocused } from '../FormFields'

/** 保存前校验出生日期格式 */
function validateSaveBirthDates(data: ArchivePerson): string | null {
  const err = validateBirthDate(data.ChuShengNianYue)
  if (err) return `本人出生年月：${err}`
  for (let i = 0; i < (data.JiaTingChengYuan?.Item?.length ?? 0); i++) {
    const m = data.JiaTingChengYuan.Item[i]
    if (!m.ChengWei.trim() && !m.XingMing.trim() && !m.ChuShengRiQi.trim()) continue
    const ferr = validateBirthDate(m.ChuShengRiQi)
    if (ferr) return `家庭成员 ${i + 1}：${ferr}`
  }
  return null
}

/** 弹窗后归还焦点到最后编辑的输入框 */
function alertRestoreFocus(msg: string): void {
  window.alert(msg)
  restoreLastFocused()
}

export default function EditorLayout(): React.JSX.Element {
  const docs = useArchiveStore((s) => s.docs)
  const activeId = useArchiveStore((s) => s.activeId)
  const currentPage = useArchiveStore((s) => s.currentPage)
  const setCurrentPage = useArchiveStore((s) => s.setCurrentPage)
  const openDoc = useArchiveStore((s) => s.openDoc)
  const newDoc = useArchiveStore((s) => s.newDoc)
  const switchTab = useArchiveStore((s) => s.switchTab)
  const closeTab = useArchiveStore((s) => s.closeTab)

  // TabBar 需要的 tab 列表
  const tabs = Object.values(docs).map((d) => ({
    id: d.id,
    label: d.label,
    isDirty: d.isDirty
  }))

  // 新建
  const handleNew = useCallback(async () => {
    try {
      const tempPath = await window.api.newBlankDoc!()
      if (tempPath) newDoc(tempPath)
    } catch {
      // 浏览器模式：手动给空白 tab
      newDoc('')
    }
  }, [newDoc])

  // 打开
  const handleOpen = useCallback(async () => {
    try {
      const path = await window.api.dialogOpen()
      if (!path) return
      const person = (await window.api.openLrmx(path)) as unknown as ArchivePerson
      openDoc(path, person)
    } catch (err) {
      window.alert('打开失败：' + String(err))
    }
  }, [openDoc])

  // 保存
  const handleSave = useCallback(async () => {
    const docValues = Object.values(useArchiveStore.getState().docs)
    const doc = docValues.find((d) => d.id === activeId)
    if (!doc) return

    const data = doc.data as unknown as ArchivePerson
    const birthErr = validateSaveBirthDates(data)
    if (birthErr) { alertRestoreFocus(birthErr); return }

    let targetPath = doc.filePath
    const isTemp = targetPath.includes('/runtime_docs/') || targetPath.includes('\\runtime_docs\\')
    if (!targetPath || isTemp) {
      targetPath = await window.api.dialogSave(data.XingMing?.trim() || undefined)
      if (!targetPath) return
    }

    try {
      const result = await window.api.saveLrmx(
        doc.data as unknown as Record<string, unknown>,
        targetPath
      )
      if (result.success) {
        // 更新页签标签 + 路径 + 清脏标记
        const label = targetPath.split(/[/\\]/).pop() || '档案.lrmx'
        const state = useArchiveStore.getState()
        const updated = state.docs[doc.id]
        if (updated) {
          useArchiveStore.setState({
            docs: { ...state.docs, [doc.id]: { ...updated, filePath: targetPath, label, isDirty: false } }
          })
        }
      } else {
        window.alert('保存失败：' + (result.error || '未知错误'))
      }
    } catch (err) {
      window.alert('保存失败：' + String(err))
    }
  }, [activeId])

  // 另存为
  const handleSaveAs = useCallback(async () => {
    const docValues = Object.values(useArchiveStore.getState().docs)
    const doc = docValues.find((d) => d.id === activeId)
    if (!doc) return

    const data = doc.data as unknown as ArchivePerson
    const birthErr = validateSaveBirthDates(data)
    if (birthErr) { alertRestoreFocus(birthErr); return }

    const targetPath = await window.api.dialogSave(data.XingMing?.trim() || undefined)
    if (!targetPath) return

    try {
      const result = await window.api.saveLrmx(
        doc.data as unknown as Record<string, unknown>,
        targetPath
      )
      if (result.success) {
        const label = targetPath.split(/[/\\]/).pop() || '档案.lrmx'
        const state = useArchiveStore.getState()
        const updated = state.docs[doc.id]
        if (updated) {
          useArchiveStore.setState({
            docs: { ...state.docs, [doc.id]: { ...updated, filePath: targetPath, label, isDirty: false } }
          })
        }
      } else {
        window.alert('保存失败：' + (result.error || '未知错误'))
      }
    } catch (err) {
      window.alert('保存失败：' + String(err))
    }
  }, [activeId])

  // 导出 DOCX
  const handleExportDocx = useCallback(async () => {
    const docValues = Object.values(useArchiveStore.getState().docs)
    const doc = docValues.find((d) => d.id === activeId)
    if (!doc) return

    const data = doc.data as unknown as ArchivePerson
    const birthErr = validateSaveBirthDates(data)
    if (birthErr) { alertRestoreFocus(birthErr); return }

    const outputPath = await window.api.dialogSaveDocx()
    if (!outputPath) return

    try {
      const result = await window.api.exportDocx(
        doc.data as unknown as Record<string, unknown>,
        outputPath
      )
      if (!result.success) {
        window.alert('导出失败：' + (result.error || '未知错误'))
      }
    } catch (err) {
      window.alert('导出失败：' + String(err))
    }
  }, [activeId])

  return (
    <div className="flex flex-col h-screen bg-slate-200">
      <TitleBar />
      <TabBar
        tabs={tabs}
        activeId={activeId}
        onSwitch={switchTab}
        onClose={closeTab}
      />

      {tabs.length === 0 ? (
        /* 空状态 + ToolPanel */
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex items-center justify-center bg-stone-50">
            <div className="text-center space-y-4">
              <div className="text-slate-400 text-6xl select-none">📄</div>
              <p className="text-slate-500 text-sm">尚未打开任何档案</p>
              <button
                onClick={handleNew}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm hover:bg-slate-700 transition-colors cursor-pointer"
              >
                新建档案
              </button>
            </div>
          </div>
          <ToolPanel onNew={handleNew} onOpen={handleOpen} onSave={handleSave} onSaveAs={handleSaveAs} onExportDocx={handleExportDocx} />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
            <PageViewer currentPage={currentPage} totalPages={2} onPageChange={setCurrentPage}>
              {currentPage === 1 ? <Page1 /> : <Page2 />}
            </PageViewer>
          </div>
          <ToolPanel onNew={handleNew} onOpen={handleOpen} onSave={handleSave} onSaveAs={handleSaveAs} onExportDocx={handleExportDocx} />
        </div>
      )}
    </div>
  )
}
