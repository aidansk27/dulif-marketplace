'use client'

import { useState, useEffect } from 'react'

interface UseTypingAnimationOptions {
  words: string[]
  typeSpeed?: number
  deleteSpeed?: number
  delayBetweenWords?: number
}

export const useTypingAnimation = ({
  words,
  typeSpeed = 150,
  deleteSpeed = 75,
  delayBetweenWords = 2000,
}: UseTypingAnimationOptions) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (words.length === 0) return

    const currentWord = words[currentWordIndex]

    const timeout = setTimeout(() => {
      if (isPaused) {
        setIsPaused(false)
        setIsDeleting(true)
        return
      }

      if (isDeleting) {
        // Deleting characters
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1))
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false)
          setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length)
        }
      } else {
        // Typing characters
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.slice(0, currentText.length + 1))
        } else {
          // Finished typing, pause before deleting
          setIsPaused(true)
        }
      }
    }, isPaused ? delayBetweenWords : isDeleting ? deleteSpeed : typeSpeed)

    return () => clearTimeout(timeout)
  }, [
    currentText,
    currentWordIndex,
    isDeleting,
    isPaused,
    words,
    typeSpeed,
    deleteSpeed,
    delayBetweenWords,
  ])

  return currentText
}