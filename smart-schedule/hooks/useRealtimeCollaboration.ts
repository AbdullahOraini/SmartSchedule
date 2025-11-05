'use client'
import { useEffect, useState, useRef } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

interface UseRealtimeCollaborationOptions {
  roomId: string
  userId: string
  userName: string
  onConnected?: () => void
  onDisconnected?: () => void
  onUserJoined?: (user: { name: string; id: string }) => void
  onUserLeft?: (user: { name: string; id: string }) => void
}

export function useRealtimeCollaboration(options: UseRealtimeCollaborationOptions) {
  const {
    roomId,
    userId,
    userName,
    onConnected,
    onDisconnected,
    onUserJoined,
    onUserLeft,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [collaborators, setCollaborators] = useState<Array<{ name: string; id: string }>>([])
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)

  useEffect(() => {
    // Initialize Yjs document
    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    // Connect to WebSocket server
    // Use port 3002 for WebSocket (different from HTTP server on 3001)
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002'
    const provider = new WebsocketProvider(wsUrl, roomId, ydoc, {
      params: { userId, userName },
      // WebSocket configuration
      WebSocketPolyfill: typeof WebSocket !== 'undefined' ? WebSocket : undefined,
    })

    providerRef.current = provider

    // Handle connection events
    provider.on('status', (event: { status: string }) => {
      if (event.status === 'connected') {
        setIsConnected(true)
        onConnected?.()
      } else if (event.status === 'disconnected') {
        setIsConnected(false)
        onDisconnected?.()
      }
    })

    // Handle awareness (user presence)
    const awareness = provider.awareness
    awareness.setLocalStateField('user', {
      name: userName,
      id: userId,
    })

    awareness.on('change', () => {
      const states = Array.from(awareness.getStates().values())
      const users = states
        .map(state => state.user)
        .filter(Boolean) as Array<{ name: string; id: string }>
      setCollaborators(users)
    })

    // Handle user join/leave
    awareness.on('update', ({ added, removed }: { added: number[]; removed: number[] }) => {
      added.forEach(clientID => {
        const state = awareness.getStates().get(clientID)
        if (state?.user && clientID !== awareness.clientID) {
          onUserJoined?.(state.user)
        }
      })

      removed.forEach(clientID => {
        const state = awareness.getStates().get(clientID)
        if (state?.user) {
          onUserLeft?.(state.user)
        }
      })
    })

    // Cleanup
    return () => {
      awareness.destroy()
      provider.destroy()
      ydoc.destroy()
    }
  }, [roomId, userId, userName, onConnected, onDisconnected, onUserJoined, onUserLeft])

  // Get shared Yjs types
  const getSharedType = <T extends Y.AbstractType<any>>(name: string): T => {
    if (!ydocRef.current) {
      throw new Error('Yjs document not initialized')
    }
    return ydocRef.current.get(name, Y.Map) as unknown as T
  }

  const getSharedArray = <T>(name: string): Y.Array<T> => {
    if (!ydocRef.current) {
      throw new Error('Yjs document not initialized')
    }
    return ydocRef.current.getArray<T>(name)
  }

  const getSharedText = (name: string): Y.Text => {
    if (!ydocRef.current) {
      throw new Error('Yjs document not initialized')
    }
    return ydocRef.current.getText(name)
  }

  return {
    isConnected,
    collaborators,
    ydoc: ydocRef.current,
    provider: providerRef.current,
    getSharedType,
    getSharedArray,
    getSharedText,
  }
}

