import React, { useCallback, useRef, useState } from "react";
import { useIntl } from "react-intl";
import categories from "../../constants/categories";
import ScrollShadowOverlay from "../layout/ScrollShadowOverlay";
import "./categoriesPicker.scss";

const CategoriesPicker = (props: {
  selectedCategories: Array<string>;
  setSelectedCategories: (categories: Array<string>) => void;
}) => {
  const intl = useIntl();

  const { selectedCategories, setSelectedCategories } = props;

  interface ButtonProps {
    category: {
      id: null | string;
      message: {
        defaultMessage: string;
      };
    };
  }
  const CategoryButton = useCallback(
    (props: ButtonProps) => {
      const isSelected =
        selectedCategories.find((id) => id == props.category.id) ||
        (selectedCategories.length == 0 && props.category.id == null);
      return (
        <button
          className={`category-button ${isSelected ? "selected" : ""}`}
          onClick={() => {
            if (isSelected) {
              setSelectedCategories(
                selectedCategories.filter((id) => id != props.category.id)
              );
            } else {
              const newSelectedCategories =
                props.category.id == null ? [] : [props.category.id];
              setSelectedCategories(
                newSelectedCategories.length ==
                  Object.keys(categories).length - 1
                  ? []
                  : newSelectedCategories
              );
            }
          }}
        >
          {intl.formatMessage(props.category.message)}
        </button>
      );
    },
    [selectedCategories, setSelectedCategories]
  );
  const scrollRef = useRef<HTMLDivElement | null>(null);
  return (
    <ScrollShadowOverlay
      scrollElementRef={scrollRef}
      className="categories-picker"
      hideVerticalOverlay
    >
      <div className="categories-scroll" ref={scrollRef}>
        <CategoryButton category={categories.all} />
        <CategoryButton category={categories.politicians} />
        <CategoryButton category={categories.celebrities} />
        <CategoryButton category={categories.athletes} />
        <CategoryButton category={categories.entrepreneurs} />
        <CategoryButton category={categories.activists} />
      </div>
    </ScrollShadowOverlay>
  );
};

export default CategoriesPicker;
