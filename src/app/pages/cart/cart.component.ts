import { Component, OnInit } from '@angular/core';
import { Data, AppService } from '../../app.service';
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
  constructor(public appService:AppService, private router: Router, private cartService: CartService, private snackBar: MatSnackBar, ) { }

  ngOnInit() {
    this.cartService.getCartByUser().subscribe(cart=>{
      if(!cart) return;
      this.cart = cart;
      console.log(`this.cart in cart component = `, this.cart);
      this.cart.orderItems.forEach(orderItem=>{
        if(this.total && this.total.length > 0)
          this.total[orderItem.product.id] = orderItem.product.newPrice;
        else {
            this.total.push({[orderItem.product.id]: orderItem.product.newPrice});
            this.grandTotal += orderItem.product.newPrice;
        }
      });
    });
    // this.appService.Data.cartList.forEach(orderItem=>{
    //   this.total[orderItem.product.id] = orderItem.product.newPrice;
    //   this.grandTotal += orderItem.product.newPrice;
    // })
  }

  public getTotalPrice(value){
    if(value){
      this.total[value.productId] = value.total;
      this.grandTotal = 0;
      this.total.forEach(price=>{
        this.grandTotal += price;
      })
    }
  }

  public remove(orderItem) {
      this.cartService.removeFromCart(orderItem).subscribe(response=>{
          this.snackBar.open('Product removed successfully from cart', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000
          });
          this.cart.orderItems = this.cart.orderItems.filter(oi=>oi.id != orderItem._id);
          this.grandTotal = this.grandTotal - this.total[orderItem.product.id];
          this.total.forEach(val => {
              if(val == this.total[orderItem.product.id]){
                  this.total[orderItem.product.id] = 0;
              }
          })
      }, err=>{
          this.snackBar.open('Error: '+err, '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000
          });
      });
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

}
