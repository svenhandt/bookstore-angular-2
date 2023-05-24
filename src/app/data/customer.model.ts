import {AddressModel} from "./address.model";

export class CustomerModel {

  id: string
  version: number
  email: string
  firstName: string
  lastName: string
  password: string
  address: AddressModel

}
