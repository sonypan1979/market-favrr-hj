import React, { PropsWithChildren } from "react";
import "./modalContent.scss";

const ModalContent = (props: PropsWithChildren<{ className?: string }>) => {
  return (
    <div className={`modal-content ${props.className || ""}`}>
      {props.children}
    </div>
  );
};

export default ModalContent;
