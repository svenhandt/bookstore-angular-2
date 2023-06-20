import {Injectable} from '@angular/core';
import {AbstractCommercetoolsService} from "./abstract/abstract.commercetools.service";
import {CommercetoolsApiService} from "./infrastructure/commercetools.api.service";
import {CartModel} from "../data/cart.model";
import {Cart, ClientResponse, MyOrderFromCartDraft, Order} from "@commercetools/platform-sdk";
import {BehaviorSubject, Observable} from "rxjs";
import {OrderModel} from "../data/order.model";
import {AbstractOrderService} from "./abstract.order.service";
import {CartService} from "./cart.service";
import {PaymentService} from "./payment.service";

@Injectable({
  providedIn: 'root'
})
export class OrderService extends AbstractCommercetoolsService {

  constructor(commercetoolsApiService: CommercetoolsApiService,
              private abstractOrderService: AbstractOrderService,
              private cartService: CartService,
              private paymentService: PaymentService) {
    super(commercetoolsApiService)
  }

  private createdOrderSubject = new BehaviorSubject<OrderModel>(null)
  createdOrder$ = this.createdOrderSubject.asObservable()

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
        this.handleCreateOrderResponseSuccess(body)
      })
      .catch(error => {
          this.createdOrderSubject.error(error)
      })
  }

  private handleCreateOrderResponseSuccess(rawOrder: Order) {
    const order = this.createOrder(rawOrder)
    this.cartService.retrieveCurrentCart()
    this.paymentService.resetAll()
    this.createdOrderSubject.next(order)
  }

  private createOrder(rawOrder: Order): OrderModel {
    const order = new OrderModel()
    this.abstractOrderService.build(order, rawOrder)
    this.setOrderState(order, rawOrder)
    return order
  }

  private setOrderState(order: OrderModel, rawOrder: Order) {
    const rawOrderState = rawOrder.orderState as 'Open' | 'Confirmed' | 'Cancelled' | 'Complete'
    order.orderState = rawOrderState
  }

}
