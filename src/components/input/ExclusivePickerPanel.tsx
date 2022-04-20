import React, { useEffect, useRef } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import "./exclusivePickerPanel.scss";

interface Props {
  value: string;
  options: Array<{ value: string; display: string }>;
  onChange: (value: string) => void;
  onClickOutside?: () => void;
}

const ExclusivePickerPanel = (props: Props) => {
  const { options, value, onChange, onClickOutside } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }
    const selectedElement = rootRef.current.querySelector(
      ".selected"
    ) as HTMLButtonElement;
  });

  useClickOutside(rootRef, () => {
    if (onClickOutside) {
      onClickOutside();
    }
  });

  return (
    <div className="exclusive-picker-panel" ref={rootRef}>
      <div className="selected-indicator" />
      {options.map((option, i) => (
        <React.Fragment key={option.value}>
          {i > 0 && <hr />}
          <button
            type="button"
            className={option.value == value ? "selected" : ""}
            onClick={() => onChange(option.value)}
          >
            {option.display}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ExclusivePickerPanel;
