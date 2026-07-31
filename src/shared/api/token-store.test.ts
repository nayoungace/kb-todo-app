import { afterEach, describe, expect, it, vi } from 'vitest'
import { tokenStore } from './token-store'

describe('tokenStore', () => {
  afterEach(() => {
    tokenStore.clear()
  })

  it('set과 clear 시 구독자에게 통지한다', () => {
    const listener = vi.fn()
    tokenStore.subscribe(listener)

    tokenStore.set('access-token')
    expect(tokenStore.get()).toBe('access-token')
    expect(listener).toHaveBeenCalledTimes(1)

    tokenStore.clear()
    expect(tokenStore.get()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('이미 비어 있으면 clear는 통지하지 않는다', () => {
    const listener = vi.fn()
    tokenStore.subscribe(listener)

    tokenStore.clear()
    expect(listener).not.toHaveBeenCalled()
  })

  it('구독 해제 후에는 통지하지 않는다', () => {
    const listener = vi.fn()
    const unsubscribe = tokenStore.subscribe(listener)

    unsubscribe()
    tokenStore.set('access-token')
    expect(listener).not.toHaveBeenCalled()
  })
})
