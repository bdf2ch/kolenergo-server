import { Component } from '@nestjs/common';
import { Strategy } from 'passport-local';
import * as passport from 'passport';

@Component()
export class AuthenticationStrategy extends Strategy {
    constructor() {
        super(
            {
                usernameField: 'account',
                passwordField: 'password',
                session: true,
            },
            async (username, password, done) => await this.verifyUser(username, password, done),
        );
        passport.use(this);
        passport.serializeUser(this.serializeUser);
        passport.deserializeUser(this.deserializeUser);
    }

    async verifyUser(username, password, done): Promise<any> {
        return done(null, {id: 10, firstName: 'Willy', lastName: 'Wonka', position: 'Handjobber'});
        //return done(null, false, {message: 'fuck off'});
    }

    serializeUser(user, done): void {
        done(null, user.id);
    }

    async deserializeUser(id: number, callback: (error, user) => void): Promise<void> {
        callback(null, {id: 10, firstName: 'Willy', lastName: 'Wonka', position: 'Handjobber'});
    }
}