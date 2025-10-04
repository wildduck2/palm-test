import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  path: '/ws', // must match your gateway config
  query: {
    userId: 'cli-user', // optional, your gateway supports runId/userId
  },
  transports: ['websocket'], // force websocket transport
})

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id)
})

socket.on('disconnect', () => {
  console.log('❌ Disconnected')
})

// Catch all events
socket.onAny((event, ...args) => {
  console.log('📡', event, args)
})

// Example: send event to server after 2s
setTimeout(() => {
  socket.emit('RunProgress', { id: '123', progress_percent: 42 })
}, 2000)
