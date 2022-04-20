import React, {
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormattedMessage } from "react-intl";
import BorderedButton from "../button/BorderedButton";
import closeSrc from "../../assets/images/close.svg";
import "./fileInput.scss";

type Props = InputHTMLAttributes<HTMLInputElement>;
const FileInput = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLInputElement>) => {
    const [file, setFile] = useState<File | null>(null);
    const previewUrl = file ? URL.createObjectURL(file) : null;

    const rootRef = useRef<HTMLDivElement | null>(null);

    const [isDraggingFiles, setIsDraggingFiles] = useState(false);

    // const previewRef = useRef<HTMLImageElement | null>(null);
    // useLayoutEffect(() => {
    //   if (!previewRef.current) {
    //     return;
    //   }

    //   const height = previewRef.current.clientHeight;
    //   previewRef.current.style.setProperty("max-width", `${height}px`);
    //   return () => {
    //     previewRef.current?.style.removeProperty("max-width");
    //   };
    // });
    const getInputElement = () =>
      rootRef.current?.querySelector("#file-input") as HTMLInputElement;
    return (
      <div
        className={`file-input ${previewUrl ? "file-selected" : "no-file"} ${
          props.className || ""
        } ${isDraggingFiles ? "dragging" : "not-dragging"}`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingFiles(true);
        }}
        onDragLeave={() => {
          setIsDraggingFiles(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingFiles(false);

          if (e.dataTransfer.items.length) {
            const fileTransfer = e.dataTransfer.items[0];
            if (
              fileTransfer.kind != "file" ||
              fileTransfer.type.startsWith("image") == false
            )
              return;
            const file = fileTransfer.getAsFile() as File;
            const inputElement = getInputElement();
            inputElement.files = e.dataTransfer.files;
            const event = new Event("change", { bubbles: true });
            inputElement.dispatchEvent(event);
            //   onChange(file);
          }
        }}
        ref={rootRef}
      >
        {previewUrl ? (
          <>
            <BorderedButton
              iconSrc={closeSrc}
              buttonProps={{
                type: "button",
                onClick: () => {
                  const input = getInputElement();
                  input.value = "";

                  const event = new Event("change", { bubbles: true });
                  input.dispatchEvent(event);
                },
              }}
            />
            <img className="file-preview" src={previewUrl} />
          </>
        ) : isDraggingFiles ? (
          <div className="dragging-files">
            <FormattedMessage defaultMessage="Drop your file here." />
          </div>
        ) : (
          <>
            <div className="placeholder">
              <span>
                <FormattedMessage defaultMessage="JPG, PNG, GIF, SVG, MP4, WEBM, MP3." />
              </span>
              <span>&nbsp;&nbsp;</span>
              <span>
                <FormattedMessage defaultMessage="Max 50mb." />
              </span>
            </div>
            <label htmlFor="file-input" className="action-button">
              <FormattedMessage defaultMessage="Choose File" />
            </label>
          </>
        )}
        <input
          type="file"
          id="file-input"
          style={{ display: "none" }}
          accept="image/*"
          {...props}
          ref={ref}
          onChange={(e) => {
            setFile(e.target.files?.length ? e.target.files![0] : null);
            if (props.onChange) {
              props.onChange(e);
            }
          }}
        />
      </div>
    );
  }
);

export default FileInput;
