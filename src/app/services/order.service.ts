import {Injectable} from '@angular/core';
import {AbstractCommercetoolsService} from "./abstract/abstract.commercetools.service";
import {CommercetoolsApiService} from "./infrastructure/commercetools.api.service";
import {CartModel} from "../data/cart.model";
import {ClientResponse, MyOrderFromCartDraft, Order, OrderPagedQueryResponse} from "@commercetools/platform-sdk";
import {BehaviorSubject} from "rxjs";
import {OrderModel} from "../data/order.model";
import {AbstractOrderService} from "./abstract.order.service";
import {CartService} from "./cart.service";
import {PaymentService} from "./payment.service";
import {CustomerService} from "./customer.service";
import {LAST_CREATED_ORDER} from "../data/constants";

type OrderStateTranslateMapping = {
  [key: string]: string
}

@Injectable({
  providedIn: 'root'
})
export class OrderService extends AbstractCommercetoolsService {

  private orderStateTranslateMapping: OrderStateTranslateMapping = {
    'Open': 'Offen',
    'Confirmed': 'Bestätigt',
    'Cancelled': 'Storniert',
    'Complete': 'Abgeschlossen'
  }

  private createdOrderSubject = new BehaviorSubject<OrderModel>(null)
  createdOrder$ = this.createdOrderSubject.asObservable()

  private orderHistoryListSubject = new BehaviorSubject<OrderModel[]>([])
  orderHistoryList$ = this.orderHistoryListSubject.asObservable()

  private orderDetailsFromHistorySubject = new BehaviorSubject<OrderModel>(null)
  orderDetailsFromHistory$ = this.orderDetailsFromHistorySubject.asObservable()

  constructor(commercetoolsApiService: CommercetoolsApiService,
              private abstractOrderService: AbstractOrderService,
              private cartService: CartService,
              private customerService: CustomerService,
              private paymentService: PaymentService) {
    super(commercetoolsApiService)
    this.setCreatedOrderFromSession()
    this.createCheckOrderSubjectsInterval()
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
        this.handleCreateOrderResponseSuccess(body)
      })
      .catch(error => {
          this.createdOrderSubject.error(error)
      })
  }

  retrieveOrderHistory() {
    const existingOrderHistoryList = this.orderHistoryListSubject.getValue()
    if(!existingOrderHistoryList || existingOrderHistoryList.length === 0) {
      this.retrieveOrderHistoryFromCommercetools()
    }
  }

  retrieveOrderDetailsFromHistory(orderId: string) {
    const orderDetailsFromHistory = this.orderDetailsFromHistorySubject.getValue()
    if(!orderDetailsFromHistory || orderId !== orderDetailsFromHistory.id) {
      this.retrieveOrderDetailsFromCommercetools(orderId)
    }
  }

  setOrderDetailsFromHistory(orderModel: OrderModel) {
    this.orderDetailsFromHistorySubject.next(orderModel)
  }

  resetOrderDetailsFromHistory() {
    this.orderDetailsFromHistorySubject.next(null)
  }

  private retrieveOrderHistoryFromCommercetools() {
    this.apiRoot
      .me()
      .orders()
      .get()
      .execute()
      .then(({body}: ClientResponse<OrderPagedQueryResponse>) => {
        const rawOrders = body.results
        if(rawOrders) {
          this.createOrdersForHistory(rawOrders)
        }
      })
  }

  private retrieveOrderDetailsFromCommercetools(orderId: string) {
    this.apiRoot
      .me()
      .orders()
      .withId({ID: orderId})
      .get()
      .execute()
      .then(({body}: ClientResponse<Order>) => {
        const order = this.createOrder(body)
        this.orderDetailsFromHistorySubject.next(order)
      })
  }

  private setCreatedOrderFromSession() {
    const createdOrderAsStr = localStorage.getItem(LAST_CREATED_ORDER)
    if(createdOrderAsStr) {
      const createdOrder = JSON.parse(createdOrderAsStr) as OrderModel
      this.createdOrderSubject.next(createdOrder)
    }
  }

  private handleCreateOrderResponseSuccess(rawOrder: Order) {
    const order = this.createOrder(rawOrder)
    this.cartService.retrieveCurrentCart()
    this.paymentService.resetAll()
    localStorage.setItem(LAST_CREATED_ORDER, JSON.stringify(order));
    this.createdOrderSubject.next(order)
    this.addToOrderHistory(order)
  }

  private addToOrderHistory(order: OrderModel) {
    const orderHistoryList = this.orderHistoryListSubject.getValue()
    if(orderHistoryList) {
      orderHistoryList.push(order)
      this.orderHistoryListSubject.next(orderHistoryList)
    }
  }

  private createOrdersForHistory(rawOrders: Order[]) {
    const orders: OrderModel[] = []
    for(const rawOrder of rawOrders) {
      orders.push(this.createOrder(rawOrder))
    }
    this.orderHistoryListSubject.next(orders)
  }

  private createOrder(rawOrder: Order): OrderModel {
    const order = new OrderModel()
    this.abstractOrderService.build(order, rawOrder)
    this.setOrderState(order, rawOrder)
    order.orderDate = new Date(rawOrder.createdAt)
    return order
  }

  private setOrderState(order: OrderModel, rawOrder: Order) {
    const rawOrderState = rawOrder.orderState as 'Open' | 'Confirmed' | 'Cancelled' | 'Complete'
    order.orderState = this.orderStateTranslateMapping[rawOrderState]
  }

  private createCheckOrderSubjectsInterval() {
    setInterval(() => {
      this.checkAndCorrectCreatedOrderSubject()
      this.checkAndCorrectOrderHistorySubject()
    }, 2000)
  }

  private checkAndCorrectCreatedOrderSubject() {
    const createdOrderInSession = localStorage.getItem(LAST_CREATED_ORDER)
    const createdOrderInSubject = this.createdOrderSubject.getValue()
    if(!createdOrderInSession && createdOrderInSubject) {
      this.createdOrderSubject.next(null)
    }
  }

  private checkAndCorrectOrderHistorySubject() {
    if(!this.customerService.isCustomerLoggedIn()) {
      this.orderHistoryListSubject.next([])
    }
  }

}
