import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {CartModel} from "../data/cart.model";
import {BehaviorSubject} from "rxjs";
import {ProductModel} from "../data/product.model";
import {LineItemModel} from "../data/lineItemModel";
import {Cart, ClientResponse, MyCartUpdateAction} from "@commercetools/platform-sdk";
import {CommercetoolsApiService} from "./infrastructure/commercetools.api.service";
import {AbstractCommercetoolsService} from "./abstract/abstract.commercetools.service";
import {AddressModel} from "../data/address.model";
import {AbstractOrderService} from "./abstract.order.service";

@Injectable({
  providedIn: 'root'
})
export class CartService extends AbstractCommercetoolsService {

  private cartSubject = new BehaviorSubject<CartModel>(new CartModel())
  currentCart$ = this.cartSubject.asObservable()

  constructor(@Inject(LOCALE_ID) private locale: string,
              commercetoolsApiService: CommercetoolsApiService,
              private abstractOrderService: AbstractOrderService) {
    super(commercetoolsApiService)
  }

  retrieveCurrentCart() {
    this.getActiveCart()
  }

  addToCart(product: ProductModel) {
    this.updateCart([{
      action: 'addLineItem',
      productId: product.id
    }])
  }

  removeFromCart(cartEntry: LineItemModel) {
    this.updateCart([{
      action: 'removeLineItem',
      lineItemId: cartEntry.id
    }])
  }

  setCurrentCart(rawCart: Cart) {
    this.buildCartAndNext(rawCart)
  }

  setBillingAndShippingAddress(address: AddressModel) {
    const billingAndShippingddress = {
      id: address.id,
      country: address.country,
      firstName: address.firstName,
      lastName: address.lastName,
      streetName: address.street,
      streetNumber: address.streetNumber,
      postalCode: address.zipCode,
      city: address.town
    }
    this.updateCart([
      {
        action: 'setBillingAddress',
        address: billingAndShippingddress
      },
      {
        action: 'setShippingAddress',
        address: billingAndShippingddress
      }
    ])
  }

  private updateCart(updateActions: MyCartUpdateAction[]) {
    const currentCart = this.cartSubject.getValue()
    if(currentCart) {
      const id = currentCart.id
      const version = currentCart.version
      if(id && version) {
        this.apiRoot
          .me()
          .carts()
          .withId({ID: id})
          .post({
            body: {
              version: version,
              actions: updateActions
            }
          })
          .execute()
          .then(({body}: ClientResponse<Cart>) => {
            this.getActiveCart()
          })
      }
    }
  }

  private getActiveCart() {
    this.apiRoot
      .me()
      .activeCart()
      .get()
      .execute()
      .then(({body}: any) => {
        this.buildCartAndNext(body)
      })
      .catch(this.createCart.bind(this))
  }

  private createCart() {
    this.apiRoot
      .me()
      .carts()
      .post({
        body: {
          currency: 'EUR'
        }
      })
      .execute()
      .then(({body}: any) => {
        this.buildCartAndNext(body)
      })
  }

  private buildCartAndNext(rawCart: Cart) {
    const cart = new CartModel()
    this.abstractOrderService.build(cart, rawCart)
    console.log(cart)
    this.cartSubject.next(cart)
  }

}
