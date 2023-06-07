import {Component, OnInit} from '@angular/core';
import {CurrentPageService} from "./services/infrastructure/current-page.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'bookstore';

  currentComponentName$: Observable<string>

  constructor(private currentPageService: CurrentPageService) {

  }

  ngOnInit(): void {
    this.currentComponentName$ = this.currentPageService.currentComponentName$
  }

  isCheckoutPage(componentName: string) {
    if(!componentName) {
      return false
    }
    else {
      return this.currentPageService.isCheckoutPage(componentName)
    }
  }

}
