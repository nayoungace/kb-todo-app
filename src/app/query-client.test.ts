import { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it } from 'vitest'
import { HttpError } from '@/shared/api'
import { errorModalStore } from '@/shared/lib/error-modal-store'
import {
  isSilentQueryError,
  queryClient,
  shouldOpenErrorModal,
  shouldRetryQuery,
} from './query-client'

afterEach(() => {
  errorModalStore.close()
  queryClient.clear()
})

describe('shouldOpenErrorModal', () => {
  it('인증 요청의 401 은 쿼리·뮤테이션 모두 모달을 띄우지 않는다 — AuthGate 가 표현한다', () => {
    const error = new HttpError(401, '인증이 필요합니다')
    expect(shouldOpenErrorModal(error, 'query')).toBe(false)
    expect(shouldOpenErrorModal(error, 'mutation')).toBe(false)
  })

  it('인증 없는 요청(로그인)의 401 은 모달을 띄운다 — AuthGate 가 없는 화면이라 유일한 통지다', () => {
    const error = new HttpError(401, '인증이 필요합니다', false)
    expect(shouldOpenErrorModal(error, 'query')).toBe(true)
    expect(shouldOpenErrorModal(error, 'mutation')).toBe(true)
  })

  it('404 는 쿼리에서만 제외된다 — 상세 전용 화면이 표현하고, 삭제 실패는 모달이 유일한 통지다', () => {
    const error = new HttpError(404, '할 일을 찾을 수 없습니다')
    expect(shouldOpenErrorModal(error, 'query')).toBe(false)
    expect(shouldOpenErrorModal(error, 'mutation')).toBe(true)
  })

  it('로그인 실패(400)와 서버 오류(500)는 모달을 띄운다', () => {
    expect(shouldOpenErrorModal(new HttpError(400, '올바르지 않습니다'), 'mutation')).toBe(true)
    expect(shouldOpenErrorModal(new HttpError(500, '서버 오류'), 'query')).toBe(true)
  })

  it('HttpError 가 아닌 실패도 모달을 띄운다', () => {
    expect(shouldOpenErrorModal(new TypeError('Failed to fetch'), 'query')).toBe(true)
  })

  it('요청 취소(AbortError)는 실패가 아니므로 띄우지 않는다', () => {
    const aborted = new DOMException('Aborted', 'AbortError')
    expect(shouldOpenErrorModal(aborted, 'query')).toBe(false)
  })
})

describe('isSilentQueryError', () => {
  it('meta 를 달지 않은 쿼리는 데이터가 남아 있어도 모달을 띄운다', () => {
    expect(isSilentQueryError({ state: { data: { pages: [] } } })).toBe(false)
  })

  it('첫 로딩 실패는 대신 표현할 데이터가 없으므로 모달을 띄운다', () => {
    expect(
      isSilentQueryError({ meta: { hasInlineErrorUi: true }, state: { data: undefined } }),
    ).toBe(false)
  })

  it('데이터가 남아 있는 실패는 화면의 재시도 UI 에 맡긴다', () => {
    expect(
      isSilentQueryError({ meta: { hasInlineErrorUi: true }, state: { data: { pages: [] } } }),
    ).toBe(true)
  })
})

describe('shouldRetryQuery', () => {
  it('404 는 재시도하지 않는다 — 같은 요청을 다시 보내도 답이 바뀌지 않는다', () => {
    expect(shouldRetryQuery(0, new HttpError(404, '할 일을 찾을 수 없습니다'))).toBe(false)
  })

  it('나머지 4xx 도 재시도하지 않는다 — 요청 자체가 잘못된 경우다', () => {
    expect(shouldRetryQuery(0, new HttpError(400, 'page 는 1 이상의 정수여야 합니다'))).toBe(false)
    expect(shouldRetryQuery(0, new HttpError(401, '인증이 필요합니다'))).toBe(false)
  })

  it('5xx 는 한 번 재시도한다 — 일시적 실패일 수 있다', () => {
    const error = new HttpError(500, '서버 오류')
    expect(shouldRetryQuery(0, error)).toBe(true)
    expect(shouldRetryQuery(1, error)).toBe(false)
  })

  it('네트워크 오류도 한 번 재시도한다', () => {
    expect(shouldRetryQuery(0, new TypeError('Failed to fetch'))).toBe(true)
    expect(shouldRetryQuery(1, new TypeError('Failed to fetch'))).toBe(false)
  })
})

describe('queryClient 배선', () => {
  it('쿼리 실패가 서버 문구를 담아 모달 스토어를 연다', async () => {
    await expect(
      queryClient.fetchQuery({
        queryKey: ['test', 'server-error'],
        queryFn: () => Promise.reject(new HttpError(500, '서버가 응답하지 않습니다')),
        retry: false,
      }),
    ).rejects.toThrow()

    expect(errorModalStore.get()).toBe('서버가 응답하지 않습니다')
  })

  it('쿼리 404 는 모달 스토어를 열지 않는다', async () => {
    await expect(
      queryClient.fetchQuery({
        queryKey: ['test', 'not-found'],
        queryFn: () => Promise.reject(new HttpError(404, '할 일을 찾을 수 없습니다')),
        retry: false,
      }),
    ).rejects.toThrow()

    expect(errorModalStore.get()).toBeNull()
  })

  it('인라인 에러 UI 를 가진 쿼리는 데이터를 받은 뒤의 실패로 모달을 열지 않는다', async () => {
    const queryKey = ['test', 'inline-error']
    const meta = { hasInlineErrorUi: true }
    await queryClient.fetchQuery({ queryKey, meta, queryFn: () => Promise.resolve('첫 응답') })

    await expect(
      queryClient.fetchQuery({
        queryKey,
        meta,
        queryFn: () => Promise.reject(new HttpError(500, '서버가 응답하지 않습니다')),
        retry: false,
        staleTime: 0,
      }),
    ).rejects.toThrow()

    expect(errorModalStore.get()).toBeNull()
  })

  it('인라인 에러 UI 를 가진 쿼리도 첫 로딩 실패는 모달을 연다', async () => {
    await expect(
      queryClient.fetchQuery({
        queryKey: ['test', 'inline-error-first-load'],
        meta: { hasInlineErrorUi: true },
        queryFn: () => Promise.reject(new HttpError(500, '서버가 응답하지 않습니다')),
        retry: false,
      }),
    ).rejects.toThrow()

    expect(errorModalStore.get()).toBe('서버가 응답하지 않습니다')
  })

  it('뮤테이션 실패는 모달 스토어를 연다', async () => {
    const client = new QueryClient({ mutationCache: queryClient.getMutationCache() })
    await expect(
      client
        .getMutationCache()
        .build(client, {
          mutationFn: () => Promise.reject(new HttpError(404, '이미 삭제된 할 일입니다')),
          retry: false,
        })
        .execute(undefined),
    ).rejects.toThrow()

    expect(errorModalStore.get()).toBe('이미 삭제된 할 일입니다')
  })
})
