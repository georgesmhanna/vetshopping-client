import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {User} from '../app.models';

@Injectable()
export class AuthenticationService {
    constructor(private http: HttpClient) { }

    login(email: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/auth/local`, {identifier: email, password: password})
            .pipe(map(auth => {
                let user;
                // login successful if there's a jwt token in the response
                if (auth && auth.user && auth.jwt) {
                    user = auth.user;
                    user.token = auth.jwt;
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }

    register(user: User){
        return this.http.post(`${environment.apiUrl}/auth/local/register`, user);
    }
}