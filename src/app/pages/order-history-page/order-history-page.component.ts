import { Component, OnInit } from '@angular/core';
import {OrderService} from "../../services/order.service";
import {Observable} from "rxjs";
import {OrderModel} from "../../data/order.model";

@Component({
  selector: 'app-order-history-page',
  templateUrl: './order-history-page.component.html',
  styleUrls: ['./order-history-page.component.css']
})
export class OrderHistoryPageComponent implements OnInit {

  orderHistoryList$: Observable<OrderModel[]>

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.orderHistoryList$ = this.orderService.orderHistoryList$
    this.orderService.retrieveOrderHistory()
  }

}
