/**
 * TitleBar — 自定义标题栏（替代原生窗口边框）
 */

import { useEffect, useState } from 'react'
import { Minus, Square, X, Copy } from 'lucide-react'

export default function TitleBar(): React.JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (!window.api.onWindowStateChange) return
    const remove = window.api.onWindowStateChange((max) => {
      setIsMaximized(max)
    })
    return remove
  }, [])

  async function handleMinimize(): Promise<void> {
    await window.api.windowMinimize?.()
  }

  async function handleMaximize(): Promise<void> {
    await window.api.windowMaximize?.()
  }

  async function handleClose(): Promise<void> {
    await window.api.windowClose?.()
  }

  return (
    <div
      className="flex items-center justify-between h-9 bg-slate-950 border-b border-slate-800 select-none shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      onDoubleClick={handleMaximize}
    >
      <div className="flex items-center gap-2 pl-3">
        <span className="text-xs text-slate-400">档案编辑器</span>
      </div>

      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-11 h-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="最小化"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-11 h-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title={isMaximized ? '还原' : '最大化'}
        >
          {isMaximized ? <Copy size={13} /> : <Square size={13} />}
        </button>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-11 h-full text-slate-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
          title="关闭"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
