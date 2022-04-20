import React, { useState } from "react";
import { useIntl } from "react-intl";
import { Link, useRouteMatch } from "react-router-dom";
import { useEthereum } from "../../context/EthereumContext";
import { useWallet } from "../../context/WalletContext";
import commons from "../../localization/commons";
import { homePath, howItWorksPath } from "../../routes/pathBuilder";
import BurgerButton from "../button/BurgerButton";
import ConnectWalletButton from "../button/ConnectWalletButton";
import CreateNFTButton from "../button/CreateNFTButton";
import NotificationsButton from "../button/NotificationsButton";
import SearchButton from "../button/SearchButton";
import Logo from "../logo/Logo";
import UserThumb from "../user/UserThumb";
import "./header.scss";

interface Props {
  logoOnly?: boolean; // Simplified version of header
}
const Header = (props: Props) => {
  const { logoOnly } = props;
  const intl = useIntl();
  const { walletAddresses, isConnected } = useWallet();
  const { path } = useRouteMatch();

  const displayLastCharacters = window.innerWidth > 1024;
  return (
    <div
      className="header"
      style={{ justifyContent: logoOnly ? "center" : undefined }}
    >
      <Logo className="header-section" />
      {!logoOnly && (
        <>
          <div className="header-section explore-section">
            <Link
              className={`explore-link ${/^\/?$/.test(path) ? "active" : ""}`}
              to={homePath()}
            >
              {intl.formatMessage(commons.explore)}
            </Link>
            <Link
              className={`explore-link ${
                path.startsWith(howItWorksPath()) ? "active" : ""
              }`}
              to={howItWorksPath()}
            >
              {intl.formatMessage(commons.howItWorks)}
            </Link>
          </div>
          <div className="header-section right-section">
            {/* <SearchButton /> */}
            {isConnected ? (
              <>
                <NotificationsButton />
                <CreateNFTButton />
                <UserThumb
                  address={walletAddresses ? walletAddresses[0] : ""}
                  displayLastCharacters={displayLastCharacters}
                />
              </>
            ) : (
              <ConnectWalletButton />
            )}
            <BurgerButton />
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
