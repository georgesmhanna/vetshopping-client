import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {User} from '../app.models';
import { BehaviorSubject, Observable } from 'rxjs';
import Strapi from 'strapi-sdk-javascript/build/module/lib/sdk';

@Injectable()
export class AuthenticationService {
    isLoginSubject = new BehaviorSubject<boolean>(this.hasToken());
    userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
    strapi = new Strapi(environment.apiUrl);
    constructor(private http: HttpClient) {}

    public isLoggedIn(): Observable<boolean>{
        return this.isLoginSubject.asObservable();
    }

    public getUser(): Observable<any>{
        return this.userSubject.asObservable();
    }

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
                    this.strapi.setToken(user.token);
                    this.getUserData(user);
                    this.isLoginSubject.next(true);
                    this.userSubject.next(user);
                }
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.strapi.clearToken();
        this.isLoginSubject.next(false);
        this.userSubject.next(null);

    }

    register(user: User){
        return this.http.post(`${environment.apiUrl}/auth/local/register`, user);
    }

    loginAuthUser(authKey, provider){
        return this.http.get<any>(`${environment.apiUrl}/auth/${provider}/callback?access_token=${authKey}`)
            .pipe(map( auth => {
                let user;
                // login successful if there's a jwt token in the response
                if (auth && auth.user && auth.jwt) {
                    user = auth.user;
                    user.token = auth.jwt;
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.strapi.setToken(user.token);
                    this.getUserData(user);
                    this.isLoginSubject.next(true);
                    this.userSubject.next(user);
                }
                console.log('logged in user: ', user);
                return user;
            }));
    }

    private hasToken(): boolean {
        return !!localStorage.getItem('currentUser');
    }

    private getUserFromStorage() {
        return this.hasToken()? JSON.parse(localStorage.getItem('currentUser')) : null;
    }

    private async getUserData(user) {
        console.log('inside get user data');
        const wishlist = await this.strapi.getEntries('wishlists', {user: user._id});
        console.log(wishlist);
    }
}