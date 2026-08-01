import { beforeEach, describe, expect, it } from 'vitest'
import { SEED_ACCOUNT } from '@/mocks/data/db'
import { authenticateForTest } from '@/test/test-utils'
import { UserRepository } from './user-repository'

describe('UserRepository', () => {
  beforeEach(() => {
    authenticateForTest()
  })

  it('회원정보의 name과 memo를 돌려준다', async () => {
    const profile = await UserRepository.getProfile()

    expect(profile).toEqual({ name: SEED_ACCOUNT.name, memo: SEED_ACCOUNT.memo })
  })
})
