import {Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {Data, AppService} from '../../app.service';
import {Product} from '../../app.models';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {WishlistService} from '../../services/wishlist.service';
import {BehaviorSubject, Observable} from 'rxjs';

@Component({
    selector: 'app-controls',
    templateUrl: './controls.component.html',
    styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit {
    @Input() product: Product;
    @Input() type: string;
    @Output() onOpenProductDialog: EventEmitter<any> = new EventEmitter();
    @Output() onQuantityChange: EventEmitter<any> = new EventEmitter<any>();
    public count: number = 1;
    public align = 'center center';
    private loggedIn: boolean;


    constructor(public appService: AppService, public snackBar: MatSnackBar, private authService: AuthenticationService, private router: Router, private wishlistService: WishlistService) {
    }


    ngOnInit() {
        if (this.product) {
            // console.log(this.product);
        }
        this.layoutAlign();
        this.authService.isLoggedIn().subscribe(loggedIn => this.loggedIn = loggedIn);
    }

    public layoutAlign() {
        if (this.type == 'all') {
            this.align = 'space-between center';
        }
        else if (this.type == 'wish') {
            this.align = 'start center';
        }
        else {
            this.align = 'center center';
        }
    }


    public increment(count) {
        if (this.count < this.product.availibilityCount) {
            this.count++;
            let obj = {
                productId: this.product.id,
                soldQuantity: this.count,
                total: this.count * this.product.newPrice
            };
            this.changeQuantity(obj);
        }
        else {
            this.snackBar.open('You can not choose more items than available. In stock ' + this.count + ' items.', '×', {
                panelClass: 'error',
                verticalPosition: 'top',
                duration: 3000
            });
        }
    }

    public decrement(count) {
        if (this.count > 1) {
            this.count--;
            let obj = {
                productId: this.product.id,
                soldQuantity: this.count,
                total: this.count * this.product.newPrice
            };
            this.changeQuantity(obj);
        }
    }

    public addToCompare(product: Product) {
        this.appService.addToCompare(product);
    }

    public addToWishList(product: Product) {
        if(!this.loggedIn){
            this.snackBar.open('You must be logged in to add items to wishlist', '×', {
                panelClass: 'warning',
                verticalPosition: 'top',
                duration: 3000
            });
            this.router.navigate(['sign-in']);
            return;
        }
        else{
            this.wishlistService.addToWishList(product).subscribe(response=>{
                this.snackBar.open('Product added successfully to wishlist', '×', {
                    panelClass: 'success',
                    verticalPosition: 'top',
                    duration: 3000
                });
                console.log(response);
            }, err=>{
                this.snackBar.open('Error: '+err, '×', {
                    panelClass: 'error',
                    verticalPosition: 'top',
                    duration: 3000
                });
            })
        }
    }

    public addToCart(product: Product) {
        // console.log(`selected color is `, colorGroup.value);
        this.appService.addToCart(product);
    }

    public openProductDialog(event) {
        this.onOpenProductDialog.emit(event);
    }

    public changeQuantity(value) {
        this.onQuantityChange.emit(value);
    }

}