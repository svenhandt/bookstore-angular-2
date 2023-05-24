import fetch from 'node-fetch';

import {
  AnonymousAuthMiddlewareOptions,
  type AuthMiddlewareOptions,
  ClientBuilder, createAuthForAnonymousSessionFlow,
  type HttpMiddlewareOptions, PasswordAuthMiddlewareOptions, RefreshAuthMiddlewareOptions,
  TokenCacheOptions,
  TokenStore
} from '@commercetools/sdk-client-v2';
import {environment} from "../../../environments/environment";
import {createApiBuilderFromCtpClient} from "@commercetools/platform-sdk";
import {CustomerModel} from "../../data/customer.model";

const projectKey = environment.projectKey;
const scopes = environment.scopes

const apiTokenCache = {

  set(cache: TokenStore, tokenCacheOptions?: TokenCacheOptions) {
    const currentTokenStore = localStorage.getItem('local_token')
    if(!currentTokenStore) {
      localStorage.setItem('local_token', JSON.stringify(cache))
    }
    else if(!tokensAreEqual(currentTokenStore, cache)) {
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

export function clearTokenCache() {
  localStorage.removeItem('local_token')
}

function tokensAreEqual(localToken: string, newTokenStore: TokenStore): boolean {
  let result = false
  if(newTokenStore) {
    const localTokenStore: TokenStore = JSON.parse(localToken)
    if(localTokenStore.token === newTokenStore.token) {
      result = true
    }
  }
  return result
}

// Configure authMiddlewareOptions
const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: environment.authHost,
  projectKey: projectKey,
  credentials: {
    clientId: environment.clientId,
    clientSecret: environment.clientSecret,
  },
  scopes,
  fetch,
  tokenCache: apiTokenCache
};


// Configure httpMiddlewareOptions
const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: environment.httpHost,
  fetch,
};

export function rebuildApiRoot() {
  let ctpClient = new ClientBuilder()
    .withProjectKey(projectKey)// .withProjectKey() is not required if the projectKey is included in authMiddlewareOptions
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .withLoggerMiddleware() // Include middleware for logging
  ctpClient = addSessionFlow(ctpClient)
  console.log(ctpClient)
  apiRoot = createApiBuilderFromCtpClient(ctpClient.build())
    .withProjectKey({projectKey: environment.projectKey})
}

function addSessionFlow(rawCtpClient: ClientBuilder) {
  let resultCtpClient = rawCtpClient
  const currentCustomerStr = localStorage.getItem('current_customer')
  if(currentCustomerStr) {
    const customer: CustomerModel = JSON.parse(currentCustomerStr)
    const passwordAuthMiddlewareOptions = getPasswordFlowMiddleware(customer)
    resultCtpClient = resultCtpClient.withPasswordFlow(passwordAuthMiddlewareOptions)
  }
  else {
    const anonymousAuthMiddlewareOptions = getAnonymousSessionFlowMiddleware()
    resultCtpClient = resultCtpClient.withAnonymousSessionFlow(anonymousAuthMiddlewareOptions)
  }
  return resultCtpClient
}

function getPasswordFlowMiddleware(customer: CustomerModel) {
  clearTokenCache()
  const passwordAuthMiddlewareOptions: PasswordAuthMiddlewareOptions = {
    host: environment.authHost,
    projectKey: projectKey,
    credentials: {
      clientId: environment.clientId,
      clientSecret: environment.clientSecret,
      user: {
        username: customer.email,
        password: customer.password
      }
    },
    scopes,
    fetch,
    tokenCache: apiTokenCache
  }
  console.log(passwordAuthMiddlewareOptions)
  console.log(customer.email)
  return passwordAuthMiddlewareOptions
}

function getAnonymousSessionFlowMiddleware() {
  const anonymousAuthMiddlewareOptions: AnonymousAuthMiddlewareOptions = {
    host: environment.authHost,
    projectKey: projectKey,
    credentials: {
      clientId: environment.clientId,
      clientSecret: environment.clientSecret,
    },
    scopes,
    fetch,
    tokenCache: apiTokenCache
  };
  return anonymousAuthMiddlewareOptions
}

let apiRoot

rebuildApiRoot()

export default  apiRoot



