/**
 * EditorLayout — 主布局容器（左右分栏）
 * 左侧：TabBar + PageViewer(档案表格)
 * 右侧：ToolPanel
 */

import { useState, useCallback } from 'react'
import TabBar from './TabBar'
import PageViewer from './PageViewer'
import ToolPanel from './ToolPanel'
import Page1 from '../Page1'
import Page2 from '../Page2'
import { useArchiveStore } from '../../store/archive'
import type { ArchivePerson } from '../../types/archive'

interface Tab {
  id: string
  label: string
  isDirty: boolean
  filePath: string | null
}

const INITIAL_TABS: Tab[] = [{ id: '1', label: '新建档案.lrmx', isDirty: false, filePath: null }]

export default function EditorLayout(): React.JSX.Element {
  const [tabs, setTabs] = useState<Tab[]>(INITIAL_TABS)
  const [activeId, setActiveId] = useState('1')
  const currentPage = useArchiveStore((s) => s.currentPage)
  const setCurrentPage = useArchiveStore((s) => s.setCurrentPage)
  const isDirty = useArchiveStore((s) => s.isDirty)
  const data = useArchiveStore((s) => s.data)
  const setData = useArchiveStore((s) => s.setData)
  const setFilePath = useArchiveStore((s) => s.setFilePath)
  const markClean = useArchiveStore((s) => s.markClean)
  const filePath = useArchiveStore((s) => s.filePath)

  const displayTabs = tabs.map((t) => (t.id === activeId ? { ...t, isDirty } : t))
  const activeTab = tabs.find((t) => t.id === activeId)

  // 新建
  const handleNew = useCallback(async () => {
    const id = String(Date.now())
    setTabs((prev) => [...prev, { id, label: '新建档案.lrmx', isDirty: false, filePath: null }])
    setActiveId(id)
    setCurrentPage(1)
  }, [setCurrentPage])

  // 打开
  const handleOpen = useCallback(async () => {
    try {
      const path = await window.api.dialogOpen()
      if (!path) return
      const person = (await window.api.openLrmx(path)) as ArchivePerson
      const id = String(Date.now())
      const label = path.split(/[/\\]/).pop() || '档案.lrmx'
      setTabs((prev) => [...prev, { id, label, isDirty: false, filePath: path }])
      setActiveId(id)
      setData(person)
      setFilePath(path)
      setCurrentPage(1)
    } catch (err) {
      window.alert('打开失败：' + String(err))
    }
  }, [setData, setFilePath, setCurrentPage])

  // 保存
  const handleSave = useCallback(async () => {
    try {
      let targetPath = filePath
      if (!targetPath) {
        targetPath = await window.api.dialogSave()
        if (!targetPath) return
      }
      const result = await window.api.saveLrmx(data as unknown as Record<string, unknown>, targetPath)
      if (result.success) {
        markClean()
        setFilePath(targetPath)
        // 更新页签标签
        const label = targetPath.split(/[/\\]/).pop() || '档案.lrmx'
        setTabs((prev) => prev.map((t) => (t.id === activeId ? { ...t, label, filePath: targetPath } : t)))
      } else {
        window.alert('保存失败：' + (result.error || '未知错误'))
      }
    } catch (err) {
      window.alert('保存失败：' + String(err))
    }
  }, [data, filePath, activeId, markClean, setFilePath])

  // 另存为
  const handleSaveAs = useCallback(async () => {
    try {
      const targetPath = await window.api.dialogSave()
      if (!targetPath) return
      const result = await window.api.saveLrmx(data as unknown as Record<string, unknown>, targetPath)
      if (result.success) {
        markClean()
        setFilePath(targetPath)
        const label = targetPath.split(/[/\\]/).pop() || '档案.lrmx'
        setTabs((prev) => prev.map((t) => (t.id === activeId ? { ...t, label, filePath: targetPath } : t)))
      } else {
        window.alert('保存失败：' + (result.error || '未知错误'))
      }
    } catch (err) {
      window.alert('保存失败：' + String(err))
    }
  }, [data, activeId, markClean, setFilePath])

  // 关闭页签
  function handleClose(id: string): void {
    if (tabs.length <= 1) return
    const idx = tabs.findIndex((t) => t.id === id)
    const next = tabs.filter((t) => t.id !== id)
    setTabs(next)
    if (activeId === id) {
      const newIdx = Math.min(idx, next.length - 1)
      setActiveId(next[newIdx].id)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-200">
      {/* 顶部：TabBar */}
      <TabBar
        tabs={displayTabs}
        activeId={activeId}
        onSwitch={setActiveId}
        onClose={handleClose}
        onNew={handleNew}
      />

      {/* 主体：左右分栏 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧：档案渲染区 */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <PageViewer currentPage={currentPage} totalPages={2} onPageChange={setCurrentPage}>
            {currentPage === 1 ? <Page1 /> : <Page2 />}
          </PageViewer>
        </div>

        {/* 右侧：工具栏 */}
        <ToolPanel
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
        />
      </div>
    </div>
  )
}
