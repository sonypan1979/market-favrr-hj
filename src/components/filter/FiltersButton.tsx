import React, { useContext, useState } from "react";
import { FormattedMessage } from "react-intl";
import filtersSrc from "../../assets/images/filters.svg";
import expensiveSrc from "../../assets/images/expensive.svg";
import cheapSrc from "../../assets/images/cheap.svg";
import { ResponsiveContext, screenType } from "../../context/ResponsiveContext";
import "./filtersButton.scss";
import SortingPanel from "./SortingPanel";

type SortingOption = "trendy" | "cheap" | "expensive";
const FiltersButton = (props: {
  sorting: SortingOption;
  onChangeSorting: (option: SortingOption) => void;
  includeIPOs: boolean;
  onIncludeIPOsChange: (value: boolean) => void;
}) => {
  const { currentScreenType } = useContext(ResponsiveContext);
  const [expanded, setExpanded] = useState(false);
  return (
    <button
      className="filters-button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setExpanded(!expanded);
      }}
    >
      <img
        className="filter-icon"
        src={
          currentScreenType != screenType.MOBILE || props.sorting == "trendy"
            ? filtersSrc
            : props.sorting == "expensive"
            ? expensiveSrc
            : cheapSrc
        }
        style={{
          margin: currentScreenType == screenType.MOBILE ? "auto" : undefined,
        }}
      />

      {currentScreenType != screenType.MOBILE && (
        <span className="filters-label">
          {props.sorting == "trendy" && (
            <FormattedMessage defaultMessage="Filters" />
          )}
          {props.sorting == "cheap" && (
            <FormattedMessage defaultMessage="Cheap" />
          )}
          {props.sorting == "expensive" && (
            <FormattedMessage defaultMessage="Expensive" />
          )}
        </span>
      )}
      {expanded && (
        <SortingPanel
          sorting={props.sorting}
          onChangeSorting={props.onChangeSorting}
          includeIPOs={props.includeIPOs}
          onIncludeIPOsChange={props.onIncludeIPOsChange}
          onClose={() => setExpanded(false)}
        />
      )}
    </button>
  );
};

export default FiltersButton;
