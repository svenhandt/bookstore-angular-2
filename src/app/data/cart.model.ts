import {CartEntryModel} from "./cartentry.model";

export class CartModel {

  id: string
  version: number
  customerId: string
  entries : CartEntryModel[] = []
  totalPrice: number
  totalTax: number

}
