import { Component } from '@angular/core';
import {CurrentPageService} from "./services/infrastructure/current-page.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'bookstore';

  constructor(private currentPageService: CurrentPageService) {
  }

  isCheckoutPage() {
    return this.currentPageService.isCheckoutPage()
  }

}
