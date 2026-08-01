import { beforeEach, describe, expect, it } from 'vitest'
import { authenticateForTest, TEST_ACCOUNT } from '@/test/test-utils'
import { UserRepository } from './user-repository'

describe('UserRepository', () => {
  beforeEach(() => {
    authenticateForTest()
  })

  it('회원정보의 name과 memo를 돌려준다', async () => {
    const profile = await UserRepository.getProfile()

    expect(profile).toEqual({ name: TEST_ACCOUNT.name, memo: TEST_ACCOUNT.memo })
  })
})
