export class SidenavMenu {
    constructor(public id: any,
                public title: string,
                public routerLink: string,
                public href: string,
                public target: string,
                public hasSubMenu: boolean,
                public parentId: any,
                public custom: boolean) {
    }
}
