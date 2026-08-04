import { afterEach, describe, expect, it, vi } from 'vitest'
import { errorModalStore } from './error-modal-store'

afterEach(() => {
  errorModalStore.close()
})

describe('errorModalStore', () => {
  it('show 로 문구를 담고 close 로 비운다', () => {
    errorModalStore.show('첫 번째 오류')
    expect(errorModalStore.get()).toBe('첫 번째 오류')

    errorModalStore.close()
    expect(errorModalStore.get()).toBeNull()
  })

  it('이미 열려 있으면 후발 에러를 버리고, 버린 사실을 개발 모드에서 남긴다', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    errorModalStore.show('첫 번째 오류')
    errorModalStore.show('두 번째 오류')
    errorModalStore.show('세 번째 오류')

    expect(errorModalStore.get()).toBe('첫 번째 오류')
    expect(consoleError).toHaveBeenCalledTimes(2)
    expect(consoleError).toHaveBeenLastCalledWith(expect.any(String), '세 번째 오류')
  })

  it('닫은 뒤에는 다시 열린다', () => {
    errorModalStore.show('첫 번째 오류')
    errorModalStore.close()
    errorModalStore.show('두 번째 오류')

    expect(errorModalStore.get()).toBe('두 번째 오류')
  })

  it('구독자에게 변경을 알리고, 변화가 없으면 알리지 않는다', () => {
    const listener = vi.fn()
    const unsubscribe = errorModalStore.subscribe(listener)

    errorModalStore.show('오류')
    expect(listener).toHaveBeenCalledTimes(1)

    errorModalStore.show('무시되는 오류')
    expect(listener).toHaveBeenCalledTimes(1)

    errorModalStore.close()
    expect(listener).toHaveBeenCalledTimes(2)
    errorModalStore.close()
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    errorModalStore.show('구독 해제 후')
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
