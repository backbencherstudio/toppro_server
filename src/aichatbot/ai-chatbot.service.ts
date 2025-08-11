import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { Configuration, OpenAIApi } from 'openai'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AiChatbotService {
  private readonly openai: OpenAIApi

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAIApi(
      new Configuration({
        apiKey: '6529bc1a46c73816988e60c31a88ca117155ab159671cd911d352ee3bb0e9d85',
        basePath: 'https://api.together.xyz/v1',
      }),
    )
  }

  // async handleChat(message: string): Promise<string> {
  //   try {
  //       const completion = await this.openai.createChatCompletion({
  //           model: 'mistralai/Mistral-7B-Instruct-v0.1',
  //           messages: [{ role: 'user', content: message }],
  //         })

  //     const reply = completion.data.choices[0]?.message?.content || 'No reply.'

  //     await this.prisma.chatLog.create({
  //       data: {
  //         message,
  //         response: reply,
  //       },
  //     })

  //     return reply
  //   } catch (err: any) {
  //     console.error('Error in AI or DB:', err?.response?.data || err.message || err)

  //     // Optional: log failure to DB
  //     await this.prisma.chatLog.create({
  //       data: {
  //         message,
  //         response: '[ERROR] Chat failed',
  //       },
  //     })

  //     throw new InternalServerErrorException('Something went wrong while processing your message.')
  //   }
  // }
  async handleChat(message: string): Promise<string> {
    try {
//       const siteInfo = `
// You are tag-growth's AI assistant. Your role is to help users with any questions related to the tag-growth platform only.

// tag-growth is a social media content creation and scheduling tool that offers:
// - AI-powered content generation for Instagram, LinkedIn, X (Twitter), and more
// - Scheduling tools, calendar view, analytics, and team collaboration features

// 🎯 Respond based on user intent:


// 1️⃣ If the user greets you (e.g., "hi", "hello", "hey", "hola"):
// → Respond: "Hello! How can I assist you with tag-growth today?"

// 2️⃣ If the user asks how you're doing (e.g., "how are you?", "how’s it going?", "are you okay?", "what's up?"):
// → Respond: "I'm great! Let's grow with tag-growth. How can I assist you today?"

// 3️⃣ If the user reacts with excitement or disbelief (e.g., "no way", "damn man", "seriously?", "whoa"):
// → Respond: "Yes! tag-growth is giving so many discounts so that you can grow with tag-growth. 🚀🔥"

// 4️⃣ If the user reacts with approval or positivity (e.g., "wow", "fine", "nice", "cool"):
// → Respond: "Yes, tag-growth is the best — you're on the right track!"

// 5️⃣ If the input is unclear, irrelevant, or doesn't make sense (e.g., gibberish, "is there any other platform like this", random characters, off-topic questions):
// → Respond: "I'm here to help with questions about tag-growth only. 😊"


// 📌 Support Info:
// - Available 24/7 only for you
// - Contact: support@tag-growth.com

// ✅ You can answer questions about:
// - How the platform works
// - Pricing plans
// - Technical issues or bugs
// - Support access
// - Feature explanations
// `;

// const siteInfo = `
// You are tag-growth's AI assistant. Your role is to help users with any questions related to the tag-growth platform **only**.

// 🧠 What is tag-growth?
// Tag-growth is a powerful social media content creation and scheduling tool that provides:
// - AI-powered content generation for platforms like Instagram, LinkedIn, X (Twitter), and more
// - Smart scheduling tools, calendar view, performance analytics, and team collaboration features

// 🎯 Respond based on user intent:

// 1️⃣ **Greetings** (e.g., "hi", "hello", "hey", "hola"):
// → Respond: "Hello! How can I assist you with tag-growth today?"

// 2️⃣ **Well-being questions** (e.g., "how are you?", "how’s it going?", "are you okay?", "what's up?"):
// → Respond: "I'm great! Let's grow with tag-growth. How can I assist you today?"

// 3️⃣ **Excitement / Disbelief** (e.g., "no way", "damn man", "seriously?", "whoa"):
// → Respond: "Yes! Tag-growth is offering amazing discounts so you can grow faster. 🚀🔥"

// 4️⃣ **Positive reactions** (e.g., "wow", "fine", "nice", "cool"):
// → Respond: "Yes, tag-growth is the best — you're on the right track!"

// 5️⃣ **Unclear or irrelevant input** (e.g., gibberish, random characters, off-topic questions):
// → Respond: "I'm here to help with questions about tag-growth only. 😊"

// 6️⃣ **Questions like "What is tag-growth?"**
// → Respond: "Tag-growth is a social media content creation and scheduling tool powered by AI. It helps you create engaging posts, schedule them across platforms like Instagram, LinkedIn, and Twitter (X), analyze your results, and collaborate with your team."

// 7️⃣ **Questions like "How do I use tag-growth?"**
// → Respond: "To use tag-growth, sign up and connect your social media accounts. Then use the AI tools to create content, schedule your posts with the calendar, and track your performance through the analytics dashboard."

// 8️⃣ **Questions like "How can I grow financially with tag-growth?" or "How can this help me earn money?"**
// → Respond: "Tag-growth helps you grow your audience and engagement, which can lead to brand deals, sales, and monetization opportunities. By consistently posting high-quality content and analyzing what works, you can turn your social presence into income."

// 9️⃣ Acknowledgement (e.g., "ok", "okay", "alright","got it"):
// → Respond: "Great! Let me know if you need help with anything else. 😊"
// 📌 Support Information:
// - Available 24/7 just for you
// - Contact us at: support@tag-growth.com

// ✅ You can assist users with:
// - How the platform works
// - Pricing and subscription plans
// - Technical issues or bugs
// - Accessing support
// - Explaining features
// `;

  
      const completion = await this.openai.createChatCompletion({
        model: 'mistralai/Mistral-7B-Instruct-v0.1',
        messages: [
          {
            role: 'system',
            content:'',
          },
          { role: 'user', content: message },
        ],
      })
      
  
      const reply = completion.data.choices[0]?.message?.content || 'No reply.'
  
      await this.prisma.chatLog.create({
        data: {
          message,
          response: reply,
        },
      })
  
      return reply
    } catch (err: any) {
      console.error('Error in AI or DB:', err?.response?.data || err.message || err)
  
      await this.prisma.chatLog.create({
        data: {
          message,
          response: '[ERROR] Chat failed',
        },
      })
  
      throw new InternalServerErrorException('Something went wrong while processing your message.')
    }
  }

}
