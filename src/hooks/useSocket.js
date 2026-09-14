import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

// Lazy singleton — one connection per browser tab
let socket = null;

function getSocket() {
  if (!socket) {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const url = import.meta.env.PROD
      ? window.location.origin          // same origin in production
      : 'http://localhost:5000';         // dev server

    socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.io] Connection error:', err.message);
    });
  }
  return socket;
}

/**
 * Custom React hook for Socket.io real-time events.
 *
 * Usage:
 *   const { joinBoard, leaveBoard, on, off } = useSocket();
 */
export function useSocket() {
  const currentBoard = useRef(null);

  // Join a board room
  const joinBoard = useCallback((boardId) => {
    const s = getSocket();
    if (!s) return;
    if (currentBoard.current) {
      s.emit('leave:board', currentBoard.current);
    }
    s.emit('join:board', boardId);
    currentBoard.current = boardId;
  }, []);

  // Leave a board room
  const leaveBoard = useCallback(() => {
    const s = getSocket();
    if (!s || !currentBoard.current) return;
    s.emit('leave:board', currentBoard.current);
    currentBoard.current = null;
  }, []);

  // Subscribe to an event
  const on = useCallback((event, callback) => {
    const s = getSocket();
    if (!s) return;
    s.on(event, callback);
  }, []);

  // Unsubscribe from an event
  const off = useCallback((event, callback) => {
    const s = getSocket();
    if (!s) return;
    s.off(event, callback);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentBoard.current) {
        const s = getSocket();
        if (s) s.emit('leave:board', currentBoard.current);
        currentBoard.current = null;
      }
    };
  }, []);

  return { joinBoard, leaveBoard, on, off };
}
