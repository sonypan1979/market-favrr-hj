import { create } from "eslint/lib/rules/*";
import React, { PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { useScrollBlock } from "../../context/ScrollBlockContext";
import "./modal.scss";

const Modal = (props: PropsWithChildren<unknown>) => {
  useScrollBlock(true);
  return createPortal(
    <div className="modal-container">{props.children}</div>,
    document.querySelector("body") as HTMLBodyElement
  );
};

export default Modal;
