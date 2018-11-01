import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ProductDialogComponent } from '../../shared/products-carousel/product-dialog/product-dialog.component';
import { AppService } from '../../app.service';
import { Product, Category } from "../../app.models";
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
    @ViewChild('sidenav') sidenav: any;
    public sidenavOpen: boolean = true;
    private sub: any;
    public viewType: string = 'grid';
    public viewCol: number = 25;
    public counts = [12, 24, 36];
    public count: any;
    public sortings = ['Sort by Default', 'Best match', 'Lowest first', 'Highest first'];
    public sort: any;
    public products: Array<Product> = [];
    public categories: Category[];
    public brands = [];
    public priceFrom: number = 750;
    public priceTo: number = 1599;
    public colors = ["#5C6BC0", "#66BB6A", "#EF5350", "#BA68C8", "#FF4081", "#9575CD", "#90CAF9", "#B2DFDB", "#DCE775", "#FFD740", "#00E676", "#FBC02D", "#FF7043", "#F5F5F5", "#000000"];
    public sizes = ["S", "M", "L", "XL", "2XL", "32", "36", "38", "46", "52", "13.3\"", "15.4\"", "17\"", "21\"", "23.4\""];
    public page: any;
    public apiUrl = environment.apiUrl;

    constructor(private activatedRoute: ActivatedRoute, public appService: AppService, public dialog: MatDialog, private router: Router) {
    }

    ngOnInit() {
        this.count = this.counts[0];
        this.sort = this.sortings[0];
        if (window.innerWidth < 960) {
            this.sidenavOpen = false;
        }
        if (window.innerWidth < 1280) {
            this.viewCol = 33.3;
        }
        this.sub = this.activatedRoute.params.subscribe(params => {
            // to get products by category
            this.getProductsByCategory(params);

        });
        this.getCategories();
        this.getBrands();
        this.getAllProducts();


    }

    public getAllProducts() {
        this.appService.getAllProducts().subscribe(data => {
            data.forEach(product => product.categoryId = product.category._id);
            this.products = data;
            //for show more product
            // for (var index = 0; index < 3; index++) {
            //     this.products = this.products.concat(this.products);
            // }
        });
    }

    public getCategories() {
        if (this.appService.Data.categories.length == 0) {
            this.appService.getCategories().subscribe(data => {
                data.forEach(c => {
                    c.parentId = c.parent ? c.parent.id : 0;
                });
                this.categories = data;
                this.appService.Data.categories = data;
            });
        }
        else {
            this.categories = this.appService.Data.categories;
        }
    }

    public getBrands() {
        this.brands = this.appService.getBrands();
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    @HostListener('window:resize')
    public onWindowResize(): void {
        (window.innerWidth < 960) ? this.sidenavOpen = false : this.sidenavOpen = true;
        (window.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
    }

    public changeCount(count) {
        this.count = count;
        this.getAllProducts();
    }

    public changeSorting(sort) {
        this.sort = sort;
    }

    public changeViewType(viewType, viewCol) {
        this.viewType = viewType;
        this.viewCol = viewCol;
    }

    public openProductDialog(product) {
        let dialogRef = this.dialog.open(ProductDialogComponent, {
            data: product,
            panelClass: 'product-dialog'
        });
        dialogRef.afterClosed().subscribe(product => {
            if (product) {
                this.router.navigate(['/products', product.id, product.name]);
            }
        });
    }

    public onPageChanged(event) {
        this.page = event;
        this.getAllProducts();
        window.scrollTo(0, 0);
    }

    public onChangeCategory(event) {
        if (event) {
            this.router.navigate(['/products', {name: event.name, id: event.id}]);
        }
    }

    public getProductsByCategory(category: any) {
        this.appService.getProductsByCategory(category.id).subscribe(data => {
            data.forEach(product => {
                product.categoryId = product.category._id;
                product.discount = (product.oldPrice) ? Math.floor((product.oldPrice - product.newPrice) * 100 / product.oldPrice) : undefined;
            });
            this.products = data;
            console.log('products by category: ', this.products);
            //for show more product
            // for (var index = 0; index < 3; index++) {
            //     this.products = this.products.concat(this.products);
            // }
        });
    }
}
