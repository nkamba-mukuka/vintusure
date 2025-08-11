import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button Component', () => {
  const user = userEvent.setup()

  describe('Rendering', () => {
    it('renders with default variant and size', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
    })

    it('renders with different variants', () => {
      const { rerender } = render(<Button variant="destructive">Delete</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-destructive')

      rerender(<Button variant="outline">Outline</Button>)
      expect(screen.getByRole('button')).toHaveClass('border', 'border-input')

      rerender(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-secondary')

      rerender(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')
    })

    it('renders with different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-9', 'px-3')

      rerender(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-11', 'px-8')

      rerender(<Button size="icon">Icon</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-10', 'w-10')
    })

    it('renders as disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    it('renders with custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })
  })

  describe('Interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} disabled>Disabled</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('handles keyboard interactions', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Button aria-label="Custom label">Button</Button>)
      expect(screen.getByRole('button', { name: /custom label/i })).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <div>
          <Button aria-describedby="description">Button</Button>
          <div id="description">Button description</div>
        </div>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'description')
    })

    it('supports aria-expanded for toggle buttons', () => {
      render(<Button aria-expanded="true">Toggle</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    })

    it('supports aria-pressed for toggle buttons', () => {
      render(<Button aria-pressed="true">Toggle</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('Icon Button', () => {
    it('renders icon button correctly', () => {
      render(
        <Button size="icon" aria-label="Settings">
          <span>⚙️</span>
        </Button>
      )
      const button = screen.getByRole('button', { name: /settings/i })
      expect(button).toHaveClass('h-10', 'w-10')
      expect(button).toHaveAttribute('aria-label', 'Settings')
    })
  })

  describe('Loading State', () => {
    it('shows loading state when disabled prop is true', () => {
      render(<Button disabled>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })
  })

  describe('Form Integration', () => {
    it('works as form submit button', () => {
      render(
        <form onSubmit={vi.fn()}>
          <Button type="submit">Submit</Button>
        </form>
      )
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('works as form reset button', () => {
      render(
        <form>
          <Button type="reset">Reset</Button>
        </form>
      )
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')
    })
  })
})
