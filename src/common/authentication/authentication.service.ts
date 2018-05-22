import { Component } from '@nestjs/common';

@Component()
export class AuthenticationService {

    async check(user: any): Promise<any> {
        return user;
    }

    async logIn(): Promise<any> {
        return null;
    }

    async logOut(): Promise<any> {
        return null;
    }
}