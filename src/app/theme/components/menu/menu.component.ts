import { Component, OnInit} from '@angular/core';
import {AppService} from '../../../app.service';
import {Category} from '../../../app.models';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(private appService: AppService) { }

  categories: Array<Category>;
    mainCategories: Array<Category>;
    subCategories: Array<Category>;

  ngOnInit() {
      this.getCategories();
  }

    openMegaMenu() {
        const pane = document.getElementsByClassName('cdk-overlay-pane');
    [].forEach.call(pane, function (el) {
        if (el.children.length > 0) {
            if (el.children[0].classList.contains('mega-menu')) {
            el.classList.add('mega-menu-pane');
          }
        }
    });
  }

    public getCategories() {
        // if (this.appService.Data.categories.length == 0) {
            this.appService.getCategories().subscribe(async data => {
                for (const c of data) {
                    c.parentId = c.parent ? c.parent.id : 0;
                    for (const sc of c.subCategories) {
                        this.appService.getSubCategories(sc.id).subscribe(ssc => {
                            sc.subCategories = ssc;
                        });
                    }
                    // if(c.hasSubCategory){
                    //     this.appService.getSubCategories(c.id).subscribe(sc=>{
                    //         c.subCategories = sc;
                    //     })
                    // }
                }
                this.categories = data;
                this.appService.Data.categories = data;
                this.mainCategories = this.categories.filter(c => !c.parent); // && c.parent.name==='All Categories');
                // console.log(`categ menu `, this.categories);

            });
        // }
        // else {
        //     this.categories = this.appService.Data.categories;
        //     this.mainCategories = this.categories.filter(c=>c.parent.name==='All Categories');
        //     console.log(`categ menu `, this.categories);
        //
        // }
    }

}
