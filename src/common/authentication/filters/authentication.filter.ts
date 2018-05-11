import { ExceptionFilter, Catch } from '@nestjs/common';
import { HttpException, UnauthorizedException } from '@nestjs/common';

@Catch([HttpException, UnauthorizedException])
export class AuthenticationExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, response) {
        const status = exception.getStatus();
        response
            .status(status)
            .json({
                statusCode: status,
                message: `It's a message from the exception filter`,
            });
    }
}