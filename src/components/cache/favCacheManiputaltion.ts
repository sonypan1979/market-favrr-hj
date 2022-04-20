import { ApolloClient, InMemoryCache } from "@apollo/client";
export const addFavoriteCache = (
  apolloClient: ApolloClient<InMemoryCache>,
  favId: string
) => {
  const cacheId = apolloClient.cache.identify({
    __typename: "Bixee",
    id: favId,
  });
};

export const removeFavoriteCache = (
  apolloClient: ApolloClient<InMemoryCache>,
  favId: string
) => {
  const cacheId = apolloClient.cache.identify({
    __typename: "Bixee",
    id: favId,
  });
};
