import React, { useState } from "react";
import burgerSrc from "../../assets/images/burger.svg";
import LateralMenu from "../header/LateralMenu";
import "./burgerButton.scss";

const BurgerButton = () => {
  const [displayMenu, setDisplayMenu] = useState(false);
  return (
    <button className="burger-button">
      <img src={burgerSrc} onClick={() => setDisplayMenu(!displayMenu)} />
      {displayMenu && <LateralMenu onClose={() => setDisplayMenu(false)} />}
    </button>
  );
};

export default BurgerButton;
