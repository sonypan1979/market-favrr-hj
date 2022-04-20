import React, { HTMLProps } from "react";
import { Link } from "react-router-dom";
import logoSrc from "../../assets/images/logo.svg";
import oceanaLogoSrc from "../../assets/images/oceana-logo.svg";
import { homePath } from "../../routes/pathBuilder";

const Logo = (props: HTMLProps<unknown>) => {
  return (
    <Link to={homePath()} className={`logo ${props.className || ""}`}>
      <img src={process.env.OCEANA_ENV == "true" ? oceanaLogoSrc : logoSrc} />
    </Link>
  );
};

export default Logo;
