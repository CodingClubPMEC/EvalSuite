import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import JuryCard from '../JuryCard'

const mockJury = {
  id: 1,
  name: "Dr. Test Jury",
  designation: "Professor, Computer Science",
  department: "PMEC"
}

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('JuryCard Component', () => {
  it('renders jury information correctly', () => {
    renderWithRouter(<JuryCard jury={mockJury} />)
    
    expect(screen.getByText('Dr. Test Jury')).toBeInTheDocument()
    expect(screen.getByText('Professor, Computer Science')).toBeInTheDocument()
    expect(screen.getByText('PMEC')).toBeInTheDocument()
  })

  it('displays jury initials correctly', () => {
    renderWithRouter(<JuryCard jury={mockJury} />)
    
    // "Dr. Test Jury" should display "DT" as initials
    expect(screen.getByText('DT')).toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    renderWithRouter(<JuryCard jury={mockJury} />)
    
    const article = screen.getByRole('article')
    expect(article).toBeInTheDocument()
    
    const startButton = screen.getByRole('button', { name: /start evaluation for dr\. test jury/i })
    expect(startButton).toBeInTheDocument()
    expect(startButton).toHaveAttribute('aria-label', 'Start evaluation for Dr. Test Jury')
  })

  it('generates correct evaluation link', () => {
    renderWithRouter(<JuryCard jury={mockJury} />)
    
    const link = screen.getByRole('button', { name: /start evaluation/i })
    expect(link.closest('a')).toHaveAttribute('href', '/marking/1')
  })

  it('handles long names correctly', () => {
    const longNameJury = {
      ...mockJury,
      name: "Dr. Very Long Name For Testing Multiple Words"
    }
    
    renderWithRouter(<JuryCard jury={longNameJury} />)
    
    expect(screen.getByText('Dr. Very Long Name For Testing Multiple Words')).toBeInTheDocument()
    // Should show "DV" for "Dr. Very"
    expect(screen.getByText('DV')).toBeInTheDocument()
  })

  it('applies hover effects and transitions', () => {
    renderWithRouter(<JuryCard jury={mockJury} />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveClass('transform', 'hover:-translate-y-2', 'transition-all')
  })
})