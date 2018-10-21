import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Product, User} from '../app.models';
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class WishlistService {
    constructor(private http: HttpClient) {}

    public getWishlistsByUser(userId: string){
        return this.http.get(`${environment.apiUrl}/wishlists?user=${userId}`);
    }

    // public addToWishlist(product: Product, userId: string){
    //     return this.
    // }
}