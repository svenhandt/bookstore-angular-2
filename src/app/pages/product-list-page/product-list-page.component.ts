import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {CurrentPageService} from "../../services/util/current-page.service";
import {CategoryService} from "../../services/category.service";
import {Subscription, switchMap} from "rxjs";
import {ProductService} from "../../services/product.service";
import {ProductModel} from "../../data/product.model";
import {Category} from "@commercetools/platform-sdk";

@Component({
  selector: 'app-product-list-page',
  templateUrl: './product-list-page.component.html',
  styleUrls: ['./product-list-page.component.css']
})
export class ProductListPageComponent implements OnInit, OnDestroy {

  currentCategory: Category
  products: ProductModel[] = []

  paramsSubscription: Subscription
  productsSubscription : Subscription

  sortByTitle: boolean = false
  sortByPrice: boolean = false

  searchQuery: string = ''


  constructor(private route: ActivatedRoute,
              private currentPageService: CurrentPageService,
              private categoryService: CategoryService,
              private productService: ProductService,
              private router: Router) { }

  ngOnInit(): void {
    this.sortByTitle = true

    this.productsSubscription = this.categoryService.selectedCategorySubject.pipe(
        switchMap((value: Category, index: number) => {
          this.currentCategory = value
          this.loadProducts()
          return this.productService.productsSubject
    })).subscribe((products: ProductModel[]) => {
      this.products = products
    })
    if(this.categoryService.categoriesLoaded()) {
      this.subscribeToParamsCategoriesLoaded()
    }
    else {
      this.subscribeToParamsCategoriesNotLoaded()
    }
    this.currentPageService.setCurrentComponentName(this.route.component?.name)
  }

  private loadProducts() {
    console.log('query: ' + this.searchQuery)
    console.log('category: ' + this.currentCategory?.id)
    if(this.currentCategory?.id) {
      this.productService.loadProductsForCategory(this.currentCategory.id)
    }
    else if(this.searchQuery) {
      this.productService.loadProductsForSearchQuery(this.searchQuery)
    }
  }

  onSortProductsByTitle() {
    this.sortProductsByTitle()
    this.sortByPrice = false
    this.sortByTitle = true
  }

  onSortProductsByPrice() {
    this.sortProductsByPrice()
    this.sortByPrice = true
    this.sortByTitle = false
  }

  navigateToProductDetails(product: ProductModel) {
    this.productService.currentProduct = product
    this.categoryService.setSelectedCategory('')
    this.router.navigate(['/product-details', product.id]);
  }

  private subscribeToParamsCategoriesLoaded() {
    this.paramsSubscription = this.route.queryParams.subscribe((params: Params) => {
      this.setSelectedCategoryOrSearchQuery(params)
    })
  }

  private subscribeToParamsCategoriesNotLoaded() {
    this.paramsSubscription = this.categoryService.categoriesSubject.pipe(switchMap((value: Category[], index: number) => {
      return this.route.queryParams
    })).subscribe((params: Params) => {
      this.setSelectedCategoryOrSearchQuery(params)
    })
  }

  setSelectedCategoryOrSearchQuery(params: Params) {
    const categoryKey = params['category']
    const searchQuery = params['q']
    if(categoryKey) {
      this.searchQuery = ''
      this.categoryService.setSelectedCategory(categoryKey)
    }
    else if(searchQuery) {
      this.searchQuery = searchQuery
      this.categoryService.setSelectedCategory('')
    }
    this.sortByPrice = false
    this.sortByTitle = true
  }

  private sortProductsByTitle() {
    if(this.products) {
      this.products.sort((product1: ProductModel, product2: ProductModel) => {
        let returnVal = 0
        if(product1.name && product2.name) {
          if(product1.name < product2.name) {
            returnVal = -1
          }
          else if(product1.name > product2.name) {
            returnVal = 1
          }
        }
        return returnVal
      })
    }
  }

  private sortProductsByPrice() {
    if(this.products) {
      this.products.sort((product1: ProductModel, product2: ProductModel) => {
        let returnVal = 0
        if(product1.price && product2.price) {
          if(product1.price < product2.price) {
            returnVal = -1
          }
          else if(product1.price > product2.price) {
            returnVal = 1
          }
        }
        return returnVal
      })
    }
  }

  ngOnDestroy(): void {
    if(this.paramsSubscription) {
      this.paramsSubscription.unsubscribe()
    }
    if(this.productsSubscription) {
      this.productsSubscription.unsubscribe()
    }
  }

}
