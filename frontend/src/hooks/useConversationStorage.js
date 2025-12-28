import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'pretty-code-conversations'
const CURRENT_KEY = 'pretty-code-current'
const MAX_CONVERSATIONS = 20

export function useConversationStorage() {
  const [conversations, setConversations] = useState([])
  const [currentId, setCurrentId] = useState(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setConversations(JSON.parse(stored))
      }
      const current = localStorage.getItem(CURRENT_KEY)
      if (current) {
        setCurrentId(current)
      }
    } catch (e) {
      console.error('Failed to load conversations:', e)
    }
  }, [])

  // Save to localStorage when conversations change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch (e) {
      console.error('Failed to save conversations:', e)
    }
  }, [conversations])

  // Save current ID
  useEffect(() => {
    if (currentId) {
      localStorage.setItem(CURRENT_KEY, currentId)
    }
  }, [currentId])

  const saveConversation = useCallback((messages, title = null) => {
    const id = currentId || Date.now().toString()
    const autoTitle = title || generateTitle(messages)

    setConversations((prev) => {
      const existing = prev.findIndex((c) => c.id === id)
      const updated = {
        id,
        title: autoTitle,
        messages,
        updatedAt: new Date().toISOString(),
      }

      if (existing >= 0) {
        const newList = [...prev]
        newList[existing] = updated
        return newList
      }

      // Add new conversation, keeping max limit
      const newList = [updated, ...prev].slice(0, MAX_CONVERSATIONS)
      return newList
    })

    setCurrentId(id)
    return id
  }, [currentId])

  const loadConversation = useCallback((id) => {
    const conv = conversations.find((c) => c.id === id)
    if (conv) {
      setCurrentId(id)
      return conv.messages
    }
    return null
  }, [conversations])

  const newConversation = useCallback(() => {
    setCurrentId(null)
    return []
  }, [])

  const deleteConversation = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (currentId === id) {
      setCurrentId(null)
    }
  }, [currentId])

  const renameConversation = useCallback((id, title) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    )
  }, [])

  return {
    conversations,
    currentId,
    saveConversation,
    loadConversation,
    newConversation,
    deleteConversation,
    renameConversation,
  }
}

function generateTitle(messages) {
  // Use first user message as title
  const firstUser = messages.find((m) => m.role === 'user')
  if (firstUser) {
    const title = firstUser.content.slice(0, 50)
    return title.length < firstUser.content.length ? title + '...' : title
  }
  return 'New conversation'
}
