import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

/**
 * 스캐폴딩 검증용 스모크 테스트.
 * RTL 렌더링 · jest-dom 매처 · @/ 별칭 해석이 모두 동작하는지만 확인한다.
 */
describe('test environment', () => {
  it('renders a component and exposes jest-dom matchers', () => {
    render(<button type="button">제출</button>)

    expect(screen.getByRole('button', { name: '제출' })).toBeInTheDocument()
  })
})
