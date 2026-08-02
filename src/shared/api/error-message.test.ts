import { describe, expect, it } from 'vitest'
import { toErrorMessage } from './error-message'
import { HttpError } from './http-error'

describe('toErrorMessage', () => {
  it('HttpError 는 서버가 준 문구를 그대로 돌려준다', () => {
    const error = new HttpError(400, '이메일 또는 비밀번호가 올바르지 않습니다')
    expect(toErrorMessage(error)).toBe('이메일 또는 비밀번호가 올바르지 않습니다')
  })

  it('HttpError 가 아니면 폴백 문구를 쓴다', () => {
    expect(toErrorMessage(new TypeError('Failed to fetch'))).toBe(
      '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    )
  })

  it('Error 가 아닌 값이 던져져도 폴백 문구를 쓴다', () => {
    expect(toErrorMessage('boom')).toBe('요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
  })
})
