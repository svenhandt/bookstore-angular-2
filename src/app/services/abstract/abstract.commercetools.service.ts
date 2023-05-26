import {CommercetoolsApiService} from "../infrastructure/commercetools.api.service";
import {
  ByProjectKeyRequestBuilder
} from "@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder";

export abstract class AbstractCommercetoolsService {

  private _apiRoot: ByProjectKeyRequestBuilder

  protected constructor(protected commercetoolsApiService: CommercetoolsApiService) {
    this.commercetoolsApiService.apiRoot$.subscribe((apiRoot: ByProjectKeyRequestBuilder) => {
      this._apiRoot = apiRoot
    })
  }

  protected get apiRoot() {
    return this._apiRoot
  }

}
