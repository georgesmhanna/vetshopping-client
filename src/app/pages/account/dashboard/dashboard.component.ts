import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {Observable} from 'rxjs';
import Strapi from 'strapi-sdk-javascript/build/module/lib/sdk';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  user$: Observable<any>;
  strapi =  new Strapi(environment.apiUrl);
    public  user: any;

  constructor(private auth: AuthenticationService) {
    this.user$ = this.auth.getUser();

  }

  ngOnInit() {
      this.user$.subscribe((user => {
          this.user = user;
          this.strapi.getEntries('addresses', {user: user._id})
              .then(values=>{
                this.user.address = values[0];
              });
      }));
  }

}
