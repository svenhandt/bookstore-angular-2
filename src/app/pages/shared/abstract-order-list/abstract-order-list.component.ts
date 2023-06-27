import {Component, Input, OnInit} from '@angular/core';
import {AbstractOrderModel} from "../../../data/abstract.order.model";

@Component({
  selector: 'app-abstract-order-list',
  templateUrl: './abstract-order-list.component.html',
  styleUrls: ['./abstract-order-list.component.css']
})
export class AbstractOrderListComponent implements OnInit {

  @Input()
  abstractOrder: AbstractOrderModel

  constructor() { }

  ngOnInit(): void {
  }

}
