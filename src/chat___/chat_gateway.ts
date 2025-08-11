import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  interface ChatMessage {
    senderId: string;
    senderRole: 'admin' | 'user';
    receiverId?: string;
    message: string;
  }
  
  @WebSocketGateway({ cors: true })
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private clients = new Map<string, Socket>();
  
    handleConnection(client: Socket) {
      console.log(`🟢 Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      for (const [userId, socket] of this.clients.entries()) {
        if (socket.id === client.id) {
          this.clients.delete(userId);
          break;
        }
      }
      console.log(`🔴 Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('register')
    handleRegister(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
      this.clients.set(data.userId, client);
      console.log(`👤 User registered: ${data.userId}`);
    }
  
    @SubscribeMessage('chat')
    handleMessage(@MessageBody() data: ChatMessage, @ConnectedSocket() client: Socket) {
      const { senderId, senderRole, receiverId, message } = data;
  
      if (!this.clients.has(senderId)) {
        this.clients.set(senderId, client);
      }
  
      // Admin can message anyone (requires receiverId)
      if (senderRole === 'admin') {
        if (!receiverId) {
          return client.emit('error', 'Admin must specify a receiverId.');
        }
        const target = this.clients.get(receiverId);
        if (target) {
          target.emit('chat', {
            from: senderId,
            message,
          });
        }
      }
  
      // Regular user: can only message admin
      else {
        // Find an admin from connected clients (you may replace with fixed admin ID)
        const adminSocket = Array.from(this.clients.entries()).find(([id, _]) =>
          id.startsWith('admin_'), // mock role by ID naming
        )?.[1];
  
        if (!adminSocket) {
          return client.emit('error', 'No admin is currently online.');
        }
  
        adminSocket.emit('chat', {
          from: senderId,
          message,
        });
      }
  
      // Echo back to sender
      client.emit('messageSent', {
        to: receiverId || 'admin',
        message,
      });
    }
  }
  