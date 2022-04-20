import React from "react";
import facebookSrc from "../../assets/images/facebook.svg";
import instagramSrc from "../../assets/images/instagram.svg";
import twitterSrc from "../../assets/images/twitter.svg";
import "./socialMediaBar.scss";

const FACEBOOK_URL = "/facebook";
const INSTAGRAM_URL = "/instagram";
const TWITTER_URL = "/twitter";

const SocialMediaBar = () => {
  return (
    <div className="social-media-bar">
      <a href={FACEBOOK_URL} target="__blank" referrerPolicy="no-referrer">
        <img src={facebookSrc} />
      </a>
      <a href={INSTAGRAM_URL} target="__blank" referrerPolicy="no-referrer">
        <img src={instagramSrc} />
      </a>
      <a
        className="twitter-link"
        href={TWITTER_URL}
        target="__blank"
        referrerPolicy="no-referrer"
      >
        <img src={twitterSrc} />
      </a>
    </div>
  );
};

export default SocialMediaBar;
