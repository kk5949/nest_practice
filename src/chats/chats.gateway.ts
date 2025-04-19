import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  WebSocketServer, ConnectedSocket,
} from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Socket, Server } from "socket.io";
import { connect } from 'rxjs';

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection{
  @WebSocketServer()
  server: Server;
  constructor(private readonly chatsService: ChatsService) {}

  handleConnection(client: Socket, ...args: any[]): any {
    console.log(client.id);
  }

  @SubscribeMessage('enter_chat')
  enterChat(
    @MessageBody() data: number[],
    @ConnectedSocket() socket: Socket,
  ){
    for (const chatId of data) {
      socket.join(chatId.toString());
      // this.sendMessage({message: "뉴페이스 등장!", chatId: chatId}, socket);
    }ㅗ기
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() message: {"message": string, "chatId": number[]}, // DTO 로 대체
    @ConnectedSocket() socket: Socket,
  ) {
    for(const chatId of message.chatId) {
      socket.to(chatId.toString()).emit('receive_message', message.message);
    }
    // for(const chatId of message.chatId) {
    //   this.server.in(chatId.toString())
    //     .emit('receive_message', message.message);
    // }
  }
}
interface EmitEvents {
  receive_message: [string]; // 배열을 기대하는 경우
}
