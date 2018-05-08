import { Component } from '@nestjs/common';
import { TestException } from './exceptions/authentication.exception';

@Component()
export class AuthenticationService {

    async check(): Promise<any> {
        throw new TestException();
        //return 'nigga nigga nigga';
    }

    async logIn(): Promise<any> {
        return null;
    }

    async logOut(): Promise<any> {
        return null;
    }
}