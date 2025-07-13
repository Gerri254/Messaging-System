# Socket.io Real-time Features Guide

## Overview

The messaging system includes comprehensive real-time functionality using Socket.io, enabling live updates for message status, delivery notifications, analytics, and system notifications.

## Features

### 🔐 Authenticated Connections
- JWT-based authentication for Socket.io connections
- Automatic user room assignment
- Connection state management

### 📨 Real-time Message Updates
- Live message status updates (sending, sent, failed)
- Individual recipient delivery status
- Cost tracking and success/failure counts

### 📊 Live Analytics
- Real-time dashboard statistics
- Message metrics updates
- Usage statistics broadcasting

### 🔔 Notifications System
- System notifications
- Message delivery notifications
- Custom user notifications

### 📡 Connection Management
- Online user tracking
- Connection statistics
- Health monitoring

## Client Events (Emit)

### Authentication & Connection
```javascript
// Connect with JWT token
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});
```

### Room Management
```javascript
// Join a room
socket.emit('join_room', 'room_name');

// Leave a room
socket.emit('leave_room', 'room_name');
```

### Analytics Subscription
```javascript
// Subscribe to analytics updates
socket.emit('subscribe_analytics');

// Unsubscribe from analytics
socket.emit('unsubscribe_analytics');
```

### Message Tracking
```javascript
// Track specific message updates
socket.emit('track_message', 'message_id');

// Stop tracking message
socket.emit('untrack_message', 'message_id');
```

### Notifications
```javascript
// Mark notification as read
socket.emit('mark_notification_read', 'notification_id');
```

## Server Events (Listen)

### Connection Events
```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

### Message Updates
```javascript
// Listen for message status updates
socket.on('message_update', (data) => {
  console.log('Message update:', data);
  // {
  //   messageId: string,
  //   status: 'SENDING' | 'SENT' | 'FAILED',
  //   successCount?: number,
  //   failedCount?: number,
  //   cost?: number
  // }
});

// Listen for recipient status updates
socket.on('recipient_update', (data) => {
  console.log('Recipient update:', data);
  // {
  //   messageId: string,
  //   recipientId: string,
  //   phone: string,
  //   status: 'PENDING' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED',
  //   errorMessage?: string
  // }
});
```

### Notifications
```javascript
// Listen for notifications
socket.on('notification', (notification) => {
  console.log('Notification:', notification);
  // {
  //   id: string,
  //   type: 'message_sent' | 'message_failed' | 'delivery_update' | 'system' | 'warning',
  //   title: string,
  //   message: string,
  //   data?: any,
  //   timestamp: Date,
  //   read: boolean
  // }
});
```

### Analytics Updates
```javascript
// Listen for analytics updates
socket.on('analytics_update', (data) => {
  console.log('Analytics update:', data);
  // {
  //   type: 'dashboard_stats' | 'message_stats' | 'usage_stats',
  //   data: any
  // }
});

// Listen for global analytics (admin feature)
socket.on('global_analytics_update', (data) => {
  console.log('Global analytics:', data);
});
```

### System Events
```javascript
// Health check ping
socket.on('ping', (data) => {
  console.log('Ping received:', data);
  // Respond with pong
  socket.emit('pong', { timestamp: new Date().toISOString() });
});
```

## REST API Endpoints

### Connection Management
```http
GET /api/socket/stats
# Get Socket.io connection statistics

GET /api/socket/user/:userId/online
# Check if a user is online

GET /api/socket/online-count
# Get total online users count
```

### Notifications
```http
POST /api/socket/notify/:userId
Content-Type: application/json
{
  "title": "Test Notification",
  "message": "This is a test message",
  "type": "system"
}
# Send notification to specific user

POST /api/socket/broadcast
Content-Type: application/json
{
  "title": "System Announcement",
  "message": "System maintenance in 30 minutes",
  "type": "warning"
}
# Broadcast system notification to all users
```

### Health Check
```http
POST /api/socket/ping
# Send ping to all connected clients
```

## Integration Examples

### React Hook for Socket.io
```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const sendMessage = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  return {
    socket,
    connected,
    notifications,
    sendMessage
  };
};
```

### Message Tracking Component
```javascript
import React, { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

const MessageTracker = ({ messageId, token }) => {
  const { socket, connected } = useSocket(token);
  const [messageStatus, setMessageStatus] = useState(null);
  const [recipients, setRecipients] = useState([]);

  useEffect(() => {
    if (connected && messageId) {
      // Start tracking message
      socket.emit('track_message', messageId);

      // Listen for updates
      const handleMessageUpdate = (data) => {
        if (data.messageId === messageId) {
          setMessageStatus(data);
        }
      };

      const handleRecipientUpdate = (data) => {
        if (data.messageId === messageId) {
          setRecipients(prev => {
            const updated = [...prev];
            const index = updated.findIndex(r => r.recipientId === data.recipientId);
            if (index >= 0) {
              updated[index] = data;
            } else {
              updated.push(data);
            }
            return updated;
          });
        }
      };

      socket.on('message_update', handleMessageUpdate);
      socket.on('recipient_update', handleRecipientUpdate);

      return () => {
        socket.emit('untrack_message', messageId);
        socket.off('message_update', handleMessageUpdate);
        socket.off('recipient_update', handleRecipientUpdate);
      };
    }
  }, [connected, messageId, socket]);

  return (
    <div>
      <h3>Message Status: {messageStatus?.status || 'Unknown'}</h3>
      <p>Success: {messageStatus?.successCount || 0}</p>
      <p>Failed: {messageStatus?.failedCount || 0}</p>
      <p>Cost: ${messageStatus?.cost || 0}</p>
      
      <h4>Recipients:</h4>
      {recipients.map(recipient => (
        <div key={recipient.recipientId}>
          {recipient.phone}: {recipient.status}
          {recipient.errorMessage && <span> - {recipient.errorMessage}</span>}
        </div>
      ))}
    </div>
  );
};
```

## Security Considerations

1. **Authentication**: All Socket.io connections require valid JWT tokens
2. **User Isolation**: Users can only receive updates for their own data
3. **Rate Limiting**: Consider implementing rate limiting for socket events
4. **Room Access**: Users are automatically assigned to appropriate rooms based on their ID

## Performance Notes

1. **Connection Pooling**: The service tracks active connections efficiently
2. **Selective Broadcasting**: Updates are sent only to relevant users/rooms
3. **Memory Management**: Connections are cleaned up on disconnect
4. **Batch Updates**: Analytics updates are batched to prevent spam

## Testing

Use the provided test client (`testSocket.html`) to:
1. Test authentication
2. Verify real-time message updates
3. Check notification delivery
4. Monitor analytics updates
5. Test connection management

## Troubleshooting

### Common Issues:
1. **Connection Refused**: Check if server is running and JWT token is valid
2. **No Updates**: Verify user is in correct room and has proper permissions
3. **Memory Leaks**: Ensure proper cleanup of event listeners
4. **CORS Issues**: Verify Socket.io CORS configuration matches frontend domain

### Debug Commands:
```javascript
// Check connection status
console.log('Connected:', socket.connected);

// Monitor all events
socket.onAny((event, ...args) => {
  console.log('Event:', event, args);
});

// Check rooms
socket.emit('get_rooms', (rooms) => {
  console.log('Current rooms:', rooms);
});
```