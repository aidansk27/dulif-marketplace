'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import { sendMessage, subscribeToMessages, markMessagesAsRead } from '@/lib/chat'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { LoadingSpinner } from './ui/LoadingSpinner'
import type { Message, User } from '@/lib/types'

interface ChatWindowProps {
  chatId: string
  otherUser: User
  listingTitle: string
  onClose?: () => void
}

export const ChatWindow = ({ chatId, otherUser, listingTitle, onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const MotionDiv = motion.div as any

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!chatId) return

    const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages)
      setLoading(false)
      scrollToBottom()
      
      // Mark messages as read
      if (user?.uid) {
        markMessagesAsRead(chatId, user.uid)
      }
    })

    return unsubscribe
  }, [chatId, user?.uid])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !user?.uid || sending) return

    setSending(true)
    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      await sendMessage(chatId, user.uid, messageText)
    } catch (error) {
      console.error('Failed to send message:', error)
      setNewMessage(messageText) // Restore message on error
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (timestamp: unknown) => {
    if (!timestamp) return ''
    
    try {
      const ts = timestamp as { toDate?: () => Date }
      const date = ts?.toDate ? ts.toDate() : new Date(timestamp as string | number | Date)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {otherUser.photoURL ? (
            <img
              src={otherUser.photoURL}
              alt={`${otherUser.firstName} ${otherUser.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {otherUser.firstName?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium">
              {otherUser.firstName} {otherUser.lastName}
            </h3>
            <p className="text-white/80 text-sm truncate max-w-48">
              Re: {listingTitle}
            </p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId === user?.uid
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId
            
            return (
              <MotionDiv
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                  isOwnMessage ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}>
                  {/* Avatar */}
                  <div className="w-6 h-6 flex-shrink-0">
                    {showAvatar && !isOwnMessage && (
                      otherUser.photoURL ? (
                        <img
                          src={otherUser.photoURL}
                          alt={otherUser.firstName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-600">
                            {otherUser.firstName?.charAt(0)}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  {/* Message */}
                  <div className={`px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <p className="text-sm">{message.body}</p>
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              </MotionDiv>
            )
          })}
        </AnimatePresence>
        
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No messages yet</p>
            <p className="text-sm text-gray-400">
              Start the conversation about &quot;{listingTitle}&quot;
            </p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={500}
              disabled={sending}
              className="border-0 bg-gray-100 focus:bg-white"
            />
          </div>
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            loading={sending}
            size="sm"
            className="px-3"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2">
          Keep conversations respectful and on-topic. Report any suspicious activity.
        </p>
      </div>
    </div>
  )
}