import {Component, OnInit, ViewChild, HostListener} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {ProductDialogComponent} from '../../shared/products-carousel/product-dialog/product-dialog.component';
import {AppService} from '../../app.service';
import {Product, Category} from '../../app.models';
import {environment} from '../../../environments/environment';
import Strapi from 'strapi-sdk-javascript/build/main/lib/sdk';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
    @ViewChild('sidenav') sidenav: any;
    public sidenavOpen = true;
    public viewType = 'grid';
    public viewCol = 25;
    public counts = [12, 24, 36];
    public count: any;
    public sortings = ['Sort by Default', 'Lowest Price first', 'Highest Price first', 'Name A-Z', 'Name Z-A'];
    public sort: any;
    public products: Array<Product> = [];
    public categories: Category[];
    public brands = [];
    public page: any;
    public apiUrl = environment.apiUrl;
    public currentCategory: any = {};
    public productFilter: any = {};
    private sub: any;
    private strapi = new Strapi(environment.apiUrl);

    constructor(private activatedRoute: ActivatedRoute, public appService: AppService, public dialog: MatDialog, private router: Router) {
    }

    async ngOnInit() {
        this.count = this.counts[0];
        this.sort = this.sortings[0];
        if (window.innerWidth < 960) {
            this.sidenavOpen = false;
        }
        if (window.innerWidth < 1280) {
            this.viewCol = 33.3;
        }
        this.getCategories();
        this.getBrands();


        this.sub = this.activatedRoute.params.subscribe(params => {
            this.currentCategory = params;
            // to get products by category
            this.getProductsByCategory(params);
        });


        const colors: any = await this.strapi.getEntries('colors');
        const sizes: any = await this.strapi.getEntries('sizes');

        const colorNames = colors.map(x => x.name);
        const sizeNames = sizes.map(x => x.name);


        this.productFilter = {
            minPrice: 0,
            maxPrice: 100,
            colors: colorNames,
            color: 'any',
            sizes: sizeNames,
            size: 'any',
            brand: 'any'
        };

    }

    public getAllProducts(search: string = '') {
        if (this.categories) { this.categories.forEach(c => c.selected = false); }
        this.appService.getAllProducts().subscribe(data => {
            data.forEach(product => this.finalize(product));
            this.products = !search ? data : data.filter(product => product.name.toLowerCase().includes(search.toLowerCase()));
            // for show more product
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
                    c.selected = this.currentCategory ? (c.id === this.currentCategory.id) : false;
                });
                this.categories = data;
                console.log('this categories = ', this.categories);
                console.log('this category = ', this.currentCategory);
                this.appService.Data.categories = data;
            });
        } else {
            this.categories = this.appService.Data.categories;
            this.categories.forEach(c => {
                c.selected = this.currentCategory ? (c.id === this.currentCategory.id) : false;
            });
        }
    }

    public getBrands() {
        this.appService.getBrands().subscribe((brands: any) => {
            console.log(`brandsssss`, brands);
            brands.forEach(brand => brand.image = environment.apiUrl + brand.image.url);
            this.brands = brands;
            console.log(`brands: `, this.brands);
        });
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
        const dialogRef = this.dialog.open(ProductDialogComponent, {
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
        if (this.currentCategory) {
            this.getProductsByCategory(this.currentCategory);
        } else {
            this.getAllProducts();
        }
        window.scrollTo(0, 0);
    }

    public onChangeCategory(event) {
        event.selected = true;
        if (event) {
            this.router.navigate(['/products', {name: event.name, id: event.id}]);
        }
    }

    public getProductsByCategory(category: any) {
        if (!category.id || category.name === 'All Products') {
            this.getAllProducts(category.search);
            return;
        }

        return this.appService.getProductsByCategory(category.id).subscribe(data => {
            data.forEach(product => this.finalize(product));
            this.products = !category.search ? data : data.filter(product =>
                product.name.toLowerCase().includes(category.search.toLowerCase()));
            console.log('products by category: ', this.products);
            // for show more product
            // for (var index = 0; index < 3; index++) {
            //     this.products = this.products.concat(this.products);
            // }
        });
    }

    finalize(product) {
        product.categoryId = product.category._id;
        product.discount = (product.oldPrice) ? Math.floor((product.oldPrice - product.newPrice) * 100 / product.oldPrice) : undefined;
        return product;
    }

}
