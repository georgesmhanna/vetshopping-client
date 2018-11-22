import {Component, OnInit, Input} from '@angular/core';
import {SidenavMenuService} from './sidenav-menu.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-sidenav-menu',
    templateUrl: './sidenav-menu.component.html',
    styleUrls: ['./sidenav-menu.component.scss'],
    providers: [SidenavMenuService]
})
export class SidenavMenuComponent implements OnInit {
    @Input('menuItems') menuItems;
    @Input('menuParentId') menuParentId;
    parentMenu: Array<any>;

    constructor(private sidenavMenuService: SidenavMenuService, private router: Router) {
    }

    ngOnInit() {
        this.parentMenu = this.menuItems.filter(item => item.parentId == this.menuParentId);
    }

    onClick(menuId, menu) {
        if (!menu.hasSubMenu && !menu.custom) {
            this.router.navigate(['/products', {name: menu.title, id: menu.id}]);
        }
        this.sidenavMenuService.toggleMenuItem(menuId);
        this.sidenavMenuService.closeOtherSubMenus(this.menuItems, menuId);
    }

}
