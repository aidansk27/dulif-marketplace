import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  getDocs,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Chat, Message } from './types'

// Create or get existing chat for a listing
export const createOrGetChat = async (
  listingId: string,
  sellerId: string,
  buyerId: string
): Promise<string> => {
  // Check if chat already exists
  const chatsQuery = query(
    collection(db, 'chats'),
    where('listingId', '==', listingId),
    where('members', 'array-contains', buyerId)
  )
  
  const existingChats = await getDocs(chatsQuery)
  
  // Find chat that contains both users
  for (const chatDoc of existingChats.docs) {
    const chatData = chatDoc.data()
    if (chatData.members.includes(sellerId)) {
      return chatDoc.id
    }
  }
  
  // Create new chat if none exists
  const chatData: Omit<Chat, 'id'> = {
    listingId,
    members: [sellerId, buyerId],
    lastMessage: '',
    lastTime: serverTimestamp() as any,
    sellerId,
    buyerId,
  }
  
  const chatRef = await addDoc(collection(db, 'chats'), chatData)
  return chatRef.id
}

// Send a message
export const sendMessage = async (
  chatId: string,
  senderId: string,
  message: string
): Promise<void> => {
  const messageData: Omit<Message, 'id'> = {
    senderId,
    body: message.trim(),
    createdAt: serverTimestamp() as any,
    read: false,
  }
  
  // Add message to subcollection
  await addDoc(collection(db, 'chats', chatId, 'messages'), messageData)
  
  // Update chat's last message
  const chatRef = doc(db, 'chats', chatId)
  await updateDoc(chatRef, {
    lastMessage: message.trim(),
    lastTime: serverTimestamp(),
  })
}

// Listen to messages in a chat
export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesQuery = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100)
  )
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages: Message[] = []
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
      } as Message)
    })
    callback(messages)
  })
}

// Listen to user's chats
export const subscribeToUserChats = (
  userId: string,
  callback: (chats: Chat[]) => void
) => {
  const chatsQuery = query(
    collection(db, 'chats'),
    where('members', 'array-contains', userId),
    orderBy('lastTime', 'desc')
  )
  
  return onSnapshot(chatsQuery, (snapshot) => {
    const chats: Chat[] = []
    snapshot.forEach((doc) => {
      chats.push({
        id: doc.id,
        ...doc.data(),
      } as Chat)
    })
    callback(chats)
  })
}

// Mark messages as read
export const markMessagesAsRead = async (
  chatId: string,
  userId: string
): Promise<void> => {
  const messagesQuery = query(
    collection(db, 'chats', chatId, 'messages'),
    where('senderId', '!=', userId),
    where('read', '==', false)
  )
  
  const unreadMessages = await getDocs(messagesQuery)
  
  const updatePromises = unreadMessages.docs.map((messageDoc) =>
    updateDoc(messageDoc.ref, { read: true })
  )
  
  await Promise.all(updatePromises)
}