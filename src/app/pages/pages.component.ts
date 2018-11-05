import {Component, OnInit, HostListener, ViewChild} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {Router, NavigationEnd} from '@angular/router';
import {Settings, AppSettings} from '../app.settings';
import {AppService} from '../app.service';
import {Category, Product} from '../app.models';
import {SidenavMenuService} from '../theme/components/sidenav-menu/sidenav-menu.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/internal/operators';
import {environment} from '../../environments/environment';

@Component({
    selector: 'app-pages',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss'],
    providers: [SidenavMenuService]
})
export class PagesComponent implements OnInit {
    public showBackToTop: boolean = false;
    public categories: Category[];
    public category: any;
    public sidenavMenuItems: Array<any>;
    @ViewChild('sidenav') sidenav: any;
    productCtrl = new FormControl();
    filteredProducts: Observable<Product[]>;

    products: any[];
    apiUrl = environment.apiUrl;
    public settings: Settings;

    constructor(public appSettings: AppSettings,
                public appService: AppService,
                public sidenavMenuService: SidenavMenuService,
                public router: Router) {
        this.settings = this.appSettings.settings;
    }

    displayFn(product): string {
        return product ? product.name : product;
    };

    async ngOnInit() {
        this.getCategories();
        this.sidenavMenuItems = this.sidenavMenuService.getSidenavMenuItems();
    }

    public getCategories() {
        this.appService.getCategories().subscribe(data => {
            data.forEach(c => c.parentId = c.parent ? c.parent.id : 0);
            this.categories = data;
            this.category = data[0];
            this.appService.Data.categories = data;
            this.populateAutoComplete();
        });
    }

    public changeCategory(event) {
        console.log('in pages event is', event);
        if (event && event.id) {
            this.category = this.categories.filter(category => category.id == event.id)[0];
            this.populateAutoComplete();
        }
        else if (event) {
            this.category = {name: 'All Products'};
            this.populateAutoComplete(true);
        }
        if (window.innerWidth < 960) {
            // this.stopClickPropagate(event);
        }
    }

    public remove(product) {
        const index: number = this.appService.Data.cartList.indexOf(product);
        if (index !== -1) {
            this.appService.Data.cartList.splice(index, 1);
            this.appService.Data.totalPrice = this.appService.Data.totalPrice - product.newPrice;
        }
    }

    public clear() {
        this.appService.Data.cartList.length = 0;
    }

    public changeTheme(theme) {
        this.settings.theme = theme;
    }

    public stopClickPropagate(event: any) {
        event.stopPropagation();
        event.preventDefault();
    }

    public search() {
        let value = this.productCtrl.value;
        if (typeof value === 'string') {
            this.router.navigate(['/products', {name: this.category.name, id: this.category.id, search: value}]);
        }
        else if (value && value.name) {
            this.router.navigate(['/products', {name: this.category.name, id: this.category.id, search: value.name}]);
        }
        else {
            return;
        }
    }

    public scrollToTop() {
        var scrollDuration = 200;
        var scrollStep = -window.pageYOffset / (scrollDuration / 20);
        var scrollInterval = setInterval(() => {
            if (window.pageYOffset != 0) {
                window.scrollBy(0, scrollStep);
            }
            else {
                clearInterval(scrollInterval);
            }
        }, 10);
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                window.scrollTo(0, 0);
            });
        }
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll($event) {
        ($event.target.documentElement.scrollTop > 300) ? this.showBackToTop = true : this.showBackToTop = false;
    }

    ngAfterViewInit() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.sidenav.close();
            }
        });
        this.sidenavMenuService.expandActiveSubMenu(this.sidenavMenuService.getSidenavMenuItems());
    }

    public closeSubMenus() {
        if (window.innerWidth < 960) {
            this.sidenavMenuService.closeAllSubMenus();
        }
    }

    openProduct(event) {
        let product = event.option.value;
        this.router.navigate(['/products', product.id, product.name]);
    }

    private _filterProducts(value: string): Product[] {
        const filterValue = typeof value === 'string' ? value.toLowerCase() : '';

        return this.products.filter(product => product.name.toLowerCase().includes(filterValue));
    }

    private populateAutoComplete(showAll: boolean = false) {
        let sub$ = showAll ? this.appService.getAllProducts() : this.appService.getProductsByCategory(this.category.id);
        sub$.subscribe(products => {
            this.products = products;
            this.filteredProducts = this.productCtrl.valueChanges
                .pipe(
                    startWith(''),
                    map(product => product ? this._filterProducts(product) : this.products ? this.products.slice() : [])
                );
        });
    }
}