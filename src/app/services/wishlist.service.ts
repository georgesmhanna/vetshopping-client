import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Product} from '../app.models';
import {BehaviorSubject, Observable} from 'rxjs';
import {AuthenticationService} from './authentication.service';
import Strapi from 'strapi-sdk-javascript/build/module/lib/sdk';

@Injectable()
export class WishlistService {
    user: any;
    strapi = new Strapi(environment.apiUrl);
    wishlistSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    new;

    constructor(private http: HttpClient, private auth: AuthenticationService) {
        this.getWishlistByUserFromDb();
    }

    public getWishlistByUser(): Observable<any> {
        console.log(`wishlist service ==? getWishlistByUser`);
        return this.wishlistSubject.asObservable();
    }

    public addToWishList(product: Product) {
        return this.http.post<any>(`${environment.apiUrl}/wishlists/addToWishlist`, {productid: product.id})
            .pipe(map(response => {
                console.log(`resonse add to wishlist`, response);
                this.wishlistSubject.next(response);
                return response;
            }));
    }

    public removeFromWishlist(product: Product) {
        return this.http.post<any>(`${environment.apiUrl}/wishlists/removeFromWishlist`, {productid: product.id});
    }

    private getWishlistByUserFromDb() {
        console.log(`getting wishlist from db in wishlist service`);
        this.auth.getUser().subscribe(user => {
            this.user = user;
            try {
                this.http.get<any>(`${environment.apiUrl}/wishlists?user=${this.user._id}`).subscribe(response => {
                    this.wishlistSubject.next(response[0]);

                    console.log('wishlist service --> wishlist: ', response[0]);

                });
                // const wishlist =  await this.strapi.getEntries('wishlist', {user: this.user._id});
                // return wishlist;
            }
            catch (err) {
                console.log(`error un getwishlist fro service, error: `, err);
                this.wishlistSubject.next(null);
                return null;
            }
        });
    }
}