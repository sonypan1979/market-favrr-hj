import React, { CSSProperties } from "react";
import "./loader.scss";
import { ReactComponent as LoadIcon } from "../../assets/images/loader.svg";
import { ReactComponent as OceanaCoin } from "../../assets/images/oceana-coin.svg";

const Loader = (props: { style?: CSSProperties }) => {
  return process.env.OCEANA_ENV == "true" ? (
    <OceanaCoin className="loader oceana" style={props.style} />
  ) : (
    <LoadIcon className="loader" style={props.style} />
  );
  //   return <div className="loader"></div>;
};
// 353945
export default Loader;
