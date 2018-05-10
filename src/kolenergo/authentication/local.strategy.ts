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
            async (username, password, done) => await this.signInUser(username, password, done),
        );
        passport.use(this);
        passport.serializeUser(this.serializeUser);
        passport.deserializeUser(this.deserializeUser);
    }

    async signInUser(username, password, done: (error, user) => void): Promise<any> {
        return done(null, {id: 10, firstName: 'Willy', lastName: 'Wonka', position: 'Handjobber1'});
        //return done(null, false, {message: 'fuck off'});
    }

    serializeUser(user, done: (error, user) => void): void {
        done(null, user.id);
    }

    async deserializeUser(id: number, callback: (error, user) => void): Promise<void> {
        callback(null, {id: 10, firstName: 'Willy', lastName: 'Wonka', position: 'Handjobber2'});
    }
}