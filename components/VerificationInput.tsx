'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface VerificationInputProps {
  length: number
  onComplete: (code: string) => void
  isLoading?: boolean
  error?: string
}

export const VerificationInput = ({ 
  length, 
  onComplete, 
  isLoading = false,
  error 
}: VerificationInputProps) => {
  const MotionInput = motion.input as React.ElementType
  const MotionP = motion.p as React.ElementType
  const [values, setValues] = useState<string[]>(new Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  useEffect(() => {
    // Clear inputs when error changes
    if (error) {
      setValues(new Array(length).fill(''))
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    }
  }, [error, length])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newValues = [...values]
    newValues[index] = value

    setValues(newValues)

    // Auto-advance to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if complete
    if (newValues.every(val => val !== '') && newValues.length === length) {
      onComplete(newValues.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current input
        const newValues = [...values]
        newValues[index] = ''
        setValues(newValues)
      }
    }
    
    // Handle paste
    if (e.key === 'Enter') {
      e.preventDefault()
      if (values.every(val => val !== '')) {
        onComplete(values.join(''))
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    if (pastedData) {
      const newValues = pastedData.split('').concat(new Array(length).fill('')).slice(0, length)
      setValues(newValues)
      
      // Focus last filled input or first empty one
      const nextIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[nextIndex]?.focus()

      // Check if complete
      if (pastedData.length === length) {
        onComplete(pastedData)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-3">
        {values.map((value, index) => (
          <MotionInput
            key={index}
            ref={(el: HTMLInputElement | null) => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={`
              w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 
              transition-all duration-200 focus:outline-none
              ${error 
                ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-600' 
                : 'border-border bg-card text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-muted'}
            `}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}
      </div>
      
      {error && (
        <MotionP
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-red-600 font-medium"
        >
          {error}
        </MotionP>
      )}
      
      <p className="text-center text-sm text-muted">
        Enter the 6-digit code sent to your email
      </p>
    </div>
  )
}