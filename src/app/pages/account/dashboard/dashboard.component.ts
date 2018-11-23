import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {Observable} from 'rxjs';
import Strapi from 'strapi-sdk-javascript/build/module/lib/sdk';
import {environment} from '../../../../environments/environment';
import {AppService} from '../../../app.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    user$: Observable<any>;
    strapi = new Strapi(environment.apiUrl);
    completed: number;
    processing: number;
    onHold: number;
    shipping: number;
    public user: any;
    orders: any[];

    constructor(private auth: AuthenticationService, private appService: AppService) {
        this.user$ = this.auth.getUser();

    }

    ngOnInit() {
        this.user$.subscribe((user => {
            this.user = user;
            this.strapi.getEntries('addresses', {user: user._id, _limit: 80000})
                .then(values => {
                    this.user.address = values[0];
                });
        }));
        this.appService.getUserOrders().subscribe(orders => {
            const orderStatuses = orders.map(order => order.status);
            this.completed = (orderStatuses.filter(status => status === 'Completed').length * 100.0) / orderStatuses.length;
            this.onHold = (orderStatuses.filter(status => status === 'On Hold').length * 100.0) / orderStatuses.length;
            this.processing = (orderStatuses.filter(status => status === 'Processing').length * 100.0) / orderStatuses.length;
            this.shipping = (orderStatuses.filter(status => status === 'Shipping').length * 100.0) / orderStatuses.length;
        });
    }

}
