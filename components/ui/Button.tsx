import { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-primary-700 text-white hover:from-primary-600 hover:to-primary-800 shadow-xl shadow-primary/25 border border-primary-600/20',
    secondary: 'bg-gradient-to-r from-secondary to-secondary-600 text-primary hover:from-secondary-600 hover:to-amber-500 shadow-xl shadow-secondary/25 border border-secondary-600/20',
    outline: 'border-2 border-primary text-primary hover:bg-gradient-to-r hover:from-primary hover:to-primary-700 hover:text-white hover:border-primary-600 hover:shadow-lg hover:shadow-primary/20',
    ghost: 'text-primary hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-800'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  )
}