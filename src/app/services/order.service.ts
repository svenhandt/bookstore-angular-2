import { Injectable } from '@angular/core';
import {AbstractCommercetoolsService} from "./abstract/abstract.commercetools.service";
import {CommercetoolsApiService} from "./infrastructure/commercetools.api.service";
import {CartModel} from "../data/cart.model";
import {Cart, ClientResponse, MyOrderFromCartDraft, Order} from "@commercetools/platform-sdk";
import {BehaviorSubject} from "rxjs";
import {OrderModel} from "../data/order.model";

@Injectable({
  providedIn: 'root'
})
export class OrderService extends AbstractCommercetoolsService {

  private orderCreatedSubject = new BehaviorSubject<OrderModel>(null)
  orderCreated$ = this.orderCreatedSubject.asObservable()

  constructor(commercetoolsApiService: CommercetoolsApiService) {
    super(commercetoolsApiService)
  }

  createOrderFromCart(currentCart: CartModel) {
    const myOrderFromCartDraft: MyOrderFromCartDraft = {
      id: currentCart.id,
      version: currentCart.version
    }
    this.apiRoot
      .me()
      .orders()
      .post({
        body: myOrderFromCartDraft
      })
      .execute()
      .then(({body}: ClientResponse<Order>) => {
        console.log(body)
      })
  }

}
