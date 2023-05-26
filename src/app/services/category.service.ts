import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Category, CategoryPagedQueryResponse, ClientResponse} from "@commercetools/platform-sdk";
import {CommercetoolsApiService} from "./infrastructure/commercetools.api.service";
import {
  ByProjectKeyRequestBuilder
} from "@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder";


@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private categories: Category[] = []
  private selectedCategory: Category

  categoriesSubject = new BehaviorSubject<Category[]>([])
  selectedCategorySubject = new BehaviorSubject<Category>(null)

  categories$ = this.categoriesSubject.asObservable()
  selectedCategory$ = this.selectedCategorySubject.asObservable()

  constructor(@Inject(LOCALE_ID) private locale: string,
              private commercetoolsApiService: CommercetoolsApiService) {
    this.commercetoolsApiService.apiRoot$.subscribe((apiRoot: ByProjectKeyRequestBuilder) => {
      this.loadAllCategories(apiRoot)
    })
  }



  loadAllCategories(apiRoot: ByProjectKeyRequestBuilder) {
    apiRoot
      .categories()
      .get()
      .execute()
      .then(({body}: ClientResponse<CategoryPagedQueryResponse>) => {
        this.categories = body.results
        this.categoriesSubject.next(this.categories)
      })
  }

  categoriesLoaded() {
    return this.categories.length > 0
  }

  setSelectedCategory(key: string) {
    if(!key) {
      this.selectedCategory = null
    }
    if(this.categories && key) {
      this.selectedCategory = this.categories.find(category => {
        return key === category.key
      })
    }
    this.selectedCategorySubject.next(this.selectedCategory)
  }

}
