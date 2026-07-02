/**
 * ToolPanel — 右侧工具栏（双列）
 */

import { FilePlus, FolderOpen, Save, Files, PencilRuler, Layers } from 'lucide-react'
import type { ReactNode } from 'react'

interface ToolButtonProps {
  icon: ReactNode
  label: string
  onClick?: () => void
}

function ToolButton({ icon, label, onClick }: ToolButtonProps): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
      title={label}
    >
      {icon}
      <span className="text-[10px] leading-none text-center">{label}</span>
    </button>
  )
}

interface ToolPanelProps {
  onNew: () => void
  onOpen: () => void
  onSave: () => void
  onSaveAs: () => void
}

export default function ToolPanel({ onNew, onOpen, onSave, onSaveAs }: ToolPanelProps): React.JSX.Element {
  return (
    <div className="flex flex-col bg-slate-900 border-l border-slate-700 px-2 py-4 h-full w-[128px] shrink-0">
      <div className="grid grid-cols-2 gap-1">
        <ToolButton icon={<FilePlus size={20} />} label="新建" onClick={onNew} />
        <ToolButton icon={<FolderOpen size={20} />} label="打开" onClick={onOpen} />
        <ToolButton icon={<Save size={20} />} label="保存" onClick={onSave} />
        <ToolButton icon={<Files size={20} />} label="另存为" onClick={onSaveAs} />
      </div>
      <div className="flex justify-between mt-1">
        <ToolButton icon={<Layers size={20} />} label="批量生成" />
        <ToolButton icon={<PencilRuler size={20} />} label="批量修改" />
      </div>
      <div className="flex-1" />
      <div className="text-[10px] text-slate-600 text-center mt-2">v1.0</div>
    </div>
  )
}
