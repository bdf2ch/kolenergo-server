import { Component } from '@nestjs/common';
import { Strategy } from 'passport-local';
import * as passport from 'passport';
import { UsersService } from '../users/users.service';
import { LDAPService } from './ldap.service';
import { ILdapUser } from './interfaces/ldap-user.interface';

@Component()
export class AuthenticationStrategy extends Strategy {
    constructor(private readonly usersService: UsersService,
                private readonly ldapService: LDAPService) {
        super(
          {
            usernameField: 'account',
            passwordField: 'password',
            session: true,
              passReqToCallback: true,
          },
          async (req, username, password, done) => await this.signInUser(req, username, password, done),
        );
        passport.use(this);
        passport.serializeUser(this.serializeUser);
        passport.deserializeUser(this.deserializeUser.bind(this));
    }

    async signInUser(req, username, password, done: (error, user, info?) => void): Promise<any> {
        try {
            const ldapUser: ILdapUser = await this.ldapService.logIn(username, password);
            console.log('ldap user', ldapUser);
            if (ldapUser) {
              const user = await this.usersService.getByAccount(ldapUser.sAMAccountName, req.body.appCode);
              console.log(user);
              if (user) return done(null, user);
              if (!user) {
                  if (req.body.addIfNotExists && req.body.addIfNotExists === true) {
                      const fio = ldapUser.cn.split(' ');
                      const newUser = await this.usersService.add({
                          divisionId: 0,
                          personalNumber: null,
                          firstName: fio[1] ? fio[1] : '',
                          secondName: fio[2] ? fio[2] : null,
                          lastName: fio[0] ? fio[0] : '',
                          position: null,
                          email: ldapUser.mail,
                          activeDirectoryAccount: ldapUser.sAMAccountName,
                      });
                      return done(null, newUser);
                  }
                  return done(`Local user with account '${ldapUser.sAMAccountName}' not found`, false);
              }
            } else {
              done(`Active Directory user with account '${ldapUser.sAMAccountName}' not found`, false);
            }
        } catch (err) {
            return done(`Active Directory user with account '${username}' not found`, false, err);
        }
    }

    serializeUser(user, done: (error, user) => void): void {
        try {
          if (user) {
            done(null, user.id);
          } else {
            done('Failed to serialize user', false);
          }
        } catch (err) {
            console.log(err);
        }
    }

    async deserializeUser(req, id: number, callback: (error, user) => void): Promise<void> {
        const user = await this.usersService.getById(id, req.query.appCode ? req.query.appCode : null);
        if (user) {
            callback(null, user);
        } else {
            callback(`User with id ${id} not found`, false);
        }
    }
}