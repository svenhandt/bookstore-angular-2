import { Directive } from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from "@angular/forms";

export const expiryDateValidator: ValidatorFn = (control:AbstractControl): ValidationErrors | null => {
  let result: ValidationErrors = {expiryDate: true};
  const expiryMonth = Number(control.get('expiryMonth')?.value) - 1;
  const expiryYear = Number(control.get('expiryYear')?.value);
  let currentDate = new Date();
  if(expiryYear > currentDate.getFullYear()) {
    return null;
  }
  else if(expiryYear === currentDate.getFullYear() && expiryMonth >= currentDate.getMonth()) {
    return null;
  }
  else {
    return result;
  }
}

@Directive({
  selector: '[appExpiryDate]',
  providers: [{provide: NG_VALIDATORS, useExisting: ExpiryDateDirective, multi: true}]
})
export class ExpiryDateDirective implements Validator {

  constructor() { }

  validate(control: AbstractControl): ValidationErrors | null {
    return expiryDateValidator(control);
  }

}
