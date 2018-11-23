import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {MatSnackBar} from '@angular/material';
import {Category, OrderItem, Product} from './app.models';
import {environment} from '../environments/environment';
import Strapi from 'strapi-sdk-javascript/build/module/lib/sdk';

export class Data {
    constructor(public categories: Category[],
                public compareList: Product[],
                public wishList: Product[],
                public cartList: OrderItem[],
                public totalPrice: number) {
    }
}

@Injectable()
export class AppService {
    public Data = new Data(
        [], // categories
        [], // compareList
        [],  // wishList
        [],  // cartList
        null // totalPrice
    );
    public url = 'assets/data/';
    public strapi = new Strapi(environment.apiUrl + '/');

    constructor(public http: HttpClient, public snackBar: MatSnackBar) {
    }

    public getCategories(): any {
        return this.http.get(environment.apiUrl + '/categories');
    }

    public getSubCategories(id) {
        return this.http.get(`${environment.apiUrl}/categories/${id}/subcategories`);

    }

    public getProducts(type): Observable<Product[]> {
        return this.http.get<Product[]>(this.url + type + '-products.json');
    }

    public getAllProducts(): any {
        return this.http.get(`${environment.apiUrl}/products`);
    }

    public getProductById(id): Observable<any> {
        return this.http.get<Product>(`${environment.apiUrl}/products/${id}`);
    }

    public getProductsByCategory(id): Observable<any> {
        return this.http.get<Product>(`${environment.apiUrl}/productsByCategory/${id}`);
    }

    public getAddressByUser(): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/addresses/getCurrentAddress`);
    }

    public getBanners(): Observable<any[]> {
        return this.http.get<any[]>(this.url + 'banners.json');
    }

    public addToCompare(product: Product) {
        let message, status;
        if (this.Data.compareList.filter(item => item.id == product.id)[0]) {
            message = 'The product ' + product.name + ' already added to comparison list.';
            status = 'error';
        } else {
            this.Data.compareList.push(product);
            message = 'The product ' + product.name + ' has been added to comparison list.';
            status = 'success';
        }
        this.snackBar.open(message, '×', {panelClass: [status], verticalPosition: 'top', duration: 3000});
    }

    public getBrands() {
        // return  await this.strapi.getEntries('brands');
        return this.http.get<any>(`${environment.apiUrl}/brands`);

    }

    public async getCountries() {
        return await this.strapi.getEntries('countries', {_limit: 300});
    }


    public getMonths() {
        return [
            {value: '01', name: 'January'},
            {value: '02', name: 'February'},
            {value: '03', name: 'March'},
            {value: '04', name: 'April'},
            {value: '05', name: 'May'},
            {value: '06', name: 'June'},
            {value: '07', name: 'July'},
            {value: '08', name: 'August'},
            {value: '09', name: 'September'},
            {value: '10', name: 'October'},
            {value: '11', name: 'November'},
            {value: '12', name: 'December'}
        ];
    }

    public getYears() {
        return ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
    }

    public getDeliveryMethods() {
        return [
            {value: 'free', name: 'Free Delivery', desc: '$0.00 / Delivery in 7 to 14 business Days', price: 0},
            {value: 'standard', name: 'Standard Delivery', desc: '$7.99 / Delivery in 5 to 7 business Days', price: 7.99},
            {value: 'express', name: 'Express Delivery', desc: '$29.99 / Delivery in 1 business Days', price: 29.99}
        ];
    }

    public sendEmail(email) {
        return this.http.post<any>(`${environment.apiUrl}/email`, {
            to: email.to,
            replyTo: email.replyTo,
            subject: email.subject,
            text: email.text,
            html: email.html
        });
    }

    public filterByPrice(price, type = 'lte') {
        return this.http.get<any>(`${environment.apiUrl}/products?newPrice._${type}=${price}`);
    }

    public placeOrder(order) {
        return this.http.post<any>(`${environment.apiUrl}/orders`, order);
    }

    public getUserOrders() {
        return this.http.get<any>(`${environment.apiUrl}/orders/getUserOrders`);
    }

    public getUserOrderById(id) {
        return this.http.get<any>(`${environment.apiUrl}/orders/getUserOrders/${id}`);
    }

    public removeUserOrderById(id) {
        return this.http.delete<any>(`${environment.apiUrl}/orders/removeUserOrderById/${id}`);
    }
}

