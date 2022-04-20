import React, { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import profileSrc from "../../assets/images/profile-placeholder.svg";
import oceanaProfileSrc from "../../assets/images/oceana-placeholder.svg";
import { formatUserDisplay } from "../../util/stringUtils";
import MobileUserMenu from "../header/MobileUserMenu";
import NotificationSubscriptionMenu from "../notification/NotificationSubscriptionMenu";
import "./userThumb.scss";

interface Props {
  username?: string;
  address: string;
  displayLastCharacters?: boolean;
}

const UserThumb = (props: Props) => {
  const { displayLastCharacters, address, username } = props;
  const displayName = useMemo(() => {
    return displayLastCharacters
      ? formatUserDisplay(address, username)
      : username || address.toUpperCase();
  }, [address, username, displayLastCharacters]);
  const [displayMenu, setDisplayMenu] = useState(false);

  return (
    <div className="user-thumb">
      <button
        className="thumb-button"
        onClick={(e) => {
          if (displayMenu) {
            e.stopPropagation();
            e.preventDefault();
          }

          //This slight async delay allows for the click to propagante before the useClickOutside listener is added
          setTimeout(() => {
            setDisplayMenu(!displayMenu);
          }, 0);
        }}
      >
        <img
          className="profile-image"
          src={process.env.OCEANA_ENV == "true" ? oceanaProfileSrc : profileSrc}
        />
        <span className="username">{displayName}</span>
      </button>
      {displayMenu && (
        <MobileUserMenu
          hideNotifications
          onClose={() => setDisplayMenu(false)}
        />
      )}
    </div>
  );
};

export default UserThumb;
