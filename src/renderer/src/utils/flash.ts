/**
 * 非阻塞用户提示 — 替代 window.alert
 *
 * 在 Electron sandbox 下，window.alert 会冻结渲染管线、销毁光标状态。
 * flashError 以临时 DOM toast 形式展示，不抢焦点、不阻塞。
 */

/**
 * 插入红色 toast 提示，2.5s 后淡出消失
 * 若 DOM 尚未就绪则回退 console.error
 */
export function flashError(msg: string): void {
  if (typeof document === 'undefined' || !document.body) {
    console.error(msg)
    return
  }
  const div = document.createElement('div')
  div.className =
    'fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-red-600 text-white text-sm shadow-lg transition-opacity duration-300'
  div.textContent = msg
  document.body.appendChild(div)
  setTimeout(() => {
    div.style.opacity = '0'
    setTimeout(() => div.remove(), 300)
  }, 2500)
}
