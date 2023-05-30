import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {createApiBuilderFromCtpClient} from "@commercetools/platform-sdk";
import {
  AnonymousAuthMiddlewareOptions,
  AuthMiddlewareOptions,
  ClientBuilder,
  HttpMiddlewareOptions,
  PasswordAuthMiddlewareOptions,
  TokenCacheOptions,
  TokenStore
} from "@commercetools/sdk-client-v2";
import {environment} from "../../../environments/environment";
import fetch from "node-fetch";
import {CustomerModel} from "../../data/customer.model";
import {
  ByProjectKeyRequestBuilder
} from "@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder";

@Injectable({
  providedIn: 'root'
})
export class CommercetoolsApiService {

  apiRootSubject = new BehaviorSubject<ByProjectKeyRequestBuilder>(null)
  apiRoot$ = this.apiRootSubject.asObservable()

  constructor() {
    this.buildApiRoot()
  }

  buildApiRoot() {
    let ctpClient = new ClientBuilder()
      .withProjectKey(environment.projectKey)// .withProjectKey() is not required if the projectKey is included in authMiddlewareOptions
      .withClientCredentialsFlow(this.getAuthMiddlewareOptions())
      .withHttpMiddleware(this.getHttpMiddlewareOptions())
      .withLoggerMiddleware() // Include middleware for logging
    ctpClient = this.addSessionFlow(ctpClient)
    const apiRoot = createApiBuilderFromCtpClient(ctpClient.build())
      .withProjectKey({projectKey: environment.projectKey})
    this.apiRootSubject.next(apiRoot)
  }

  private addSessionFlow(rawCtpClient: ClientBuilder) {
    let resultCtpClient = rawCtpClient
    const currentCustomerStr = localStorage.getItem('current_customer')
    if(currentCustomerStr) {
      const customer: CustomerModel = JSON.parse(currentCustomerStr)
      const passwordAuthMiddlewareOptions = this.getPasswordFlowMiddleware(customer)
      resultCtpClient = resultCtpClient.withPasswordFlow(passwordAuthMiddlewareOptions)
    }
    else {
      const anonymousAuthMiddlewareOptions = this.getAnonymousSessionFlowMiddleware()
      resultCtpClient = resultCtpClient.withAnonymousSessionFlow(anonymousAuthMiddlewareOptions)
    }
    return resultCtpClient
  }

  private getPasswordFlowMiddleware(customer: CustomerModel) {
    CommercetoolsApiService.clearTokenCache()
    const passwordAuthMiddlewareOptions: PasswordAuthMiddlewareOptions = {
      host: environment.authHost,
      projectKey: environment.projectKey,
      credentials: {
        clientId: environment.clientId,
        clientSecret: environment.clientSecret,
        user: {
          username: customer.email,
          password: customer.password
        }
      },
      scopes: environment.scopes,
      fetch,
      tokenCache: this.getTokenStore()
    }
    console.log(passwordAuthMiddlewareOptions)
    console.log(customer.email)
    return passwordAuthMiddlewareOptions
  }

  private getAnonymousSessionFlowMiddleware() {
    CommercetoolsApiService.clearTokenCache()
    const anonymousAuthMiddlewareOptions: AnonymousAuthMiddlewareOptions = {
      host: environment.authHost,
      projectKey: environment.projectKey,
      credentials: {
        clientId: environment.clientId,
        clientSecret: environment.clientSecret,
      },
      scopes: environment.scopes,
      fetch,
      tokenCache: this.getTokenStore()
    };
    return anonymousAuthMiddlewareOptions
  }

  private getAuthMiddlewareOptions() {
    const authMiddlewareOptions: AuthMiddlewareOptions = {
      host: environment.authHost,
      projectKey: environment.projectKey,
      credentials: {
        clientId: environment.clientId,
        clientSecret: environment.clientSecret,
      },
      scopes: environment.scopes,
      fetch,
      tokenCache: this.getTokenStore()
    }
    return authMiddlewareOptions
  }

  private getHttpMiddlewareOptions() {
    const httpMiddlewareOptions: HttpMiddlewareOptions = {
      host: environment.httpHost,
      fetch,
    }
    return httpMiddlewareOptions
  }

  private getTokenStore() {
    const apiTokenCache = {

      set(cache: TokenStore, tokenCacheOptions?: TokenCacheOptions) {
        const currentTokenStore = localStorage.getItem('local_token')
        if(!currentTokenStore) {
          localStorage.setItem('local_token', JSON.stringify(cache))
        }
        else if(!CommercetoolsApiService.tokensAreEqual(currentTokenStore, cache)) {
          localStorage.setItem('local_token', JSON.stringify(cache))
        }
      },

      get(tokenCacheOptions?: TokenCacheOptions) {
        const tokenStoreStr = localStorage.getItem('local_token')
        if(tokenStoreStr) {
          return <TokenStore>JSON.parse(tokenStoreStr)
        }
        else {
          return <TokenStore>{}
        }
      }
    }
    return apiTokenCache
  }

  private static clearTokenCache() {
    localStorage.removeItem('local_token')
  }

  private static tokensAreEqual(localToken: string, newTokenStore: TokenStore): boolean {
    let result = false
    if(newTokenStore) {
      const localTokenStore: TokenStore = JSON.parse(localToken)
      if(localTokenStore.token === newTokenStore.token) {
        result = true
      }
    }
    return result
  }

}
