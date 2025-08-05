'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseCountdownReturn {
  timeLeft: number
  isActive: boolean
  start: (seconds: number) => void
  stop: () => void
  reset: () => void
}

export const useCountdown = (initialSeconds: number = 60): UseCountdownReturn => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(false)

  const start = useCallback((seconds: number = initialSeconds) => {
    setTimeLeft(seconds)
    setIsActive(true)
  }, [initialSeconds])

  const stop = useCallback(() => {
    setIsActive(false)
  }, [])

  const reset = useCallback(() => {
    setTimeLeft(initialSeconds)
    setIsActive(false)
  }, [initialSeconds])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsActive(false)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  return { timeLeft, isActive, start, stop, reset }
}