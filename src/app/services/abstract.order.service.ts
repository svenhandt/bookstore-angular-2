import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {AbstractOrderModel} from "../data/abstract.order.model";
import {Attribute, Cart, LineItem, Order} from "@commercetools/platform-sdk";
import {LineItemModel} from "../data/lineItemModel";
import {AddressModel} from "../data/address.model";
import {ProductModel} from "../data/product.model";

@Injectable({
  providedIn: 'root'
})
export class AbstractOrderService {

  constructor(@Inject(LOCALE_ID) private locale: string) { }

  public build(abstractOrder: AbstractOrderModel, rawAbstractOrder: Cart | Order) {
    abstractOrder.id = rawAbstractOrder.id
    abstractOrder.version = rawAbstractOrder.version
    abstractOrder.customerId = rawAbstractOrder.anonymousId
    this.buildAbstractOrderEntries(abstractOrder, rawAbstractOrder)
    this.buildDeliveryAddress(abstractOrder, rawAbstractOrder)
    this.setTotalPrice(abstractOrder, rawAbstractOrder)
    this.setTotalTax(abstractOrder, rawAbstractOrder)
  }

  private buildAbstractOrderEntries(abstractOrder: AbstractOrderModel, rawAbstractOrder: Cart | Order) {
    const rawLineItems: LineItem[] = rawAbstractOrder.lineItems
    if(rawLineItems) {
      for(const rawLineItem of rawLineItems) {
        const lineItem : LineItemModel = new LineItemModel()
        lineItem.id = rawLineItem.id
        this.setProductForCartEntry(lineItem, rawLineItem)
        lineItem.quantity = rawLineItem.quantity
        this.setEntryTotalPrice(lineItem, rawLineItem)
        abstractOrder.entries.push(lineItem)
      }
    }
  }

  private buildDeliveryAddress(abstractOrder: AbstractOrderModel, rawAbstractOrder: Cart | Order) {
    const rawDeliveryAddress = rawAbstractOrder.shippingAddress
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
      abstractOrder.deliveryAddress = deliveryAddress
    }
  }


  private setProductForCartEntry(lineItem: LineItemModel, rawLineItem: LineItem) {
    const product = new ProductModel()
    product.id = rawLineItem.productId
    product.name = rawLineItem.name[this.locale]
    this.setEntryProductPrice(product, rawLineItem)
    this.setAuthor(product, rawLineItem)
    this.setIsbn(product, rawLineItem)
    this.setImage(product, rawLineItem)
    lineItem.product = product
  }

  private setAuthor(product: ProductModel, rawLineItem: LineItem) {
    if(rawLineItem.variant) {
      rawLineItem.variant.attributes
      const authorData = rawLineItem.variant.attributes.find((attribute: Attribute) => {
        return attribute.name === 'author'
      })
      if (authorData) {
        product.author = authorData.value
      }
    }
  }

  private setIsbn(product: ProductModel, rawLineItem: LineItem) {
    if(rawLineItem.variant) {
      const isbnData = rawLineItem.variant.attributes.find((attribute: Attribute) => {
        return attribute.name === 'isbn'
      })
      if (isbnData) {
        product.isbn = isbnData.value
      }
    }
  }

  private setImage(product: ProductModel, rawLineItem: LineItem) {
    if(rawLineItem.variant) {
      const images = rawLineItem.variant.images
      if (images && images.length > 0) {
        product.imageUrl = images[0].url
      }
    }
  }

  private setEntryTotalPrice(lineItem: LineItemModel, rawLineItem: LineItem) {
    const rawTotalEntryPrice = rawLineItem.totalPrice
    if(rawTotalEntryPrice && rawTotalEntryPrice.centAmount) {
      lineItem.entryTotalPrice = rawTotalEntryPrice.centAmount / 100
    }
  }

  private setEntryProductPrice(product: ProductModel, rawLineItem: LineItem) {
    const rawProductPrice = rawLineItem.price
    const rawPriceValue = rawProductPrice.value
    if(rawPriceValue && rawPriceValue.centAmount) {
      product.price = rawPriceValue.centAmount / 100
    }
  }

  private setTotalPrice(abstractOrder: AbstractOrderModel, rawAbstractOrder: Cart | Order) {
    const rawTotalPrice = rawAbstractOrder.totalPrice
    if(rawTotalPrice) {
      const centAmount = rawTotalPrice.centAmount
      const currencyCode = rawTotalPrice.currencyCode
      if(centAmount && currencyCode) {
        abstractOrder.totalPrice = centAmount / 100
        abstractOrder.totalPriceAsMoney = {
          centAmount: centAmount,
          currencyCode: currencyCode
        }
      }
    }
  }

  private setTotalTax(cart: AbstractOrderModel, rawAbstractOrder: Cart | Order) {
    const rawTaxedPrice = rawAbstractOrder.taxedPrice
    if(rawTaxedPrice) {
      const rawTotalTax = rawTaxedPrice.totalTax
      if(rawTotalTax && rawTotalTax.centAmount) {
        cart.totalTax = rawTotalTax.centAmount / 100
      }
    }
  }

}
