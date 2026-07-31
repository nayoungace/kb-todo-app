import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('test environment', () => {
  it('renders a component and exposes jest-dom matchers', () => {
    render(<button type="button">제출</button>)

    expect(screen.getByRole('button', { name: '제출' })).toBeInTheDocument()
  })
})
