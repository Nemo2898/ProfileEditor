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

export default function EditorLayout(): React.JSX.Element {
  const docs = useArchiveStore((s) => s.docs)
  const activeId = useArchiveStore((s) => s.activeId)
  const currentPage = useArchiveStore((s) => s.currentPage)
  const setCurrentPage = useArchiveStore((s) => s.setCurrentPage)
  const openDoc = useArchiveStore((s) => s.openDoc)
  const newDoc = useArchiveStore((s) => s.newDoc)
  const switchTab = useArchiveStore((s) => s.switchTab)
  const closeTab = useArchiveStore((s) => s.closeTab)
  const markClean = useArchiveStore((s) => s.markClean)

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

    let targetPath = doc.filePath
    const isTemp = targetPath.includes('/runtime_docs/') || targetPath.includes('\\runtime_docs\\')
    if (!targetPath || isTemp) {
      targetPath = await window.api.dialogSave()
      if (!targetPath) return
    }

    try {
      const result = await window.api.saveLrmx(
        doc.data as unknown as Record<string, unknown>,
        targetPath
      )
      if (result.success) {
        markClean()
        // 更新页签标签
        const label = targetPath.split(/[/\\]/).pop() || '档案.lrmx'
        const state = useArchiveStore.getState()
        const updated = state.docs[doc.id]
        if (updated) {
          useArchiveStore.setState({
            docs: { ...state.docs, [doc.id]: { ...updated, filePath: targetPath, label } }
          })
        }
      } else {
        window.alert('保存失败：' + (result.error || '未知错误'))
      }
    } catch (err) {
      window.alert('保存失败：' + String(err))
    }
  }, [activeId, markClean])

  // 另存为
  const handleSaveAs = useCallback(async () => {
    const docValues = Object.values(useArchiveStore.getState().docs)
    const doc = docValues.find((d) => d.id === activeId)
    if (!doc) return

    const targetPath = await window.api.dialogSave()
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
  }, [activeId, markClean])

  return (
    <div className="flex flex-col h-screen bg-slate-200">
      <TitleBar />
      <TabBar
        tabs={tabs}
        activeId={activeId}
        onSwitch={switchTab}
        onClose={closeTab}
        onNew={handleNew}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <PageViewer currentPage={currentPage} totalPages={2} onPageChange={setCurrentPage}>
            {currentPage === 1 ? <Page1 /> : <Page2 />}
          </PageViewer>
        </div>

        <ToolPanel onNew={handleNew} onOpen={handleOpen} onSave={handleSave} onSaveAs={handleSaveAs} />
      </div>
    </div>
  )
}
