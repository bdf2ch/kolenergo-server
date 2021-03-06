import { Component } from '@nestjs/common';
import { Strategy } from 'passport-local';
import * as passport from 'passport';
import { UsersService } from '../users/users.service';
import { LDAPService } from './ldap.service';
import { ILdapUser } from './interfaces/ldap-user.interface';
import { ApplicationsService } from '../../control-panel/applications/applications.service';
import { IServerResponse, IUser } from '@kolenergo/cpa';

@Component()
export class AuthenticationStrategy extends Strategy {
    constructor(private readonly usersService: UsersService,
                private readonly applicationsService: ApplicationsService,
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
            console.log('ldap user', ldapUser, ldapUser['dn'].split(',').reverse());
            console.log('company', ldapUser['dn'].split(',').reverse()[3].split('=')[1]);
            console.log('department', ldapUser['dn'].split(',').reverse()[5].split('=')[1]);
            if (ldapUser) {
              let user = await this.usersService.getByAccount(ldapUser.sAMAccountName, req.body.appCode);
              const allowedUsers: IServerResponse<IUser[]> = await this.applicationsService.getApplicationAllowedUsers(req.body.appCode);
              console.log(allowedUsers);
              console.log(user);
              // if (user) return done(null, user);
              if (!user) {
                  const companyUid = ldapUser.dn
                    .split(',')
                    .reverse()[3]
                    .split('=')[1];
                  console.log('companyUid', companyUid);
                  const departmentUid = ldapUser.dn
                    .split(',')
                    .reverse()[5]
                    .split('=')[1];
                  console.log('departmentUid', departmentUid);
                  if (req.body.addIfNotExists && req.body.addIfNotExists === true) {
                      const fio = ldapUser.cn.split(' ');
                      user = await this.usersService.add({
                          divisionId: 0,
                          personalNumber: null,
                          firstName: fio[1] ? fio[1] : '',
                          secondName: fio[2] ? fio[2] : null,
                          lastName: fio[0] ? fio[0] : '',
                          position: null,
                          email: ldapUser.mail,
                          activeDirectoryAccount: ldapUser.sAMAccountName,
                          activeDirectoryCompanyUid: companyUid,
                          activeDirectoryDepartmentUid: departmentUid,
                      });
                      // return done(null, newUser);
                  }
                  // return done(`Local user with account '${ldapUser.sAMAccountName}' not found`, false);
              }

              if (!user) {
                  done(`User not found`, false);
              }

              if (allowedUsers.data.length > 0 ) {
                const findUserById = (usr: IUser) => usr.id === user.id;
                const allowedUser = allowedUsers.data.find(findUserById);
                return allowedUser ? done(null, user) : done(`Access denied`, false);
              } else {
                  return done(null, user);
              }

            } else {
              done(`User not found`, false);
            }
        } catch (err) {
            return done(`User not found`, false, err);
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
        const user = await this.usersService.getById(id, true, true, req.query.appCode ? req.query.appCode : '');
        if (user) {
            callback(null, user);
        } else {
            callback(`User with id ${id} not found`, false);
        }
    }
}
