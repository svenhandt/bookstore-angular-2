import {Inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';
import {LocalizedString} from "@commercetools/platform-sdk";

@Pipe({
  name: 'localized'
})
export class LocalizedPipe implements PipeTransform {

  constructor(@Inject(LOCALE_ID) private locale: string) {
  }

  transform(value: LocalizedString, ...args: unknown[]): string {
    return value[this.locale];
  }

}
