import {Component, OnDestroy, OnInit} from '@angular/core';
import {CurrentPageService} from "../../services/infrastructure/current-page.service";

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit, OnDestroy {

  months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  years = ['2023', '2024', '2025', '2026', '2027', '2028']

  constructor(private currentPageService: CurrentPageService) { }

  ngOnInit(): void {
    this.currentPageService.setIsCheckoutPage(true)
  }

  ngOnDestroy(): void {
    this.currentPageService.setIsCheckoutPage(false)
  }

}
