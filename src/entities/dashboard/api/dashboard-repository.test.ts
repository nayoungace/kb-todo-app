import { beforeEach, describe, expect, it } from 'vitest'
import { authenticateForTest } from '@/test/test-utils'
import { DashboardRepository } from './dashboard-repository'

describe('DashboardRepository', () => {
  beforeEach(() => {
    authenticateForTest()
  })

  it('전체·해야할 일·한 일 집계를 돌려준다', async () => {
    const summary = await DashboardRepository.getSummary()

    // 시드 220건 중 seq % 3 === 0 인 73건이 DONE 이다.
    expect(summary).toEqual({ numOfTask: 220, numOfRestTask: 147, numOfDoneTask: 73 })
  })
})
