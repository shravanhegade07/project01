import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('auction:join')
  handleJoinAuction(@ConnectedSocket() client: Socket, @MessageBody() data: { auctionId: string }) {
    client.join(`auction:${data.auctionId}`);
    return { event: 'joined', auctionId: data.auctionId };
  }

  @SubscribeMessage('auction:leave')
  handleLeaveAuction(@ConnectedSocket() client: Socket, @MessageBody() data: { auctionId: string }) {
    client.leave(`auction:${data.auctionId}`);
    return { event: 'left', auctionId: data.auctionId };
  }

  // Broadcast helper called by event consumers
  broadcastAuctionUpdate(auctionId: string, eventName: string, payload: unknown) {
    this.server.to(`auction:${auctionId}`).emit(eventName, payload);
  }
}
