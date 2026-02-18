import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('should render correctly', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should accept user input', async () => {
    const user = userEvent.setup()
    render(<Input data-testid="test-input" />)

    const input = screen.getByTestId('test-input')
    await user.type(input, 'Hello World')

    expect(input).toHaveValue('Hello World')
  })

  it('should call onChange when value changes', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)

    await user.type(screen.getByRole('textbox'), 'test')
    expect(handleChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should apply error styling when error prop is true', () => {
    render(<Input error="Invalid input" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-pulse-error')
  })

  it('should support different input types', () => {
    const { rerender } = render(<Input type="email" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password')

    rerender(<Input type="number" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number')
  })

  it('should support custom className', () => {
    render(<Input className="custom-input" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-input')
  })

  it('should support ref forwarding', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
