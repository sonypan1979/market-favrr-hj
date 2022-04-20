import React, { createContext, useContext, useEffect, useState } from "react";
import { ApolloProvider, createHttpLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { PropsWithChildren, useRef } from "react";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getLocalAPIUrl } from "../local-storage/localStorageUtil";

const createMemoryCache = () => {
  return new InMemoryCache({
    typePolicies: {
      EthereumTransaction: {
        keyFields: ["hash"],
      },
      FavStatisticsData: {
        keyFields: [],
      },
      NotificationPayloadOrder: {
        keyFields: ["tx"],
      },
      BixeeImageVar: {
        keyFields: false,
      },
      // Bixee: {
      //   keyFields: ["id"],
      // },
    },
  });
};

interface CustomApolloContextValue {
  setAddressHeader: (token: string | null) => void;
}

export const customApolloContext = createContext<CustomApolloContextValue>({
  setAddressHeader: () => undefined,
});

const GraphqlProvider = (props: PropsWithChildren<unknown>) => {
  const addressRef = useRef<string | null>(null);

  const localStorageAPIUrls = getLocalAPIUrl();

  const apolloClientRef = useRef<ApolloClient<unknown>>(null as any);
  if (apolloClientRef.current == null) {
    const httpLink = createHttpLink({
      uri: localStorageAPIUrls.apiUrl || process.env.GRAPHQL_URL,
    });

    const authLink = setContext((_, { headers }) => {
      // return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          "x-address": addressRef.current || "",
          // ||
          // "0x36A31357B3C777372E00ca70ee159119408e779b",
        },
      };
    });

    const wsLink = new WebSocketLink({
      uri:
        localStorageAPIUrls.apiSubscriptionUrl ||
        process.env.GRAPHQL_SUBSCRIPTION_URL,
      options: {
        reconnect: true,
      },
    });

    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      authLink.concat(httpLink)
    );

    const graphqlClient = new ApolloClient({
      link: splitLink,
      cache: createMemoryCache(),
    });
    apolloClientRef.current = graphqlClient;
  }

  const setAddressHeader = (newAddress: string | null) => {
    if (newAddress == addressRef.current) {
      return;
    }
    addressRef.current = newAddress;
    apolloClientRef.current.resetStore();
  };

  return (
    <customApolloContext.Provider value={{ setAddressHeader }}>
      <ApolloProvider client={apolloClientRef.current}>
        {props.children}
      </ApolloProvider>
    </customApolloContext.Provider>
  );
};

export default GraphqlProvider;
