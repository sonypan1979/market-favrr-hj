import React from "react";
import ComingSoonPanel from "../components/landing/ComingSoonPanel";
import TermsText from "../components/text/TermsText";
import androidScreenshotSrc from "../assets/images/android-screenshot.png";
import oceanaAndroidScreenshotSrc from "../assets/images/oceana-android-screenshot.png";
import "./comingSoonPage.scss";
import Logo from "../components/logo/Logo";

const ComingSoonPage = () => {
  return (
    <div className="coming-soon-page">
      <Logo />
      <ComingSoonPanel />
      <div
        className={`screenshot-container ${
          process.env.OCEANA_ENV == "true" ? "oceana" : ""
        }`}
      >
        <img
          src={
            process.env.OCEANA_ENV == "true"
              ? oceanaAndroidScreenshotSrc
              : androidScreenshotSrc
          }
        />
      </div>
      <div className="terms-of-use">
        <TermsText />
      </div>
    </div>
  );
};

export default ComingSoonPage;
