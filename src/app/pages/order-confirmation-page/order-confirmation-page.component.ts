import {Component, OnDestroy, OnInit} from '@angular/core';
import {OrderService} from "../../services/order.service";
import {Observable} from "rxjs";
import {OrderModel} from "../../data/order.model";

@Component({
  selector: 'app-order-confirmation-page',
  templateUrl: './order-confirmation-page.component.html',
  styleUrls: ['./order-confirmation-page.component.css']
})
export class OrderConfirmationPageComponent implements OnInit, OnDestroy {

  createdOrder$: Observable<OrderModel>

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.createdOrder$ = this.orderService.createdOrder$
  }

  ngOnDestroy(): void {
    this.orderService.resetCreatedOrder()
  }

}
