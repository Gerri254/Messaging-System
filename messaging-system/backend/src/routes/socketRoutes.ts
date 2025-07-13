import { Router } from 'express';
import { socketService } from '../services/socketService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.use(authenticate);

// Get Socket.io connection statistics
router.get('/stats', (req: AuthRequest, res: Response) => {
  try {
    const stats = socketService.getConnectionStats();
    return res.status(200).json(stats);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Failed to get connection stats',
    });
  }
});

// Check if a user is online
router.get('/user/:userId/online', (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const isOnline = socketService.isUserOnline(userId);
    
    return res.status(200).json({ 
      userId, 
      isOnline,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Failed to check user status',
    });
  }
});

// Send a test notification to a user
router.post('/notify/:userId', (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { userId } = req.params;
    const { title, message, type = 'system' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ 
        error: 'Title and message are required' 
      });
    }

    // Only allow users to send notifications to themselves or if they're admin
    if (req.user.id !== userId) {
      return res.status(403).json({ 
        error: 'You can only send notifications to yourself' 
      });
    }

    socketService.sendNotificationToUser(userId, {
      id: `manual_${Date.now()}`,
      type: type as any,
      title,
      message,
      timestamp: new Date(),
      read: false,
    });

    return res.status(200).json({ 
      message: 'Notification sent successfully' 
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Failed to send notification',
    });
  }
});

// Broadcast a system notification to all users
router.post('/broadcast', (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, message, type = 'system' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ 
        error: 'Title and message are required' 
      });
    }

    // Note: In a real app, you'd want to check if user has admin privileges
    // For now, any authenticated user can broadcast (for demo purposes)

    socketService.broadcastSystemNotification({
      type: type as any,
      title,
      message,
      read: false,
    });

    return res.status(200).json({ 
      message: 'System notification broadcasted successfully' 
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Failed to broadcast notification',
    });
  }
});

// Ping all connected clients
router.post('/ping', (req: AuthRequest, res: Response) => {
  try {
    socketService.pingAllClients();
    
    return res.status(200).json({ 
      message: 'Ping sent to all clients',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Failed to ping clients',
    });
  }
});

// Get online users count
router.get('/online-count', (req: AuthRequest, res: Response) => {
  try {
    const count = socketService.getOnlineUsersCount();
    
    return res.status(200).json({ 
      onlineUsers: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Failed to get online count',
    });
  }
});

export default router;