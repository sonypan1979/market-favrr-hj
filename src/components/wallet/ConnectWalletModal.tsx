import React from "react";
import { createPortal } from "react-dom";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import Modal from "../modal/Modal";
import metamaskIcon from "../../assets/images/metamask.svg";
import coinbaseIcon from "../../assets/images/coinbase.svg";
import closeSrc from "../../assets/images/close.svg";
import "./connectWalletModal.scss";
import { useWallet } from "../../context/WalletContext";
import { WalletType } from "../../constants/wallet";
import Tooltip, { TooltipBody, TooltipTitle } from "../tooltip/Tooltip";
import { Link, useHistory } from "react-router-dom";
import { homePath, howItWorksPath } from "../../routes/pathBuilder";
import { HashLink } from "react-router-hash-link";

const WalletProviderButton = (props: {
  providerImage: string;
  providerName: string;
  extensionInstalled: boolean;
  onClick: () => void;
}) => (
  <a
    className="wallet-provider-button"
    onClick={(e) => {
      if (props.extensionInstalled) {
        e.preventDefault();
      }
      props.onClick();
    }}
    href="https://metamask.io/"
    referrerPolicy="no-referrer"
    target="_blank"
    rel="noreferrer"
  >
    <img className="wallet-icon" src={props.providerImage} />
    <span className="button-label">{props.providerName}</span>
  </a>
);

const intlMessages = defineMessages({
  metamask: {
    defaultMessage: "Metamask",
  },
  coinbase: {
    defaultMessage: "Coinbase Wallet",
  },
});

const ConnectWalletModal = (props: { onClose: () => void }) => {
  const intl = useIntl();
  const { connectWallet, supportedWallets } = useWallet();
  const history = useHistory();
  return (
    <Modal>
      <div className="connect-wallet-modal">
        <h2 className="modal-header">
          <span className="modal-title">
            <FormattedMessage defaultMessage="Connect Wallet" />
          </span>
          <button className="close-button" onClick={props.onClose}>
            <img src={closeSrc} />
          </button>
        </h2>
        <div className="modal-subtitle">
          <FormattedMessage
            defaultMessage="Connect to a wallet below. <WalletTutorial>What’s a wallet?</WalletTutorial>"
            values={{
              WalletTutorial: (content: JSX.Element) => (
                <Tooltip
                  tooltip={
                    <>
                      <TooltipTitle>
                        <FormattedMessage defaultMessage="What's a wallet?" />
                      </TooltipTitle>
                      <TooltipBody>
                        <FormattedMessage
                          defaultMessage="
                          Wallets manage all your digital crypto assets. They can be added as either a browser extension or an app on your phone. <Link>Learn more</Link>"
                          values={{
                            Link: (content: JSX.Element) => (
                              <HashLink
                                to={howItWorksPath("wallet")}
                                className="learn-more"
                                onClick={() => props.onClose()}
                              >
                                {content}
                              </HashLink>
                            ),
                          }}
                        />
                      </TooltipBody>
                    </>
                  }
                  position="top"
                >
                  <span className="text-link">{content}</span>
                </Tooltip>
              ),
            }}
          />
        </div>

        <WalletProviderButton
          extensionInstalled={supportedWallets.includes(WalletType.METAMASK)}
          providerImage={metamaskIcon}
          providerName={intl.formatMessage(intlMessages.metamask)}
          onClick={() => {
            connectWallet(WalletType.METAMASK)?.then(() => {
              props.onClose();
              history.push(homePath());
            });
          }}
        />
        <WalletProviderButton
          providerImage={coinbaseIcon}
          providerName={intl.formatMessage(intlMessages.coinbase)}
          extensionInstalled={supportedWallets.includes(WalletType.COINBASE)}
          onClick={() => {
            connectWallet(WalletType.COINBASE)?.then(() => {
              props.onClose();
            });
          }}
        />
        <div className="disclaimer">
          <FormattedMessage
            defaultMessage="{domain} does not own your private key and cannot access your funds without your confirmation."
            values={{
              domain:
                process.env.OCEANA_ENV == "true"
                  ? "Oceana.Market"
                  : "Favrr.Market",
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ConnectWalletModal;
