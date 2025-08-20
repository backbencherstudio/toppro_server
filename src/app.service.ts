import { Injectable } from '@nestjs/common';
import { SojebStorage } from './common/lib/Disk/SojebStorage';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello world ${process.env.APP_NAME ||"SET APP_NAME ENV"}`;
  }

  async test(image: Express.Multer.File) {
    try {
      const fileName = image.originalname;
      const fileType = image.mimetype;
      const fileSize = image.size;
      const fileBuffer = image.buffer;

      const result = await SojebStorage.put(fileName, fileBuffer);

      return {
        success: true,
        message: 'Image uploaded successfully',
        data: result,
        url: SojebStorage.url('tony1.jpg'),
      };
    } catch (error) {
      throw new Error(`Failed to upload image: ${error}`);
    }
  }

  // Professional Server Status Page
  getHtmlStatusPage(): string {
    return `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Status</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            height: 100vh;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            background: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') no-repeat center center;
            background-size: cover;
            font-family: 'Arial', sans-serif;
        }
        .status-message {
            color: white;
            font-size: 4rem;
            font-weight: bold;
            text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
            text-align: center;
            padding: 30px 50px;
            background-color: rgba(0, 0, 0, 0.7);
            border-radius: 10px;
            max-width: 80%;
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 150, 255, 0.5);
        }
 
        .status-message::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(90deg,
                transparent,
                rgba(0, 200, 255, 0.8),
                transparent);
            border-radius: 12px;
            z-index: -1;
            animation: borderAnimation 3s linear infinite;
            transform: translateX(-100%);
        }
 
        @keyframes borderAnimation {
            0% {
                transform: translateX(-100%) rotate(0deg);
            }
            100% {
                transform: translateX(100%) rotate(360deg);
            }
        }
 
        .status-message::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 2px solid rgba(0, 200, 255, 0.3);
            border-radius: 10px;
            animation: pulse 2s infinite ease-in-out;
        }
 
        @keyframes pulse {
            0%, 100% {
                border-color: rgba(0, 200, 255, 0.3);
                box-shadow: 0 0 10px rgba(59, 19, 3, 0.3);
            }
            50% {
                border-color: rgba(0, 200, 255, 0.8);
                box-shadow: 0 0 20px rgba(0, 200, 255, 0.8);
            }
        }
    </style>
</head>
<body>
    <div class="status-message">${process.env.APP_NAME || "SET APP_NAME ENV"} Server is Running</div>  
</body>
</html>
 
    `;
  }
}
