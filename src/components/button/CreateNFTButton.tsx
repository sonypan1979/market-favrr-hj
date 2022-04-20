import React from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import { nftMintPath } from "../../routes/pathBuilder";
import "./createNFTButton.scss";

const CreateNFTButton = (props: { onClicked?: () => void }) => {
  const { onClicked } = props;
  return (
    <Link to={nftMintPath()} className="create-nft-button" onClick={onClicked}>
      <button className="action-button">
        <FormattedMessage defaultMessage={"Create"} />
      </button>
    </Link>
  );
};

export default CreateNFTButton;
