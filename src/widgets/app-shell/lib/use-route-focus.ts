import { useEffect, useRef } from 'react'
import { useRouterState } from '@tanstack/react-router'

export function useRouteFocus<T extends HTMLElement>() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const ref = useRef<T>(null)
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) return

    previousPathname.current = pathname
    ref.current?.focus({ preventScroll: true })
  }, [pathname])

  return ref
}
