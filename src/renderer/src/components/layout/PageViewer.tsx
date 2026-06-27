/**
 * PageViewer — 翻页容器
 * 包裹档案表格，底部提供翻页控件
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageViewerProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  children: ReactNode
}

export default function PageViewer({
  currentPage,
  totalPages,
  onPageChange,
  children
}: PageViewerProps): React.JSX.Element {
  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  return (
    <div className="flex flex-col h-full">
      {/* 内容区 */}
      <div className="flex-1 overflow-auto bg-slate-50">{children}</div>

      {/* 翻页控件 */}
      <div className="flex items-center justify-center gap-4 py-2 bg-slate-100 border-t border-slate-200 select-none shrink-0">
        <button
          onClick={() => canPrev && onPageChange(currentPage - 1)}
          disabled={!canPrev}
          className={`p-1 rounded-md transition-colors cursor-pointer
            ${canPrev ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-300 cursor-not-allowed'}
          `}
        >
          <ChevronLeft size={20} />
        </button>

        <span className="text-sm text-slate-500 tabular-nums">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => canNext && onPageChange(currentPage + 1)}
          disabled={!canNext}
          className={`p-1 rounded-md transition-colors cursor-pointer
            ${canNext ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-300 cursor-not-allowed'}
          `}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
