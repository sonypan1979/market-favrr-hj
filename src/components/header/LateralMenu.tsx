import React, { useContext, useState } from "react";
import { createPortal } from "react-dom";
import Logo from "../logo/Logo";
import "./lateralMenu.scss";
import closeSrc from "../../assets/images/close.svg";
import {
  homePath,
  howItWorksPath,
  portfolioPath,
} from "../../routes/pathBuilder";
import { useIntl } from "react-intl";
import commons from "../../localization/commons";
import { Link, useLocation } from "react-router-dom";
import ConnectWalletButton from "../button/ConnectWalletButton";
import UserThumb from "../user/UserThumb";
import { useWallet } from "../../context/WalletContext";
import CreateNFTButton from "../button/CreateNFTButton";
import { ResponsiveContext, screenType } from "../../context/ResponsiveContext";

interface Props {
  onClose: () => void;
}

const LateralMenu = (props: Props) => {
  const intl = useIntl();
  const location = useLocation();
  const { walletAddresses } = useWallet();
  return createPortal(
    <div className="lateral-menu">
      <div className="header">
        <Logo />
        <button onClick={props.onClose}>
          <img src={closeSrc} />
        </button>
      </div>
      <Link
        className={`link-row ${
          location.pathname == homePath() ? "selected" : ""
        }`}
        to={homePath()}
      >
        {intl.formatMessage(commons.explore)}
      </Link>
      <Link
        className={`link-row ${
          location.pathname == howItWorksPath() ? "selected" : ""
        }`}
        to={howItWorksPath()}
      >
        {intl.formatMessage(commons.howItWorks)}
      </Link>

      <div className="buttons-container">
        {walletAddresses?.length ? (
          <>
            <CreateNFTButton onClicked={() => props.onClose()} />
            <Link
              className="user-thumb-link"
              to={portfolioPath()}
              onClick={() => props.onClose()}
            >
              <UserThumb
                address={walletAddresses[0]}
                displayLastCharacters={window.innerWidth <= 380}
              />
            </Link>
          </>
        ) : (
          <ConnectWalletButton onConnect={props.onClose} />
        )}
      </div>
    </div>,
    document.querySelector("body") as HTMLBodyElement
  );
};

export default LateralMenu;
