import {Component, HttpCode, HttpStatus} from '@nestjs/common';
import * as ldap from 'ldapjs';
import { environment } from '../../envoirenments';
import { LdapUserNotFoundException } from './exceptions/ldap.user-not-found.exception';
import { UnauthorizedException, HttpException } from '@nestjs/common';
import { ILdapUser } from './interfaces/ldap-user.interface';

@Component()
export class LDAPService {
    logIn(account: string, password: string): Promise<any> {
        return new Promise((bindResolve, bindReject) => {
            const client = ldap.createClient({ url: environment.ldapUrl });
            client.bind(`NW\\${account}`, password, (error) => {
                if (error) {
                    bindReject(error);
                } else {
                    const search = new Promise((searchResolve, searchReject) => {
                        const options = {
                            filter: '(&(objectCategory=person)(sAMAccountName=' + account + '))',
                            scope: 'sub',
                            attributes: ['name', 'cn', 'mail', 'samaccountname'],
                            sizeLimit: 1,
                        };
                        client.search('OU=02_USERS,OU=Kolenergo,DC=nw,DC=mrsksevzap,DC=ru', options, (err, result) => {
                            if (err) {
                                searchReject(err);
                            }
                            let user: ILdapUser | null = null;
                            result.on('searchEntry', (entry) => {
                                const temp = JSON.stringify(entry.object);
                                user = JSON.parse(temp);
                            });
                            result.on('end', (res) => {
                                if (res.status === 0) {
                                    if (user) {
                                        searchResolve(user);
                                    } else
                                        searchResolve(null);
                                }
                            });
                        });
                    });
                    bindResolve(search);
                }
            });
        });
    }
}