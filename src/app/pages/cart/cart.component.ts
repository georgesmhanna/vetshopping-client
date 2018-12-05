import {Component, OnInit} from '@angular/core';
import {Data, AppService} from '../../app.service';
import {environment} from '../../../environments/environment';
import {CartService} from '../../services/cart.service';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
    total = [];
    grandTotal = 0;
    public apiUrl = environment.apiUrl;
    public cart: any;

    constructor(public appService: AppService, private router: Router, private cartService: CartService, private snackBar: MatSnackBar) {
    }

    ngOnInit() {
        // console.log('inside ng on init');

        this.cartService.getCartByUser().subscribe(cart => {
            if (!cart) {
                return;
            }
            this.cart = cart;
            // console.log(`this.cart in cart component = `, this.cart);
            this.calculateTotals();
            // console.log(`this.total = `, this.total);

        });
        // this.appService.Data.cartList.forEach(orderItem=>{
        //   this.total[orderItem.product.id] = orderItem.product.newPrice;
        //   this.grandTotal += orderItem.product.newPrice;
        // })
    }

    private calculateTotals() {
        this.grandTotal = 0;
        this.total = [];
        this.cart.orderItems.forEach((orderItem, index) => {
            //   if(this.total && this.total.length > 0)
            //     this.total[orderItem.product.id] = orderItem.product.newPrice;
            //     this.total.push({[orderItem.product.id]: orderItem.product.newPrice});
            this.total.push({
                productId: orderItem.product.id,
                price: orderItem.product.newPrice,
            });
            // else {
            //     this.total.push({[orderItem.product.id]: orderItem.product.newPrice});
            this.grandTotal += this.total[index].price; // orderItem.product.newPrice;
            // }
        });
    }

    public getTotalPrice(value, i) {
        if (value) {
            this.cart.orderItems[i].quantity = value.soldQuantity;
            this.total[i].price = value.total;
            // this.total[value.productId] = value.total;
            this.grandTotal = 0;
            this.total.forEach(item => {
                this.grandTotal += item.price;
            });
        }
    }

    public remove(orderItem, index) {
        if (window.confirm('Are sure you want to remove this item from your shopping cart ?')) {
            this.cartService.removeFromCart(orderItem).subscribe(response => {
                this.snackBar.open('Product removed successfully from cart', '×', {
                    panelClass: 'success',
                    verticalPosition: 'top',
                    duration: 3000
                });
                this.cart = response;

                this.calculateTotals();
                // this.grandTotal = this.grandTotal - this.total[index].price;
                // this.total.forEach(val => {
                //     if (val == this.total[orderItem.product.id]) {
                //         this.total[orderItem.product.id] = 0;
                //     }
                // });
                // this.total = this.total.splice(index);
            }, err => {
                this.snackBar.open('Error: ' + err, '×', {
                    panelClass: 'error',
                    verticalPosition: 'top',
                    duration: 3000
                });
            });
        }
        // const index: number = this.appService.Data.cartList.indexOf(product);
        // if (index !== -1) {
        //   this.appService.Data.cartList.splice(index, 1);
        //   this.grandTotal = this.grandTotal - this.total[product.id];
        //   this.total.forEach(val => {
        //     if(val == this.total[product.id]){
        //       this.total[product.id] = 0;
        //     }
        //   })
        // }
    }

    // public clear(){
    //   this.appService.Data.cartList.length = 0;
    // }

    checkout() {
        // save quantities:
        // console.log('this.cart on checkout = ', this.cart);
        // this.appService.Data.quantityList = this.cart.
        this.appService.Data.cartList = this.cart;
        this.router.navigate(['checkout']);
    }
}
