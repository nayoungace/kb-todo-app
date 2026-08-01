import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { TaskItem } from '../model/types'
import { TaskCard } from './task-card'

const task: TaskItem = {
  id: '7',
  title: '할 일 7',
  memo: '7번째 할 일 메모입니다.',
  status: 'TODO',
}

describe('TaskCard', () => {
  it('title과 memo를 보여준다', () => {
    render(<TaskCard task={task} />)

    expect(screen.getByRole('heading', { name: '할 일 7' })).toBeInTheDocument()
    expect(screen.getByText('7번째 할 일 메모입니다.')).toBeInTheDocument()
  })

  it('TODO는 "해야할 일" 배지를 보여준다', () => {
    render(<TaskCard task={task} />)

    expect(screen.getByText('해야할 일')).toBeInTheDocument()
  })

  it('DONE은 "한 일" 배지를 보여준다', () => {
    render(<TaskCard task={{ ...task, status: 'DONE' }} />)

    expect(screen.getByText('한 일')).toBeInTheDocument()
  })
})
