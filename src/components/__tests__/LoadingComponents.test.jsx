import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { 
  LoadingSpinner, 
  LoadingOverlay, 
  PageLoading, 
  ComponentLoading,
  ButtonLoading,
  TableLoading 
} from '../LoadingComponents'

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-8', 'w-8', 'border-orange-500')
  })

  it('applies different sizes correctly', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-12', 'w-12')
  })

  it('applies different colors correctly', () => {
    render(<LoadingSpinner color="blue" />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('border-blue-500')
  })
})

describe('LoadingOverlay Component', () => {
  it('renders when visible', () => {
    render(<LoadingOverlay isVisible={true} message="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    render(<LoadingOverlay isVisible={false} message="Loading data..." />)
    expect(screen.queryByText('Loading data...')).not.toBeInTheDocument()
  })

  it('shows default message when none provided', () => {
    render(<LoadingOverlay isVisible={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})

describe('PageLoading Component', () => {
  it('renders with custom message', () => {
    render(<PageLoading message="Loading page content..." />)
    expect(screen.getByText('Loading page content...')).toBeInTheDocument()
  })

  it('has proper styling for full page loading', () => {
    render(<PageLoading />)
    const container = document.querySelector('.min-h-screen')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('bg-gradient-to-br', 'from-slate-900')
  })
})

describe('ComponentLoading Component', () => {
  it('renders with default height', () => {
    render(<ComponentLoading />)
    const container = document.querySelector('.h-32')
    expect(container).toBeInTheDocument()
  })

  it('applies custom height', () => {
    render(<ComponentLoading height="h-64" />)
    const container = document.querySelector('.h-64')
    expect(container).toBeInTheDocument()
  })
})

describe('ButtonLoading Component', () => {
  it('shows loading state when loading', () => {
    render(
      <ButtonLoading isLoading={true}>
        Click me
      </ButtonLoading>
    )
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Click me')).not.toBeInTheDocument()
  })

  it('shows children when not loading', () => {
    render(
      <ButtonLoading isLoading={false}>
        Click me
      </ButtonLoading>
    )
    
    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('is disabled when loading', () => {
    render(
      <ButtonLoading isLoading={true}>
        Click me
      </ButtonLoading>
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('passes through other props', () => {
    render(
      <ButtonLoading isLoading={false} className="custom-class" data-testid="test-button">
        Click me
      </ButtonLoading>
    )
    
    const button = screen.getByTestId('test-button')
    expect(button).toHaveClass('custom-class')
  })
})

describe('TableLoading Component', () => {
  it('renders with default rows and columns', () => {
    render(<TableLoading />)
    
    // Should have header row + 5 data rows by default
    const rows = document.querySelectorAll('.grid')
    expect(rows).toHaveLength(6) // 1 header + 5 data rows
  })

  it('renders with custom rows and columns', () => {
    render(<TableLoading rows={3} columns={4} />)
    
    const rows = document.querySelectorAll('.grid')
    expect(rows).toHaveLength(4) // 1 header + 3 data rows
    
    // Check that each row has 4 columns
    rows.forEach(row => {
      expect(row).toHaveClass('grid-cols-4')
    })
  })

  it('has proper loading animation', () => {
    render(<TableLoading />)
    const container = document.querySelector('.animate-pulse')
    expect(container).toBeInTheDocument()
  })
})