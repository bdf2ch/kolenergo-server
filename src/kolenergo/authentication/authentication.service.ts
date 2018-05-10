import { Component } from '@nestjs/common';
import { TestException } from './exceptions/authentication.exception';
import {} from 'passport-local';
import {Req} from '@nestjs/common/utils/decorators/route-params.decorator';

@Component()
export class AuthenticationService {

    async check(user: any): Promise<any> {
        //throw new TestException();
        //return 'nigga nigga nigga';
        return user;
    }

    async logIn(): Promise<any> {
        return null;
    }

    async logOut(): Promise<any> {
        return null;
    }
}