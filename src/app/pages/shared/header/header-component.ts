import {Component, OnInit, ViewChild} from '@angular/core';
import {CategoryService} from "../../../services/category.service";
import {combineLatest, map, Observable, startWith} from "rxjs";
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {CartService} from "../../../services/cart.service";
import {CartModel} from "../../../data/cart.model";
import {Category} from "@commercetools/platform-sdk";
import {CustomerService} from "../../../services/customer.service";
import {CustomerModel} from "../../../data/customer.model";
import {CurrentPageService} from "../../../services/infrastructure/current-page.service";

interface HeaderComponentData {
  categories: Category[]
  selectedCategory: Category
  currentCart: CartModel
  currentCustomer: CustomerModel
  onCheckoutPage: boolean
}

@Component({
  selector: 'app-header',
  templateUrl: './header-component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  headerComponentData$: Observable<HeaderComponentData>
  categories$: Observable<Category[]>
  selectedCategory$: Observable<Category>
  currentCart$: Observable<CartModel>
  currentCustomer$: Observable<CustomerModel>

  @ViewChild('searchForm', {static: false}) searchForm: NgForm

  constructor(private categoryService: CategoryService,
              private cartService: CartService,
              private customerService: CustomerService,
              private currentPageService: CurrentPageService,
              private router: Router) { }

  ngOnInit(): void {
    const categories$ = this.categoryService.categories$.pipe(
      startWith([])
    )
    const selectedCategory$ = this.categoryService.selectedCategory$.pipe(
      startWith(null)
    )
    const currentCart$ = this.cartService.currentCart$.pipe(
      startWith(null)
    )
    const currentCustomer$ = this.customerService.currentCustomer$.pipe(
      startWith(null)
    )
    const onCheckoutPage$ = this.currentPageService.isCheckoutPage$.pipe(
      startWith(false)
    )
    this.headerComponentData$ = combineLatest([categories$, selectedCategory$, currentCart$, currentCustomer$, onCheckoutPage$])
      .pipe(
        map(([categories, selectedCategory, currentCart, currentCustomer, onCheckoutPage]) => {
          return {
            categories: categories,
            selectedCategory: selectedCategory,
            currentCart: currentCart,
            currentCustomer: currentCustomer,
            onCheckoutPage: onCheckoutPage
          }
        })
      )
    this.cartService.retrieveCurrentCart()
  }

  onNavigateToCategory(category: Category) {
    this.router.navigate(['/product-list'],
      {queryParams: {
        category: category.key
        }})
    this.categoryService.setSelectedCategory(category.key)
  }

  onLogout() {
    this.customerService.logoutCurrentCustomer()
    this.router.navigate(['/login-register'])
    this.resetSelectedCategory()
  }

  onSubmitSearchForm() {
    if(this.searchForm) {
      const input = this.searchForm.value.searchInput
      if(input) {
        this.router.navigate(['/product-list'],
          {queryParams: {
              q: input
            }})
        this.resetSelectedCategory()
      }
    }

  }

  getCurrentCartLength(cart: CartModel | null) {
    let result = 0
    if(cart && cart.entries)  {
      result = cart.entries.length
    }
    return result
  }

  resetSelectedCategory() {
    this.categoryService.setSelectedCategory(null)
  }

}
