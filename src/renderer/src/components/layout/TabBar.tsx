/**
 * TabBar — 顶部页签条（已打开档案列表）
 */

import { Plus, X } from 'lucide-react'

interface Tab {
  id: string
  label: string
  isDirty: boolean
}

interface TabBarProps {
  tabs: Tab[]
  activeId: string | null
  onSwitch: (id: string) => void
  onClose: (id: string) => void
  onNew: () => void
}

export default function TabBar({ tabs, activeId, onSwitch, onClose, onNew }: TabBarProps): React.JSX.Element {
  return (
    <div className="flex items-center bg-slate-900 border-b border-slate-700 px-1 gap-0.5 select-none">
      {/* 页签列表 */}
      <div className="flex-1 flex items-center overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              onClick={() => onSwitch(tab.id)}
              className={`group flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap transition-colors cursor-pointer border-r border-slate-700
                ${isActive ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
              `}
            >
              {tab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              <span className="max-w-[120px] truncate">{tab.label}</span>
              <X
                size={12}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-red-400 rounded-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose(tab.id)
                }}
              />
            </button>
          )
        })}
      </div>

      {/* 新建按钮 */}
      <button
        onClick={onNew}
        className="flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
        title="新建档案"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
