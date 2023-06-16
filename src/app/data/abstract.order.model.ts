import {CartEntryModel} from "./cartentry.model";
import {AddressModel} from "./address.model";
import {Money} from "@commercetools/platform-sdk";

export abstract class AbstractOrderModel {

  id: string
  version: number
  customerId: string
  entries : CartEntryModel[] = []
  deliveryAddress: AddressModel
  totalPriceAsMoney: Money
  totalPrice: number
  totalTax: number

}
