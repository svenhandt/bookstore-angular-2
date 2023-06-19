import { Injectable } from '@angular/core';
import {AbstractCommercetoolsService} from "./abstract/abstract.commercetools.service";
import {CommercetoolsApiService} from "./infrastructure/commercetools.api.service";
import {CartModel} from "../data/cart.model";
import {Cart, ClientResponse, MyOrderFromCartDraft, Order} from "@commercetools/platform-sdk";
import {BehaviorSubject, Observable} from "rxjs";
import {OrderModel} from "../data/order.model";
import {AbstractOrderService} from "./abstract.order.service";

@Injectable({
  providedIn: 'root'
})
export class OrderService extends AbstractCommercetoolsService {

  constructor(commercetoolsApiService: CommercetoolsApiService,
              private abstractOrderService: AbstractOrderService) {
    super(commercetoolsApiService)
  }

  createOrderFromCart(currentCart: CartModel): Observable<OrderModel> {
    const myOrderFromCartDraft: MyOrderFromCartDraft = {
      id: currentCart.id,
      version: currentCart.version
    }
    return new Observable(observer => {
      this.apiRoot
        .me()
        .orders()
        .post({
          body: myOrderFromCartDraft
        })
        .execute()
        .then(({body}: ClientResponse<Order>) => {
          const order = this.createOrder(body)
          console.log(order)
          observer.next(order)
          observer.complete()
        })
        .catch(error => {
          observer.error(error)
        })
    })
  }

  private createOrder(rawOrder: Order): OrderModel {
    const order = new OrderModel()
    this.abstractOrderService.build(order, rawOrder)
    return order
  }

}
