import { APOLLO_FLAGS, provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { inject, NgModule } from '@angular/core';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';

const uri = 'https://api.disneyapi.dev/graphql'; // <-- add the URL of the GraphQL server here
export function createApollo(): ApolloClientOptions {
  const httpLink = inject(HttpLink);

  return {
    link: httpLink.create({ uri }),
    cache: new InMemoryCache(),
  };
}

@NgModule({
  providers: [
    {
      provide: APOLLO_FLAGS,
      useValue: {
        useInitialLoading: true, // enable it here
      },
    },
    provideApollo(createApollo),
  ],
})
export class GraphQLModule {}
