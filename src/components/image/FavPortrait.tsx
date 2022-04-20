import React from "react";
import { Bixee, BixeeImageVar } from "../../../generated/graphql";
import LikeButton from "../button/LikeButton";
import "./favPortrait.scss";
import ResponsiveImage from "./ResponsiveImage";
import imgPlaceholder from "../../assets/images/img-placeholder.svg";

interface Props {
  image?: Array<BixeeImageVar>;
  fav?: Bixee;
}
const FavPortrait = (props: Props) => {
  const { fav } = props;
  return (
    <div className="fav-portrait">
      {fav && (
        <LikeButton
          isFavorite={fav?.favorite as boolean}
          title={fav.title as string}
          favId={fav.key as string}
        />
      )}
      <ResponsiveImage
        className="fav-image"
        images={props.image}
        defaultImg={imgPlaceholder}
      />
    </div>
  );
};

export default FavPortrait;
