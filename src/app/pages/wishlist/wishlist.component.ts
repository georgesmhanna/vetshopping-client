import { Component, OnInit } from '@angular/core';
import { Data, AppService } from '../../app.service';
import {Router} from '@angular/router';
import {Product} from '../../app.models';
import {environment} from '../../../environments/environment';
import {WishlistService} from '../../services/wishlist.service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {

  public apiUrl = environment.apiUrl;
  public wishlist: any;
  constructor(public appService:AppService, private router: Router, private wishlistService: WishlistService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.wishlistService.getWishlistByUser().subscribe(wishlist=>this.wishlist = wishlist);
    console.log(`wishlist = `, this.wishlist)
  }

  public remove(product) {
      this.wishlistService.removeFromWishlist(product).subscribe(response=>{
          this.snackBar.open('Product removed successfully from wishlist', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000
          });
          this.wishlist.products = this.wishlist.products.filter(p=>p.id != product._id);
      }, err=>{
          this.snackBar.open('Error: '+err, '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000
          });
      })
  }

  // public clear(){
  //   this.appService.Data.wishList.length = 0;
  // }

    viewProduct(product: Product) {
        this.router.navigate(['/products', product.id, product.name]);
    }
}