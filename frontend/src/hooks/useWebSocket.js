import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = 'ws://localhost:8000/ws'

export function useWebSocket() {
  const [status, setStatus] = useState('disconnected') // disconnected, connecting, connected
  const [isStreaming, setIsStreaming] = useState(false)
  const wsRef = useRef(null)
  const onMessageRef = useRef(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setStatus('connecting')
    const ws = new WebSocket(WS_URL)

    ws.onopen = () => {
      setStatus('connected')
    }

    ws.onclose = () => {
      setStatus('disconnected')
      setIsStreaming(false)
      // Auto-reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current === ws) {
          connect()
        }
      }, 3000)
    }

    ws.onerror = () => {
      setStatus('disconnected')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (onMessageRef.current) {
          onMessageRef.current(data)
        }

        if (data.type === 'start') {
          setIsStreaming(true)
        } else if (data.type === 'complete' || data.type === 'error' || data.type === 'stopped') {
          setIsStreaming(false)
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e)
      }
    }

    wsRef.current = ws
  }, [])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const sendMessage = useCallback((content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content }))
      return true
    }
    return false
  }, [])

  const stopGeneration = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }))
    }
  }, [])

  const onMessage = useCallback((callback) => {
    onMessageRef.current = callback
  }, [])

  // Connect on mount
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    status,
    isStreaming,
    sendMessage,
    stopGeneration,
    onMessage,
    connect,
    disconnect,
  }
}
