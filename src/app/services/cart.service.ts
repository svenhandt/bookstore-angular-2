import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {CartModel} from "../data/cart.model";
import {BehaviorSubject} from "rxjs";
import {ProductModel} from "../data/product.model";
import {CartEntryModel} from "../data/cartentry.model";
import {Attribute, Cart, ClientResponse, LineItem, MyCartUpdateAction, Price} from "@commercetools/platform-sdk";
import {CommercetoolsApiService} from "./infrastructure/commercetools.api.service";
import {AbstractCommercetoolsService} from "./abstract/abstract.commercetools.service";
import {AddressModel} from "../data/address.model";

@Injectable({
  providedIn: 'root'
})
export class CartService extends AbstractCommercetoolsService {

  private cartSubject = new BehaviorSubject<CartModel>(new CartModel())
  currentCart$ = this.cartSubject.asObservable()

  constructor(@Inject(LOCALE_ID) private locale: string,
              commercetoolsApiService: CommercetoolsApiService) {
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

  removeFromCart(cartEntry: CartEntryModel) {
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
    cart.id = rawCart.id
    cart.version = rawCart.version
    cart.customerId = rawCart.anonymousId
    this.buildCartEntries(cart, rawCart)
    this.buildDeliveryAddress(cart, rawCart)
    cart.totalPrice = this.getPriceAmount(rawCart.totalPrice)
    this.setTotalTax(cart, rawCart)
    console.log(cart)
    this.cartSubject.next(cart)
  }

  private buildCartEntries(cart: CartModel, rawCart: Cart) {
    const lineItems: LineItem[] = rawCart.lineItems
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

  private buildDeliveryAddress(cart: CartModel, rawCart: Cart) {
    const rawDeliveryAddress = rawCart.shippingAddress
    if(rawDeliveryAddress) {
      const deliveryAddress = new AddressModel()
      deliveryAddress.id = rawDeliveryAddress.id
      deliveryAddress.country = rawDeliveryAddress.country
      deliveryAddress.firstName = rawDeliveryAddress.firstName
      deliveryAddress.lastName = rawDeliveryAddress.lastName
      deliveryAddress.street = rawDeliveryAddress.streetName
      deliveryAddress.streetNumber = rawDeliveryAddress.streetNumber
      deliveryAddress.zipCode = rawDeliveryAddress.postalCode
      deliveryAddress.town = rawDeliveryAddress.city
      cart.deliveryAddress = deliveryAddress
    }
  }


  private setProductForCartEntry(cartEntry: CartEntryModel, lineItem: LineItem) {
    const product = new ProductModel()
    product.id = lineItem.productId
    product.name = lineItem.name[this.locale]
    product.price = this.getPriceAmount(lineItem.price)
    this.setAuthor(product, lineItem)
    this.setIsbn(product, lineItem)
    this.setImage(product, lineItem)
    cartEntry.product = product
  }

  private setAuthor(product: ProductModel, lineItem: LineItem) {
    if(lineItem.variant) {
      lineItem.variant.attributes
      const authorData = lineItem.variant.attributes.find((attribute: Attribute) => {
        return attribute.name === 'author'
      })
      if (authorData) {
        product.author = authorData.value
      }
    }
  }

  private setIsbn(product: ProductModel, lineItem: LineItem) {
    if(lineItem.variant) {
      const isbnData = lineItem.variant.attributes.find((attribute: Attribute) => {
        return attribute.name === 'isbn'
      })
      if (isbnData) {
        product.isbn = isbnData.value
      }
    }
  }

  private setImage(product: ProductModel, lineItem: LineItem) {
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

  private setTotalTax(cart: CartModel, rawCart: Cart) {
    const rawTaxedPrice = rawCart.taxedPrice
    if(rawTaxedPrice) {
      const rawTotalTax = rawTaxedPrice.totalTax
      if(rawTotalTax && rawTotalTax.centAmount) {
        cart.totalTax = rawTotalTax.centAmount / 100
      }
    }
  }

}
