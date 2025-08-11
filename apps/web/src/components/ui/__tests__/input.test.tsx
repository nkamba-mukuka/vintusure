import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input Component', () => {
  const user = userEvent.setup()

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('flex', 'h-9', 'w-full')
    })

    it('renders with different types', () => {
      const { rerender } = render(<Input type="email" placeholder="Email" />)
      expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email')

      rerender(<Input type="password" placeholder="Password" />)
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')

      rerender(<Input type="number" placeholder="Number" />)
      expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number')
    })

    it('renders with custom className', () => {
      render(<Input className="custom-input" placeholder="Custom" />)
      expect(screen.getByPlaceholderText('Custom')).toHaveClass('custom-input')
    })

    it('renders with disabled state', () => {
      render(<Input disabled placeholder="Disabled" />)
      const input = screen.getByPlaceholderText('Disabled')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('renders with read-only state', () => {
      render(<Input readOnly placeholder="Read only" />)
      const input = screen.getByPlaceholderText('Read only')
      expect(input).toHaveAttribute('readonly')
    })

    it('renders with required attribute', () => {
      render(<Input required placeholder="Required" />)
      expect(screen.getByPlaceholderText('Required')).toHaveAttribute('required')
    })
  })

  describe('Interactions', () => {
    it('handles text input', async () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      
      await user.type(input, 'Hello World')
      expect(input).toHaveValue('Hello World')
    })

    it('handles onChange events', async () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} placeholder="Enter text" />)
      
      await user.type(screen.getByPlaceholderText('Enter text'), 'test')
      expect(handleChange).toHaveBeenCalled()
    })

    it('handles onFocus events', async () => {
      const handleFocus = vi.fn()
      render(<Input onFocus={handleFocus} placeholder="Enter text" />)
      
      await user.click(screen.getByPlaceholderText('Enter text'))
      expect(handleFocus).toHaveBeenCalled()
    })

    it('handles onBlur events', async () => {
      const handleBlur = vi.fn()
      render(<Input onBlur={handleBlur} placeholder="Enter text" />)
      
      const input = screen.getByPlaceholderText('Enter text')
      await user.click(input)
      await user.tab()
      expect(handleBlur).toHaveBeenCalled()
    })

    it('handles keyboard navigation', async () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      
      input.focus()
      expect(input).toHaveFocus()
      
      await user.keyboard('{Tab}')
      expect(input).not.toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Username" />)
      expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby="description" placeholder="Input" />
          <div id="description">Input description</div>
        </div>
      )
      const input = screen.getByPlaceholderText('Input')
      expect(input).toHaveAttribute('aria-describedby', 'description')
    })

    it('supports aria-invalid', () => {
      render(<Input aria-invalid="true" placeholder="Invalid input" />)
      expect(screen.getByPlaceholderText('Invalid input')).toHaveAttribute('aria-invalid', 'true')
    })

    it('supports aria-required', () => {
      render(<Input aria-required="true" placeholder="Required input" />)
      expect(screen.getByPlaceholderText('Required input')).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('Form Integration', () => {
    it('works with form labels', () => {
      render(
        <div>
          <label htmlFor="username">Username</label>
          <Input id="username" placeholder="Enter username" />
        </div>
      )
      const input = screen.getByLabelText('Username')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('id', 'username')
    })

    it('supports form validation', () => {
      render(
        <Input 
          placeholder="Email"
          type="email"
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          title="Please enter a valid email address"
        />
      )
      const input = screen.getByPlaceholderText('Email')
      expect(input).toHaveAttribute('pattern', '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$')
      expect(input).toHaveAttribute('title', 'Please enter a valid email address')
    })
  })

  describe('Error States', () => {
    it('renders with error styling', () => {
      render(<Input className="border-red-500" placeholder="Error input" />)
      const input = screen.getByPlaceholderText('Error input')
      expect(input).toHaveClass('border-red-500')
    })

    it('supports error message association', () => {
      render(
        <div>
          <Input aria-describedby="error-message" placeholder="Input with error" />
          <div id="error-message" role="alert">This field is required</div>
        </div>
      )
      const input = screen.getByPlaceholderText('Input with error')
      expect(input).toHaveAttribute('aria-describedby', 'error-message')
    })
  })

  describe('Size Variants', () => {
    it('renders with different sizes', () => {
      const { rerender } = render(<Input className="h-8" placeholder="Small" />)
      expect(screen.getByPlaceholderText('Small')).toHaveClass('h-8')

      rerender(<Input className="h-12" placeholder="Large" />)
      expect(screen.getByPlaceholderText('Large')).toHaveClass('h-12')
    })
  })

  describe('Value Control', () => {
    it('renders with controlled value', () => {
      render(<Input value="Controlled value" onChange={vi.fn()} />)
      expect(screen.getByDisplayValue('Controlled value')).toBeInTheDocument()
    })

    it('updates value when controlled', async () => {
      const handleChange = vi.fn()
      render(<Input value="Initial" onChange={handleChange} />)
      
      await user.clear(screen.getByDisplayValue('Initial'))
      await user.type(screen.getByRole('textbox'), 'New value')
      
      expect(handleChange).toHaveBeenCalled()
    })
  })
})
