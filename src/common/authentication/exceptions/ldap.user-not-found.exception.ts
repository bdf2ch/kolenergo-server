import { HttpException, HttpStatus } from '@nestjs/common';

export class LdapUserNotFoundException extends HttpException {
    constructor() {
        super('User not found', HttpStatus.UNAUTHORIZED);
    }
}