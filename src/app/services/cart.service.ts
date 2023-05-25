import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {CartModel} from "../data/cart.model";
import {BehaviorSubject} from "rxjs";
import {ProductModel} from "../data/product.model";
import {CartEntryModel} from "../data/cartentry.model";
import {Cart, ClientResponse, MyCartUpdateAction} from "@commercetools/platform-sdk";
import {CommercetoolsApiService} from "./commercetools.api.service";
import {AbstractCommercetoolsService} from "./abstract/abstract.commercetools.service";

@Injectable({
  providedIn: 'root'
})
export class CartService extends AbstractCommercetoolsService {

  cartSubject = new BehaviorSubject<CartModel>(new CartModel())
  currentCart$ = this.cartSubject.asObservable()

  constructor(@Inject(LOCALE_ID) private locale: string,
              commercetoolsApiService: CommercetoolsApiService) {
    super(commercetoolsApiService)
  }

  retrieveCurrentCart() {
    this.getActiveCart()
  }

  addToCart(product: ProductModel) {
    this.updateCart({
      action: 'addLineItem',
      productId: product.id
    })
  }

  removeFromCart(cartEntry: CartEntryModel) {
    this.updateCart({
      action: 'removeLineItem',
      lineItemId: cartEntry.id
    })
  }

  private updateCart(updateAction: MyCartUpdateAction) {
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
              actions: [
                updateAction
              ]
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
        console.log(body)
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

  private buildCartAndNext(body: any) {
    const cart = new CartModel()
    cart.id = body.id
    cart.version = body.version
    cart.customerId = body.anonymousId
    this.buildCartEntries(cart, body)
    cart.totalPrice = this.getPriceAmount(body.totalPrice)
    console.log(cart)
    this.cartSubject.next(cart)
  }

  private buildCartEntries(cart: CartModel, body: any) {
    const lineItems: any[] = body.lineItems
    if(lineItems) {
      for(const lineItem of lineItems) {
        const cartEntry : CartEntryModel = new CartEntryModel()
        cartEntry.id = lineItem.id
        this.setProductForCartEntry(cartEntry, lineItem)
        cartEntry.quantity = lineItem.quantity
        cartEntry.entryTotalPrice = this.getPriceAmount(lineItem.totalPrice)
        cart.entries.push(cartEntry)
      }
    }
  }


  private setProductForCartEntry(cartEntry: CartEntryModel, lineItem: any) {
    const product = new ProductModel()
    product.id = lineItem.productId
    product.name = lineItem.name[this.locale]
    product.price = this.getPriceAmount(lineItem.price)
    this.setAuthor(product, lineItem)
    this.setIsbn(product, lineItem)
    this.setImage(product, lineItem)
    cartEntry.product = product
  }

  private setAuthor(product: ProductModel, lineItem: any) {
    if(lineItem.variant) {
      const authorData = lineItem.variant.attributes.find((attribute: any) => {
        return attribute.name === 'author'
      })
      if (authorData) {
        product.author = authorData.value
      }
    }
  }

  private setIsbn(product: ProductModel, lineItem: any) {
    if(lineItem.variant) {
      const isbnData = lineItem.variant.attributes.find((attribute: any) => {
        return attribute.name === 'isbn'
      })
      if (isbnData) {
        product.isbn = isbnData.value
      }
    }
  }

  private setImage(product: ProductModel, lineItem: any) {
    if(lineItem.variant) {
      const images = lineItem.variant.images
      if (images && images.length > 0) {
        product.imageUrl = images[0].url
      }
    }
  }

  private getPriceAmount(priceObj: any) {
    let priceVal: number = 0
    if(priceObj) {
      if(priceObj.value) {
        const priceValueObj = priceObj.value
        if(priceValueObj && priceValueObj.centAmount) {
          priceVal = priceValueObj.centAmount / 100
        }
      }
      else if(priceObj.centAmount) {
        priceVal = priceObj.centAmount / 100
      }
    }
    return priceVal
  }

}
