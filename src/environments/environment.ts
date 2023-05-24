// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  projectKey: 'bookstore-17091979',
  scopes: ['manage_my_business_units:bookstore-17091979',
    'create_anonymous_token:bookstore-17091979',
    'view_categories:bookstore-17091979',
    'manage_my_shopping_lists:bookstore-17091979',
    'manage_my_profile:bookstore-17091979',
    'manage_my_orders:bookstore-17091979',
    'manage_my_payments:bookstore-17091979',
    'manage_my_quotes:bookstore-17091979',
    'view_published_products:bookstore-17091979',
    'manage_my_quote_requests:bookstore-17091979'],
  authHost: 'https://auth.europe-west1.gcp.commercetools.com',
  clientId: 'uYOjDoM2bWIyOgTXh_qTRF4A',
  clientSecret: 'dMCyDGXWXZP45KwJXFTQsIq91CwykGUM',
  httpHost: 'https://api.europe-west1.gcp.commercetools.com'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
