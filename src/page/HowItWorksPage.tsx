import React, { useContext, useState } from "react";
import { FormattedMessage } from "react-intl";
import BasePage from "./BasePage";
import screenGrabSrc from "../assets/images/screengrab-notifications.png";
import screenGrabMobileSrc from "../assets/images/screengrab-notifications-mobile.png";
import oceanaScreenGrabSrc from "../assets/images/oceana-screengrab-notifications.png";
import oceanaScreenGrabMobileSrc from "../assets/images/oceana-screengrab-notifications-mobile.png";
import { HashLink } from "react-router-hash-link";
import "./howItWorksPage.scss";
import { ResponsiveContext, screenType } from "../context/ResponsiveContext";
import { homePath, howItWorksPath } from "../routes/pathBuilder";
import { Link } from "react-router-dom";
import ScrollTopFloat from "../components/util/ScrollTopFloat";
import { useWallet } from "../context/WalletContext";
import ConnectWalletModal from "../components/wallet/ConnectWalletModal";
import "../style/textPage.scss";

const HowItWorksPage = () => {
  const [displayWalletModal, setDisplayWalletModal] = useState(false);
  const { currentScreenType } = useContext(ResponsiveContext);
  const { isConnected } = useWallet();

  const assetName = process.env.OCEANA_ENV == "true" ? "NFT" : "FAV";
  const assetsName = process.env.OCEANA_ENV == "true" ? "NFTs" : "FAVs";
  return (
    <BasePage className="how-it-works-page text-page">
      {displayWalletModal && (
        <ConnectWalletModal onClose={() => setDisplayWalletModal(false)} />
      )}
      <ScrollTopFloat />
      <div className="get-started-section">
        <h3 className="subtitle">
          <FormattedMessage defaultMessage="HOW IT WORKS" />
        </h3>
        <h1>
          <FormattedMessage defaultMessage="Buy, sell & collect rare social NFTs" />
        </h1>
        {/* <div className="text">
          <FormattedMessage
            defaultMessage="Trade unique digital {assetName} collectables on the {domain} asset exchange."
            values={{
              domain:
                process.env.OCEANA_ENV == "true"
                  ? "Oceana.Market"
                  : "Favrr.Market",
              assetName,
            }}
          />
        </div> */}
        {!isConnected && (
          <button
            className="action-button blue-button"
            onClick={() => setDisplayWalletModal(true)}
          >
            <FormattedMessage defaultMessage="Get Started Now" />
          </button>
        )}
      </div>
      <hr />
      <div className="content-section">
        <div className="section-parahraph">
          <h2 className="section-title">
            <FormattedMessage
              defaultMessage="What's {company} Market?"
              values={{
                company: process.env.OCEANA_ENV == "true" ? "Oceana" : "Favrr",
              }}
            />
          </h2>
          <hr className="title-underline" />
          <div>
            <span>
              <FormattedMessage
                defaultMessage="{domain} is the go-to place to invest in rare social NFTs and opens up a completely new asset class – people."
                values={{
                  domain:
                    process.env.OCEANA_ENV == "true"
                      ? "Oceana.Market"
                      : "Favrr.Market",
                }}
              />
            </span>
            <br />
            <br />
            <span>
              <FormattedMessage
                defaultMessage="Access the Market at <Link>{domain}</Link>"
                values={{
                  Link: (content: any) => (
                    <Link to={homePath()}>{content}</Link>
                  ),
                  domain:
                    process.env.OCEANA_ENV == "true"
                      ? "oceana.market"
                      : "favrr.market",
                }}
              />
            </span>
            <br />
            <br />
            <span>
              <FormattedMessage
                defaultMessage="{domain} allows you to:"
                values={{
                  domain:
                    process.env.OCEANA_ENV == "true"
                      ? "Oceana.Market"
                      : "Favrr.Market",
                }}
              />
            </span>
            <br />
            <br />
            <ul>
              <li>
                <FormattedMessage
                  defaultMessage="<b>Explore</b> the diverse collection of unique collectibles to see what collectibles exist and who owns them."
                  values={{
                    b: (content: any) => <b> {content}</b>,
                  }}
                />
              </li>
              <li>
                <FormattedMessage
                  defaultMessage="<b>Invest</b> and trade unique social NFTs in ETH."
                  values={{
                    b: (content: any) => <b> {content}</b>,
                    assetsName,
                  }}
                />
              </li>
            </ul>
          </div>
        </div>
        <div className="section-parahraph">
          <h2 className="section-title">
            <FormattedMessage defaultMessage="Do I need to log in?" />
          </h2>
          <hr className="title-underline" />
          <div>
            <span>
              <FormattedMessage
                defaultMessage="No, you don't need to log in. A digital wallet will work as your personal account, allowing you to connect from different devices, keeping all your digital assets and progress safe. <Link>What's a wallet?</Link>"
                values={{
                  Link: (content: any) => (
                    <HashLink to={howItWorksPath("wallet")}>{content}</HashLink>
                  ),
                }}
              />
            </span>
          </div>
        </div>
        <div className="section-parahraph">
          <div className="anchor" id="wallet" />
          <h2 className="section-title">
            <FormattedMessage defaultMessage="What's a wallet?" />
          </h2>
          <hr className="title-underline" />
          <div>
            <span>
              <FormattedMessage defaultMessage="Wallets manage all your digital crypto assets. They can be added as either a browser extension or an app on your phone." />
            </span>
            <br />
            <br />
            <span>
              <FormattedMessage
                defaultMessage="Before using {company} Market, connect and log into a digital wallet. We recommend using the <MetaMaskLink>MetaMask</MetaMaskLink> or <CoinBaseLink>Coinbase</CoinBaseLink> wallet."
                values={{
                  MetaMaskLink: (content: any) => (
                    <a
                      href="https://metamask.io/"
                      referrerPolicy="no-referrer"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {content}
                    </a>
                  ),
                  CoinBaseLink: (content: any) => (
                    <a
                      href="https://wallet.coinbase.com/ "
                      referrerPolicy="no-referrer"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {content}
                    </a>
                  ),
                  company:
                    process.env.OCEANA_ENV == "true" ? "Oceana" : "Favrr",
                }}
              />
            </span>
            <br />
            <br />
            <span>
              <FormattedMessage
                defaultMessage="Note: Since all transactions in the Ethereum network have a gas fee that needs to be paid in Ether, be sure to have at least some Ether in your wallet to perform any actions on {company} Market."
                values={{
                  company:
                    process.env.OCEANA_ENV == "true" ? "Oceana" : "Favrr",
                }}
              />
            </span>
          </div>
        </div>
        <div className="section-parahraph">
          <h2 className="section-title">
            <FormattedMessage defaultMessage="How do I buy shares?" />
          </h2>
          <hr className="title-underline" />
          <div>
            <span>
              <FormattedMessage defaultMessage="To buy FAV shares in the Market:" />
            </span>
            <ul>
              <li>
                <FormattedMessage defaultMessage="Browse FAVs to find one on sale that you’d like to buy and click it to open its details." />
              </li>
              <li>
                <FormattedMessage defaultMessage="On it’s details page, click Buy." />
              </li>
              <li>
                <FormattedMessage defaultMessage="Confirm this transaction on your Ethereum client and wait for the network to verify it." />
              </li>
            </ul>
          </div>
        </div>
        <div className="section-parahraph">
          <div className="anchor" id="order-book" />
          <h2 className="section-title">
            <FormattedMessage defaultMessage="What's the order book?" />
          </h2>
          <hr className="title-underline" />
          <div>
            <span>
              <FormattedMessage
                defaultMessage="The order book is used to record the interest of buyers and sellers in the market for a particular asset. On {company}, these assets are social NFTs."
                values={{
                  company:
                    process.env.OCEANA_ENV == "true"
                      ? "Oceana.Market"
                      : "Favrr.Market",
                  assetName,
                }}
              />
            </span>
            <br />
            <br />
            <span>
              <FormattedMessage
                defaultMessage="The order book is arranged by price for <green>buyers</green> and <pink>sellers</pink>. The green orders are buy orders, and the pink orders are sell orders."
                values={{
                  green: (content: any) => (
                    <span className="green">{content}</span>
                  ),
                  pink: (content: any) => (
                    <span className="pink">{content}</span>
                  ),
                }}
              />
            </span>
            <br />
            <br />
            <span>
              <FormattedMessage defaultMessage="Simply put, the order book is a list of the various orders that would be placed at various price levels. Whether you are trading short term or investing for the long haul, understanding and observing the order book will give you a look inside the minds of other community members." />
            </span>
          </div>
        </div>
        <div className="section-parahraph">
          <h2 className="section-title">
            <FormattedMessage defaultMessage="How do I see my activity history?" />
          </h2>
          <hr className="title-underline" />
          <div>
            <span>
              <FormattedMessage defaultMessage="Open the notifications panel by clicking the bell icon at the top of the screen." />
            </span>
            <br />
            <img
              className="screen-grab-img"
              src={
                process.env.OCEANA_ENV == "true"
                  ? currentScreenType == screenType.MOBILE
                    ? oceanaScreenGrabMobileSrc
                    : oceanaScreenGrabSrc
                  : currentScreenType == screenType.MOBILE
                  ? screenGrabMobileSrc
                  : screenGrabSrc
              }
            />
            <br />
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default HowItWorksPage;
