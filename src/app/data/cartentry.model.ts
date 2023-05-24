import {ProductModel} from "./product.model";

export class CartEntryModel {

  id: string
  product: ProductModel
  quantity: number
  entryTotalPrice: number

}
