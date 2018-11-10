import {Component, OnInit} from '@angular/core';
import {AppService} from '../../../app.service';
import {AuthenticationService} from '../../../services/authentication.service';
import {faDog} from '@fortawesome/free-solid-svg-icons';
import {Observable} from 'rxjs';
import {WishlistService} from '../../../services/wishlist.service';

@Component({
    selector: 'app-top-menu',
    templateUrl: './top-menu.component.html'
})
export class TopMenuComponent implements OnInit {
    public currencies = ['USD', 'EUR'];
    public currency: any;
    public flags = [
        {name: 'English', image: 'assets/images/flags/gb.svg'},
        {name: 'German', image: 'assets/images/flags/de.svg'},
        {name: 'French', image: 'assets/images/flags/fr.svg'},
        {name: 'Russian', image: 'assets/images/flags/ru.svg'},
        {name: 'Turkish', image: 'assets/images/flags/tr.svg'}
    ];
    public flag: any;
    public user: any;
    public loggedIn$: Observable<boolean>;
    public user$: Observable<any>;
    public wishlist$: Observable<any>;
    public faDog = faDog;

    constructor(public appService: AppService, private authenticationService: AuthenticationService, private wishlistService: WishlistService) {
        this.loggedIn$ = this.authenticationService.isLoggedIn();
        this.user$ = this.authenticationService.getUser();
        this.wishlist$ = this.wishlistService.getWishlistByUser();
    }

    ngOnInit() {
        this.currency = this.currencies[0];
        this.flag = this.flags[0];
    }

    public changeCurrency(currency) {
        this.currency = currency;
    }

    public changeLang(flag) {
        this.flag = flag;
    }
}
