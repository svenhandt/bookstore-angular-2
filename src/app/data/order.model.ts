import {AbstractOrderModel} from "./abstract.order.model";

export class OrderModel extends AbstractOrderModel {

  orderDate: Date
  orderState: 'Open' | 'Confirmed' | 'Complete' | 'Cancelled'

}
