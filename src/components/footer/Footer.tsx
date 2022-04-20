import React, { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router-dom";
import commons from "../../localization/commons";
import {
  howItWorksPath,
  portfolioPath,
  termsPath,
  privacyPath,
  homePath,
  nftMintPath,
} from "../../routes/pathBuilder";
import Accordion from "../layout/Accordion";
import Logo from "../logo/Logo";
import chevronSrc from "../../assets/images/chevron.svg";
import "./footer.scss";
import SocialMediaBar from "../social/SocialMediaBar";
import { ResponsiveContext, screenType } from "../../context/ResponsiveContext";
import { useWallet } from "../../context/WalletContext";
import ConnectWalletModal from "../wallet/ConnectWalletModal";

const Footer = () => {
  const intl = useIntl();
  const { currentScreenType } = useContext(ResponsiveContext);

  const { isConnected } = useWallet();
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  return (
    <>
      <div className="footer">
        <div className="links-section">
          <div className="section">
            <Logo className="footer-section-title" />
            <span className="footer-title">
              <FormattedMessage defaultMessage="The people economy" />
            </span>
          </div>
          <hr className="accordion-hr" />
          <Accordion
            className="section"
            accordionHeader={({ expanded, setExpanded }) => (
              <div
                className="footer-section-title"
                onClick={() => setExpanded(!expanded)}
              >
                {process.env.OCEANA_ENV == "true" ? (
                  <FormattedMessage defaultMessage="Market" />
                ) : (
                  <FormattedMessage defaultMessage="FAVs" />
                )}
                <img className="chevron" src={chevronSrc} />
              </div>
            )}
            alwaysDisplay={currentScreenType != screenType.MOBILE}
          >
            <>
              <Link to={homePath()} className="accordion-item first-item">
                {intl.formatMessage(commons.explore)}
              </Link>
              {isConnected ? (
                <>
                  <Link to={nftMintPath()} className="accordion-item">
                    <FormattedMessage defaultMessage="Create" />
                  </Link>
                  <Link
                    to={portfolioPath()}
                    className="accordion-item last-item"
                  >
                    {intl.formatMessage(commons.myPortfolio)}
                  </Link>
                </>
              ) : (
                <span
                  className="accordion-item"
                  onClick={() => setIsConnectingWallet(true)}
                >
                  <FormattedMessage defaultMessage="Connect Wallet" />
                </span>
              )}
            </>
          </Accordion>
          <hr className="accordion-hr" />
          <Accordion
            className="section"
            accordionHeader={({ expanded, setExpanded }) => (
              <div
                className="footer-section-title"
                onClick={() => setExpanded(!expanded)}
              >
                {intl.formatMessage(commons.about)}
                <img className="chevron" src={chevronSrc} />
              </div>
            )}
            alwaysDisplay={currentScreenType != screenType.MOBILE}
          >
            {
              <>
                <Link
                  to={howItWorksPath()}
                  className="accordion-item first-item"
                >
                  {intl.formatMessage(commons.howItWorks)}
                </Link>
                <Link to={howItWorksPath()} className="accordion-item">
                  {intl.formatMessage(commons.faq)}
                </Link>
              </>
            }
          </Accordion>
        </div>
        <hr />
        <div className="bottom-section">
          <span className="copyrights-label">
            <FormattedMessage
              defaultMessage={`Copyright © 2021 {companyName} Ltd. All rights reserved.`}
              values={{
                companyName:
                  process.env.OCEANA_ENV == "true" ? "Oceana" : "FAVRR",
              }}
            />
          </span>
          <span className="terms-privacy-container">
            <a
              href={termsPath()}
              style={{ marginRight: "16px" }}
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noreferrer"
            >
              {intl.formatMessage(commons.terms)}
            </a>
            <a
              href={privacyPath()}
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noreferrer"
            >
              {intl.formatMessage(commons.privacy)}
            </a>
          </span>
          {process.env.OCEANA_ENV != "true" && <SocialMediaBar />}
        </div>
      </div>
      {isConnectingWallet && (
        <ConnectWalletModal onClose={() => setIsConnectingWallet(false)} />
      )}
    </>
  );
};

export default Footer;
