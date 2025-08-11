import { Controller, Post, Body } from '@nestjs/common'
import { AiChatbotService } from './ai-chatbot.service'

@Controller('/chat')
export class AiChatbotController {
  constructor(private readonly aiChatbotService: AiChatbotService) {}

  @Post()
  async chat(@Body('message') message: string) {
    return { response: await this.aiChatbotService.handleChat(message) }
  }
}
