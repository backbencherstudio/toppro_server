import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import appConfig from 'src/config/app.config';

@Module({
  imports: [
    JwtModule.register({
      secret: appConfig().jwt.secret,
      signOptions: { expiresIn: appConfig().jwt.expiry },
    }),
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
