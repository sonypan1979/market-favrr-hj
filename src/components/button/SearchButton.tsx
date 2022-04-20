import React, { useState } from "react";
import searchSrc from "../../assets/images/search.svg";
import "./searchButton.scss";

const SearchButton = () => {
  return (
    <button type="button" className="search-button">
      <img src={searchSrc} />
    </button>
  );
};

export default SearchButton;
