import React, { HTMLProps } from "react";
import { FormattedMessage } from "react-intl";
import Loader from "../loader/Loader";
import "./loadMoreButton.scss";

const LoadMoreButton = (
  props: HTMLProps<HTMLButtonElement> & { loading?: boolean }
) => {
  return props.loading ? (
    <div
      className="load-mode-button--loading"
      style={{ textAlign: "center", height: 50 }}
    >
      <Loader />
    </div>
  ) : (
    <button
      {...{ ...props, loading: undefined }} //Avoid warnign about loading invalid in dom element
      className={`load-more-button ${props.className || ""}`}
      type={props.type as any}
    >
      <FormattedMessage defaultMessage="More" />
    </button>
  );
};

export default LoadMoreButton;
