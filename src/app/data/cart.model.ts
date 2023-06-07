import {CartEntryModel} from "./cartentry.model";
import {AddressModel} from "./address.model";

export class CartModel {

  id: string
  version: number
  customerId: string
  entries : CartEntryModel[] = []
  deliveryAddress: AddressModel
  totalPrice: number
  totalTax: number

}
