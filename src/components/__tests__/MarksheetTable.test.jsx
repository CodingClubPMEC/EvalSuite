import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MarksheetTable from '../MarksheetTable'

// Mock the configManager
vi.mock('../../config/hackathonConfig', () => ({
  configManager: {
    getActiveTeams: () => [
      {
        id: 1,
        name: "Team Alpha",
        members: ["John Doe", "Jane Smith"],
        projectTitle: "Test Project"
      },
      {
        id: 2,
        name: "Team Beta", 
        members: ["Bob Wilson"],
        projectTitle: "Another Project"
      }
    ],
    getActiveEvaluationCriteria: () => [
      { id: 1, name: "Innovation", maxMarks: 25 },
      { id: 2, name: "Feasibility", maxMarks: 20 }
    ]
  }
}))

describe('MarksheetTable Component', () => {
  it('renders team information correctly', async () => {
    const mockOnScoreChange = vi.fn()
    render(<MarksheetTable onScoreChange={mockOnScoreChange} initialScores={{}} />)
    
    // Wait for loading to finish
    await screen.findByText('Team Alpha')
    
    expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    expect(screen.getByText('Team Beta')).toBeInTheDocument()
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('John Doe, Jane Smith')).toBeInTheDocument()
  })

  it('displays evaluation criteria headers', async () => {
    const mockOnScoreChange = vi.fn()
    render(<MarksheetTable onScoreChange={mockOnScoreChange} initialScores={{}} />)
    
    await screen.findByText('Innovation')
    
    expect(screen.getByText(/Innovation/)).toBeInTheDocument()
    expect(screen.getByText(/Feasibility/)).toBeInTheDocument()
    expect(screen.getByText('MAX: 25')).toBeInTheDocument()
    expect(screen.getByText('MAX: 20')).toBeInTheDocument()
  })

  it('handles score input correctly', async () => {
    const mockOnScoreChange = vi.fn()
    render(<MarksheetTable onScoreChange={mockOnScoreChange} initialScores={{}} />)
    
    // Wait for component to load
    await screen.findByText('Team Alpha')
    
    const inputs = screen.getAllByDisplayValue('')
    const firstInput = inputs[0]
    
    fireEvent.change(firstInput, { target: { value: '15' } })
    
    expect(firstInput.value).toBe('15')
  })

  it('calculates totals correctly', async () => {
    const mockOnScoreChange = vi.fn()
    render(<MarksheetTable onScoreChange={mockOnScoreChange} initialScores={{}} />)
    
    await screen.findByText('Team Alpha')
    
    // Initially should show 0 total
    const totalElements = screen.getAllByText('0')
    expect(totalElements.length).toBeGreaterThan(0)
  })

  it('enforces maximum score limits', async () => {
    const mockOnScoreChange = vi.fn()
    render(<MarksheetTable onScoreChange={mockOnScoreChange} initialScores={{}} />)
    
    await screen.findByText('Team Alpha')
    
    const inputs = screen.getAllByRole('spinbutton')
    const firstInput = inputs[0]
    
    // Try to enter value higher than max (25)
    fireEvent.change(firstInput, { target: { value: '30' } })
    
    // Should be capped at maximum value (25)
    expect(firstInput.value).toBe('25')
  })

  it('has proper accessibility attributes', async () => {
    const mockOnScoreChange = vi.fn()
    render(<MarksheetTable onScoreChange={mockOnScoreChange} initialScores={{}} />)
    
    await screen.findByText('Team Alpha')
    
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveAttribute('aria-label')
    expect(inputs[0].getAttribute('aria-label')).toContain('Team Alpha')
    expect(inputs[0].getAttribute('aria-label')).toContain('Innovation')
  })

  it('calls onScoreChange when scores are updated', async () => {
    const mockOnScoreChange = vi.fn()
    render(<MarksheetTable onScoreChange={mockOnScoreChange} initialScores={{}} />)
    
    await screen.findByText('Team Alpha')
    
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '20' } })
    
    expect(mockOnScoreChange).toHaveBeenCalled()
  })

  it('responds to mobile viewport correctly', async () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })
    
    const mockOnScoreChange = vi.fn()
    render(<MarksheetTable onScoreChange={mockOnScoreChange} initialScores={{}} />)
    
    await screen.findByText('Team Alpha')
    
    // In mobile view, should still render team information
    expect(screen.getByText('Team Alpha')).toBeInTheDocument()
  })
})