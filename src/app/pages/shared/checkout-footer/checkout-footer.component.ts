import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-checkout-footer',
  templateUrl: './checkout-footer.component.html',
  styleUrls: ['./checkout-footer.component.css']
})
export class CheckoutFooterComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {

  }

  onClickBackToCart() {
    this.router.navigate(['/cart'])
  }

}
