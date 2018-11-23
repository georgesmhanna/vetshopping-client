import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import Strapi from 'strapi-sdk-javascript/build/module/lib/sdk';
import {BehaviorSubject, Observable} from 'rxjs';
import {AuthenticationService} from './authentication.service';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {OrderItem, Product} from '../app.models';
import {AppService} from '../app.service';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    user: any;
    strapi = new Strapi(environment.apiUrl);
    cartSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private http: HttpClient, private appService: AppService) {
        this.getCartByUserFromDb();
    }

    public getCartByUser(): Observable<any> {
        console.log(`cart service ==? getCartByUser`);
        return this.cartSubject.asObservable();
    }

    public addToCart(orderItem: OrderItem) {
        return this.http.post<any>(`${environment.apiUrl}/carts/addToCart`,
            {
                productid: orderItem.product.id,
                colorid: orderItem.color ? orderItem.color.id : undefined,
                sizeid: orderItem.size ? orderItem.size.id : undefined,
                quantity: orderItem.quantity
            })
            .pipe(map(response => {
                console.log(`response add to cart`, response);
                this.cartSubject.next(response);
                this.appService.Data.cartList = response;
                return response;
            }));
    }

    public removeFromCart(orderItem: OrderItem) {
        return this.http.post<any>(`${environment.apiUrl}/carts/removeFromCart`,
            {
                productid: orderItem.product.id,
                colorid: orderItem.color ? orderItem.color.id : undefined,
                sizeid: orderItem.size ? orderItem.size.id : undefined,
            }).pipe(map(response => {
            console.log(`response remove from cart`, response);
            this.cartSubject.next(response);
            this.appService.Data.cartList = response;
            return response;
        }));
    }

    private getCartByUserFromDb() {
        console.log(`getting cart from db in cart service`);
        try {
            return this.http.get<any>(`${environment.apiUrl}/carts/getCurrentCart`).subscribe(cart => {
                console.log('cart service --> cart: ', cart);
                this.cartSubject.next(cart);
                return cart;
            });
        } catch (err) {
            console.log(`error in cart, error: `, err);
            this.cartSubject.next(null);
            return null;
        }
    }

    public getReloadedCart() {
        return this.http.get<any>(`${environment.apiUrl}/carts/getCurrentCart`);
    }

    public removeUserCart() {
        return this.http.delete<any>(`${environment.apiUrl}/carts/removeUserCart`).pipe(map(response => {
            this.cartSubject.next({orderItems: []});
            this.appService.Data.cartList = [];
            return {orderItems: []};
        }));
    }


}
