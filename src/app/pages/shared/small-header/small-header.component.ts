import { Component, OnInit } from '@angular/core';
import {CurrentPageService} from "../../../services/infrastructure/current-page.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-small-header',
  templateUrl: './small-header.component.html',
  styleUrls: ['./small-header.component.css']
})
export class SmallHeaderComponent implements OnInit {

  isCheckoutPage$: Observable<boolean>

  constructor(private currentPageService: CurrentPageService) { }

  ngOnInit(): void {
    this.isCheckoutPage$ = this.currentPageService.isCheckoutPage$
  }

}
