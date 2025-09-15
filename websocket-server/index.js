const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Store connected clients by room
const rooms = new Map();

// WebSocket connection handling
wss.on('connection', (ws, request) => {
  console.log('New WebSocket connection');
  
  // Extract room code from URL query parameters
  const url = new URL(request.url, `http://${request.headers.host}`);
  const code = url.searchParams.get('code');
  const userId = url.searchParams.get('userId');
  
  if (!code || !userId) {
    ws.close(1008, 'Room code and user ID required');
    return;
  }
  
  // Add client to room
  if (!rooms.has(code)) {
    rooms.set(code, new Map());
  }
  
  rooms.get(code).set(userId, ws);
  console.log(`User ${userId} joined room ${code}`);
  
  // Send current room state to the new client
  sendRoomState(code, ws);
  
  // Broadcast to other clients in the room that a new user joined
  broadcastToRoom(code, userId, {
    type: 'participant_joined',
    userId: userId,
    code: code,
    timestamp: new Date().toISOString()
  });
  
  // Handle messages from client
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleMessage(code, userId, message);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  // Handle client disconnection
  ws.on('close', () => {
    if (rooms.has(code)) {
      rooms.get(code).delete(userId);
      console.log(`User ${userId} left room ${code}`);
      
      // Broadcast to other clients that user left
      broadcastToRoom(code, userId, {
        type: 'participant_left',
        userId: userId,
        code: code,
        timestamp: new Date().toISOString()
      });
      
      // Clean up empty rooms
      if (rooms.get(code).size === 0) {
        rooms.delete(code);
      }
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Function to send current room state to a client
async function sendRoomState(code, ws) {
  try {
    // Get room data from database
    const roomResult = await pool.query(
      'SELECT * FROM rooms WHERE room_key = $1',
      [code]
    );
    
    if (roomResult.rows.length === 0) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Room not found'
      }));
      return;
    }
    
    const room = roomResult.rows[0];
    
    // Get participants from database
    const participantsResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.college 
       FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1`,
      [room.id]
    );
    
    const participants = participantsResult.rows;
    
    // Send room state to client
    ws.send(JSON.stringify({
      type: 'room_state',
      room: room,
      participants: participants,
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Error sending room state:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to load room data'
    }));
  }
}

// Function to broadcast message to all clients in a room except sender
function broadcastToRoom(code, excludeUserId, message) {
  if (rooms.has(code)) {
    const roomClients = rooms.get(code);
    roomClients.forEach((client, userId) => {
      if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

// Handle different message types
function handleMessage(code, userId, message) {
  switch (message.type) {
    case 'start_game':
      handleStartGame(code, userId, message);
      break;
    case 'typing_progress':
      handleTypingProgress(code, userId, message);
      break;
    case 'game_completed':
      handleGameCompleted(code, userId, message);
      break;
    default:
      console.log('Unknown message type:', message.type);
  }
}

// Handle game start
async function handleStartGame(code, userId, message) {
  try {
    // Verify user is the room host
    const roomResult = await pool.query(
      'SELECT created_by FROM rooms WHERE room_key = $1',
      [code]
    );
    
    if (roomResult.rows.length === 0 || roomResult.rows[0].created_by !== userId) {
      console.log('User is not the room host');
      return;
    }
    
    // Update room status in database
    await pool.query(
      'UPDATE rooms SET status = $1 WHERE room_key = $2',
      ['in-progress', code]
    );
    
    // Broadcast game start to all clients
    broadcastToRoom(code, userId, {
      type: 'game_started',
      code: code,
      timestamp: new Date().toISOString(),
      data: message.data || {}
    });
    
  } catch (error) {
    console.error('Error starting game:', error);
  }
}

// Handle typing progress updates
function handleTypingProgress(code, userId, message) {
  // Broadcast typing progress to other clients
  broadcastToRoom(code, userId, {
    type: 'typing_progress',
    userId: userId,
    code: code,
    timestamp: new Date().toISOString(),
    data: message.data
  });
}

// Handle game completion
async function handleGameCompleted(code, userId, message) {
  try {
    // Save game results to database
    const { wpm, accuracy, errors, time_taken, level } = message.data;
    
    await pool.query(
      `INSERT INTO results (room_id, user_id, wpm, accuracy, errors, time_taken, level, score)
       SELECT r.id, $1, $2, $3, $4, $5, $6, ($2 * $3) / 100
       FROM rooms r WHERE r.room_key = $7`,
      [userId, wpm, accuracy, errors, time_taken, level, code]
    );
    
    // Broadcast game completion
    broadcastToRoom(code, userId, {
      type: 'game_completed',
      userId: userId,
      code: code,
      timestamp: new Date().toISOString(),
      data: message.data
    });
    
  } catch (error) {
    console.error('Error saving game results:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get room info endpoint
app.get('/api/room/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const roomResult = await pool.query(
      'SELECT * FROM rooms WHERE room_key = $1',
      [code]
    );
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const participantsResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.college 
       FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1`,
      [roomResult.rows[0].id]
    );
    
    res.json({
      room: roomResult.rows[0],
      participants: participantsResult.rows
    });
    
  } catch (error) {
    console.error('Error getting room info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active rooms endpoint
app.get('/api/rooms/active', async (req, res) => {
  try {
    const roomsResult = await pool.query(
      `SELECT r.*, COUNT(rp.user_id) as participant_count
       FROM rooms r
       LEFT JOIN room_participants rp ON r.id = rp.room_id
       WHERE r.status = 'waiting'
       GROUP BY r.id
       ORDER BY r.created_at DESC`
    );
    
    res.json({ rooms: roomsResult.rows });
  } catch (error) {
    console.error('Error getting active rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});