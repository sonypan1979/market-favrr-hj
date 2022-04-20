import React, { PropsWithChildren } from "react";
import infoIcon from "../../assets/images/info-purple.svg";
import infoIconPink from "../../assets/images/info-pink.svg";
import "./infoBox.scss";

const InfoBox = (
  props: PropsWithChildren<{ className: string; pink?: boolean }>
) => {
  const { className, pink } = props;
  return (
    <div className={`info-box ${className || ""} ${pink ? "pink" : ""}`}>
      <img src={pink ? infoIconPink : infoIcon} />
      <span className="transaction-info">{props.children}</span>
    </div>
  );
};

export default InfoBox;
