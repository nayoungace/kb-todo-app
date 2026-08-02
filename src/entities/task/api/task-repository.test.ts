import { beforeEach, describe, expect, it } from 'vitest'
import { HttpError } from '@/shared/api'
import { authenticateForTest } from '@/test/test-utils'
import { TaskRepository } from './task-repository'

describe('TaskRepository', () => {
  beforeEach(() => {
    authenticateForTest()
  })

  it('목록 첫 페이지는 20건과 hasNext true를 돌려준다', async () => {
    const result = await TaskRepository.getList({ page: 1 })

    expect(result.data).toHaveLength(20)
    expect(result.hasNext).toBe(true)
  })

  it('목록 항목의 id는 openapi 계약대로 문자열이다', async () => {
    const result = await TaskRepository.getList({ page: 1 })

    expect(result.data[0]?.id).toBe('1')
  })

  it('마지막 페이지에서는 hasNext가 false다', async () => {
    const result = await TaskRepository.getList({ page: 11 })

    expect(result.data).toHaveLength(20)
    expect(result.hasNext).toBe(false)
  })

  it('상세는 title·memo·registerDatetime만 돌려준다', async () => {
    const detail = await TaskRepository.getDetail('1')

    expect(Object.keys(detail)).toEqual(['title', 'memo', 'registerDatetime'])
  })

  it('존재하지 않는 상세는 404 HttpError로 실패한다', async () => {
    const error = await TaskRepository.getDetail('99999').catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(HttpError)
    expect((error as HttpError).status).toBe(404)
    expect((error as HttpError).message).toBe('할 일을 찾을 수 없습니다')
  })

  it('삭제에 성공하면 같은 id의 상세 조회가 404가 된다', async () => {
    await expect(TaskRepository.remove('1')).resolves.toEqual({ success: true })

    const error = await TaskRepository.getDetail('1').catch((reason: unknown) => reason)
    expect((error as HttpError).status).toBe(404)
  })
})
