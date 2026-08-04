import { useLayoutEffect, useState, type RefObject } from 'react'

export function useScrollMargin(ref: RefObject<HTMLElement | null>): number {
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const measure = () => {
      setScrollMargin(element.getBoundingClientRect().top + window.scrollY)
    }
    measure()

    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => measure())
    observer?.observe(document.body)
    window.addEventListener('resize', measure)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [ref])

  return scrollMargin
}
