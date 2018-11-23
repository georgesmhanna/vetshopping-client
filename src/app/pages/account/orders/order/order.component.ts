import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AppService} from '../../../../app.service';
import {environment} from '../../../../../environments/environment';

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
    order: any;
    apiUrl = environment.apiUrl;

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private appService: AppService) {
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            const orderId = params['id'];
            this.appService.getUserOrderById(orderId).subscribe(order => {
                this.order = order;
            }, err => {
                // error
            });
        });
    }

}
