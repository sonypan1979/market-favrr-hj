import React, { useContext } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import ComingSoonPage from "../page/ComingSoonPage";
import FavPage from "../page/FavPage";
import HomePage from "../page/HomePage";
import HowItWorksPage from "../page/HowItWorksPage";
import NFTMintPage from "../page/NFTMintPage";
import NotificationsPage from "../page/NotificationsPage";
import PortfolioPage from "../page/PortfolioPage";
import PrivacyPage from "../page/PrivacyPage";
import TermsOfServicePage from "../page/TermsOfServicePage";
import { homePath } from "./pathBuilder";

const AppRouter = () => {
  const { isConnected } = useWallet();

  if (process.env.COMING_SOON_WALL == "true") {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <ComingSoonPage />
          </Route>
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  }
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
        <Route path="/portfolio">
          <PortfolioPage />
        </Route>
        <Route path="/notifications">
          <NotificationsPage />
        </Route>
        <Route path="/how-it-works">
          <HowItWorksPage />
        </Route>
        <Route path="/terms-of-service">
          <TermsOfServicePage />
        </Route>
        <Route path="/privacy-policy">
          <PrivacyPage />
        </Route>

        <Route path="/nft/create">
          {isConnected ? <NFTMintPage /> : <Redirect to={homePath()} />}
        </Route>

        <Route exact path="/:favId">
          <FavPage />
        </Route>
        <Route path="/">NOT FOUND</Route>
      </Switch>
    </BrowserRouter>
  );
};

export default AppRouter;
