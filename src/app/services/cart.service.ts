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

    constructor(private http: HttpClient, private auth: AuthenticationService, private appService: AppService) {
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
                colorid: orderItem.color.id,
                sizeid: orderItem.size.id,
                quantity: orderItem.quantity
            })
            .pipe(map(response => {
                console.log(`response add to cart`, response);
                this.cartSubject.next(response);
                return response;
            }));
    }

    public removeFromCart(orderItem: OrderItem) {
        return this.http.post<any>(`${environment.apiUrl}/carts/removeFromCart`,
            {
                productid: orderItem.product.id,
                colorid: orderItem.color.id,
                sizeid: orderItem.size.id
            });
    }

    private getCartByUserFromDb() {
        console.log(`getting cart from db in cart service`);
        this.auth.getUser().subscribe(user => {
            this.user = user;
            try {
                this.http.get<any>(`${environment.apiUrl}/carts?user=${this.user._id}`).subscribe(response => {
                    let cart = response[0];
                    cart.orderItems.forEach(oi=>{
                        this.appService.getProductById(oi.product._id).subscribe(product=>{
                            oi.product = product;
                            this.cartSubject.next(response[0]);
                        })
                    })

                    console.log('cart service --> cart: ', response[0]);

                });

            }
            catch (err) {
                console.log(`error un getwishlist fro service, error: `, err);
                this.cartSubject.next(null);
                return null;
            }
        });
    }

}
