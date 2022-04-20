import React from "react";
import { FormattedMessage } from "react-intl";
import "./progressBar.scss";

const ENDING_SHARES_THRESHOLDS = 0.1;
const ProgressBar = (props: { sharesTotal: number; sharesLeft: number }) => {
  const progress = props.sharesLeft / props.sharesTotal;

  return (
    <>
      <div
        className={`progress-bar ${
          progress > ENDING_SHARES_THRESHOLDS ? "green" : "pink"
        }`}
        style={
          {
            "--progress-percentage": `${progress * 100}%`,
          } as any
        }
      />
      <div
        className={
          progress > ENDING_SHARES_THRESHOLDS
            ? "many-available"
            : "few-available"
        }
      >
        {progress > ENDING_SHARES_THRESHOLDS ? (
          <>
            <span className="remaining-shares">{props.sharesLeft}</span>{" "}
            {props.sharesLeft == props.sharesTotal ? (
              <FormattedMessage defaultMessage="available" />
            ) : (
              <FormattedMessage
                defaultMessage="of {value} IPO Shares Left"
                values={{ value: props.sharesTotal }}
              />
            )}
          </>
        ) : (
          <span>
            <FormattedMessage
              defaultMessage="only {value} IPO Shares Left 🔥"
              values={{ value: props.sharesLeft }}
            />
          </span>
        )}
      </div>
    </>
  );
};

export default ProgressBar;
