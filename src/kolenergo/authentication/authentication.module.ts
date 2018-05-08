import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';

@Module({
    imports: [],
    components: [AuthenticationService],
    controllers: [AuthenticationController],
    exports: [AuthenticationService],
})
export class AuthenticationModule {}