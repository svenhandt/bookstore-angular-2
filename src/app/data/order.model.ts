import {AbstractOrderModel} from "./abstract.order.model";

export class OrderModel extends AbstractOrderModel {

  orderState: 'Open' | 'Confirmed' | 'Complete' | 'Cancelled'

}
