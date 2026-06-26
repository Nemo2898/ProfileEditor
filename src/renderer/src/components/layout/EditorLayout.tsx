/**
 * EditorLayout — 主布局容器（左右分栏）
 * 左侧：TabBar + PageViewer(档案表格)
 * 右侧：ToolPanel
 */

import { useState } from 'react'
import TabBar from './TabBar'
import PageViewer from './PageViewer'
import ToolPanel from './ToolPanel'
import Page1 from '../Page1'
import Page2 from '../Page2'
import { useArchiveStore } from '../../store/archive'

/** 初始演示页签 */
const INITIAL_TABS = [{ id: '1', label: '新建档案.xml', isDirty: false }]

export default function EditorLayout(): React.JSX.Element {
  const [tabs, setTabs] = useState(INITIAL_TABS)
  const [activeId, setActiveId] = useState('1')
  const currentPage = useArchiveStore((s) => s.currentPage)
  const setCurrentPage = useArchiveStore((s) => s.setCurrentPage)
  const isDirty = useArchiveStore((s) => s.isDirty)

  // 同步 isDirty 到当前页签
  const displayTabs = tabs.map((t) => (t.id === activeId ? { ...t, isDirty } : t))

  function handleNew(): void {
    const id = String(Date.now())
    setTabs([...tabs, { id, label: `新建档案.xml`, isDirty: false }])
    setActiveId(id)
    setCurrentPage(1)
  }

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
        <ToolPanel />
      </div>
    </div>
  )
}
