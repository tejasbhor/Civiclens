import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    // Partial class match to verify default variant and size
    expect(button.className).toContain('bg-primary-600');
    expect(button.className).toContain('px-4 py-2');
    expect(button).not.toBeDisabled();
  });

  describe('Variants', () => {
    const variants = [
      { name: 'primary', expectedClass: 'bg-primary-600' },
      { name: 'secondary', expectedClass: 'bg-white' },
      { name: 'outline', expectedClass: 'bg-transparent text-primary-600 border-primary-600' },
      { name: 'ghost', expectedClass: 'bg-transparent text-gray-700' },
      { name: 'danger', expectedClass: 'bg-red-600' },
      { name: 'success', expectedClass: 'bg-green-600' },
    ] as const;

    variants.forEach(({ name, expectedClass }) => {
      it(`renders ${name} variant correctly`, () => {
        render(<Button variant={name}>{name}</Button>);
        const button = screen.getByRole('button', { name });
        // checking if className contains expected classes
        const classes = expectedClass.split(' ');
        classes.forEach(c => {
             expect(button.className).toContain(c);
        });
      });
    });
  });

  describe('Sizes', () => {
    const sizes = [
      { name: 'sm', expectedClass: 'px-3 py-1.5' },
      { name: 'md', expectedClass: 'px-4 py-2' },
      { name: 'lg', expectedClass: 'px-6 py-3' },
    ] as const;

    sizes.forEach(({ name, expectedClass }) => {
      it(`renders ${name} size correctly`, () => {
        render(<Button size={name}>{name}</Button>);
        const button = screen.getByRole('button', { name });
        expect(button.className).toContain(expectedClass);
      });
    });
  });

  it('renders loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    // Check for loader icon
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin');
  });

  it('renders icon correctly', () => {
    render(<Button icon={<span data-testid="test-icon">icon</span>}>With Icon</Button>);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole('button', { name: /full width/i });
    expect(button).toHaveClass('w-full');
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button.className).toContain('disabled:opacity-50');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not handle click events when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not handle click events when loading', () => {
    const handleClick = jest.fn();
    render(<Button loading onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('passes through additional props', () => {
    render(<Button type="submit" aria-label="Submit Form">Submit</Button>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Submit Form');
  });
});
