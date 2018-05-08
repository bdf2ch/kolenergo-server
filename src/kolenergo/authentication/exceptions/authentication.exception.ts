import {HttpException, HttpStatus} from '@nestjs/common';

export class TestException extends HttpException {
    constructor() {
        super('Forbidden', HttpStatus.FORBIDDEN);
    }
}