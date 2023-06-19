import {ProductModel} from "./product.model";

export class LineItemModel {

  id: string
  product: ProductModel
  quantity: number
  entryTotalPrice: number

}
