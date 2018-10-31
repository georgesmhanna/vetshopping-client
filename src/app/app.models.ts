export class Category {
    parent: any;
  constructor(public id: number, 
              public name:string, 
              public hasSubCategory: boolean,
              public parentId: number,
              public subCategories: Array<Category>){ }
}

export class Product {
  constructor(public id: number,
              public name: string,
              public images: Array<any>,
              public oldPrice: number,
              public newPrice: number,
              public discount: number,
              public ratingsCount: number,
              public ratingsValue: number,
              public description: string,
              public availibilityCount: number,
              public colors: Array<any>,
              public sizes: Array<any>,
              public weight: number,
              public categoryId: number){ }
}

export class User{
    constructor(public firstName: string,
                public lastName: string,
                public email: string,
                public username: string,
                public password: string) {}
}