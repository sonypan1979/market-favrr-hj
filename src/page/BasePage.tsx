import React, {
  CSSProperties,
  HTMLProps,
  PropsWithChildren,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";
import TickersBar from "../components/assets/TickersBar";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import "./basePage.scss";

const BasePage = (
  props: PropsWithChildren<
    HTMLProps<unknown> & {
      displayFooter?: boolean;
      style?: CSSProperties;
      contentStyle?: CSSProperties;
      logoOnlyHeader?: boolean;
      header?: JSX.Element | null;
    }
  >
) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);
  return (
    <div className={`base-page ${props.className || ""}`} style={props.style}>
      <div className="header-container">
        {props.header || <Header logoOnly={props.logoOnlyHeader} />}
      </div>
      <div className="base-page-content" style={props.contentStyle}>
        {props.children}
      </div>
      {props.displayFooter != false && <Footer />}
    </div>
  );
};

export default BasePage;
