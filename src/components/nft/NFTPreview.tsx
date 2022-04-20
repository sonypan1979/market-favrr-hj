import Big from "big.js";
import React from "react";
import { FormattedMessage } from "react-intl";
import imgPlaceholderSrc from "../../assets/images/img-placeholder.svg";
import profileSrc from "../../assets/images/profile-placeholder.svg";
import oceanaProfileSrc from "../../assets/images/oceana-placeholder.svg";
import "./NFTPreview.scss";

interface Props {
  mediaUrl?: string | null;
  name?: string;
  price?: Big;
}
const NFTPreview = (props: Props) => {
  const { mediaUrl, name, price } = props;
  return (
    <div className="nft-preview">
      {mediaUrl ? (
        <>
          <div className="image-container">
            <img className="nft-media" src={mediaUrl} />
            <img
              className="creator-avatar"
              src={
                process.env.OCEANA_ENV == "true" ? oceanaProfileSrc : profileSrc
              }
            />
          </div>
          <div className="nft-info">
            <span className="nft-name">{name || ""}</span>
            <div className="nft-price">{`${new Big(price || 0).round(
              4
            )} ETH`}</div>
          </div>
          <hr className="bottom-hr" />
        </>
      ) : (
        <div className="empty-media-container">
          <img src={imgPlaceholderSrc} />
          <div>
            <FormattedMessage defaultMessage="Upload a file to preview your NFT." />
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTPreview;
