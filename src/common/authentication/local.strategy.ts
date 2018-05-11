import {Component, UnauthorizedException} from '@nestjs/common';
import { Strategy } from 'passport-local';
import * as passport from 'passport';
import { LDAPAuthenticationService } from './ldap.service';

@Component()
export class AuthenticationStrategy extends Strategy {
    constructor(private readonly ldapAuthenticationService: LDAPAuthenticationService) {
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

    async signInUser(username, password, done: (error, user, info?) => void): Promise<any> {
        try {
            const user = await this.ldapAuthenticationService.logIn(username, password);
            if (user) return done(null, user);
            if (!user) return done(null, false);
        } catch (err) {
            return done(err, false, {message: 'fuck'});
            //throw new UnauthorizedException(err);
        }
        // return done(null, user);
        // return done(null, {id: 10, firstName: 'Willy', lastName: 'Wonka', position: 'Handjobber1'});
        // return done(null, false, {message: 'fuck off'});
    }

    serializeUser(user, done: (error, user) => void): void {
        try {
            done(null, user);
        } catch (error) {
            done(error, false);
        }
    }

    async deserializeUser(id: number, callback: (error, user) => void): Promise<void> {
        callback(null, {id: 10, firstName: 'Willy', lastName: 'Wonka', position: 'Handjobber2'});
    }
}