import {Component, OnDestroy, OnInit} from '@angular/core';
import {OrderService} from "../../services/order.service";
import {Observable, Subscription} from "rxjs";
import {ActivatedRoute, Params} from "@angular/router";
import {OrderModel} from "../../data/order.model";

@Component({
  selector: 'app-order-history-details-page',
  templateUrl: './order-history-details-page.component.html',
  styleUrls: ['./order-history-details-page.component.css']
})
export class OrderHistoryDetailsPageComponent implements OnInit, OnDestroy {

  private paramsSubscription: Subscription

  orderDetailsFromHistory$: Observable<OrderModel>

  constructor(private orderService: OrderService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.orderDetailsFromHistory$ = this.orderService.orderDetailsFromHistory$
    this.paramsSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          let orderId = params['id'];
          if(orderId) {
            this.orderService.retrieveOrderDetailsFromHistory(orderId)
          }
        }
      );
  }

  ngOnDestroy(): void {
    this.orderService.resetOrderDetailsFromHistory()
    if(this.paramsSubscription) {
      this.paramsSubscription.unsubscribe()
    }
  }

}
