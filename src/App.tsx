import { ApolloProvider, useQuery } from "@apollo/client";
import React, { useRef } from "react";
import { IntlProvider } from "react-intl";
import { EthereumProvider } from "./context/EthereumContext";
import GraphqlProvider from "./context/GraphqlProvider";
import { ResponsiveProvider } from "./context/ResponsiveContext";
import { ScrollBlockProvider } from "./context/ScrollBlockContext";
import { TransactionModalProvider } from "./context/TransactionModalContext";
import { WalletProvider } from "./context/WalletContext";
import useWatchEvents from "./hooks/graphql/useWatchEvents";
import { useWatchResize } from "./hooks/useWatchResize";
import translation from "./localization/en.json";
import ComingSoonPage from "./page/ComingSoonPage";
import AppRouter from "./routes/AppRouters";
import "./style/base.scss";
const EventsWatcher = () => {
  useWatchEvents();
  return null;
};
const App = () => {
  useWatchResize({ debouncer: 200 });
  return (
    <IntlProvider messages={translation} locale="en">
      <GraphqlProvider>
        <ScrollBlockProvider>
          <WalletProvider>
            <EthereumProvider>
              <EventsWatcher />
              <TransactionModalProvider>
                <ResponsiveProvider>
                  <AppRouter />
                </ResponsiveProvider>
              </TransactionModalProvider>
            </EthereumProvider>
          </WalletProvider>
        </ScrollBlockProvider>
      </GraphqlProvider>
    </IntlProvider>
  );
};

export default App;
