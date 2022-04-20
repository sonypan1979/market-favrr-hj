import React, { useMemo, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import BasePage from "./BasePage";
import { useForm } from "react-hook-form";

import "./nftMintPage.scss";
import { defineMessages } from "@formatjs/intl";
import FileInput from "../components/input/FileInput";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import SortingPanel from "../components/filter/SortingPanel";
import InfoBox from "../components/info/InfoBox";
import chevronSrc from "../assets/images/chevron.svg";
import ExclusivePickerPanel from "../components/input/ExclusivePickerPanel";
import NFTPreview from "../components/nft/NFTPreview";
import Big from "big.js";

const intlMessages = defineMessages({
  pricePlaceHolder: {
    defaultMessage: "Enter price for one NFT.",
  },
  namePlaceHolder: {
    defaultMessage: "Item Name",
  },
  descriptionPlaceHolder: {
    defaultMessage: "Enter a detailed description about your item.",
  },
  nameRequired: {
    defaultMessage: "NFT name cannot be empty.",
  },
  priceRequired: {
    defaultMessage: "Price cannot be empty.",
  },
  fileRequired: {
    defaultMessage: "File is required.",
  },
  fileSizeLimit: {
    defaultMessage: "File is too large.",
  },
});

enum currencyType {
  eth = "ETH",
  usd = "USD",
}

type NFTForm = {
  name: string;
  description: string;
  text: string;
  price: string;
  file: FileList | null;
  currency: currencyType.eth | currencyType.usd;
};

const NFTMintPage = () => {
  const intl = useIntl();
  const yupValidationSchema = Yup.object().shape({
    name: Yup.string().required(intl.formatMessage(intlMessages.nameRequired)),
    price: Yup.string().required(
      intl.formatMessage(intlMessages.priceRequired)
    ),
    file: Yup.mixed()
      .test(
        "file-required",
        intl.formatMessage(intlMessages.fileRequired),
        (fileList: FileList) => {
          return fileList.length ? true : false;
        }
      )
      .test(
        "size-limit",
        intl.formatMessage(intlMessages.fileSizeLimit),
        (fileList: FileList) => {
          if (!fileList.length) {
            return true;
          }
          const file = fileList[0];
          return file.size <= 50 * 1024 * 1024;
        }
      ),
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, touchedFields },
  } = useForm<NFTForm>({
    resolver: yupResolver(yupValidationSchema),
    criteriaMode: "all",
    defaultValues: {
      currency: currencyType.eth,
    },
  });

  //   const [file, setFile] = useState<null | File>(null);

  const fileList = watch("file");
  const name = watch("name");
  const price = watch("price");
  const currency = watch("currency");
  const [currencyToggleVisible, setCurrencyToggleVisible] = useState(false);
  const file = fileList?.length ? fileList![0] : null;

  const fileUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  const hasErrors = Object.keys(errors).length > 0;

  const displayPreview = window.innerWidth >= 1024;

  const disableForm = process.env.DISABLE_NFT_MINT == "true";
  return (
    <BasePage className="nft-mint-page">
      <h1>
        <FormattedMessage defaultMessage="Create NFT" />
      </h1>

      <form
        onSubmit={handleSubmit(
          (data) => {
            console.log("handle submit");
            console.log({ data });
          },
          (data) => {
            console.log("handle error submit");
            console.log(data);
          }
        )}
      >
        <div className="form-section">
          <label>
            <FormattedMessage defaultMessage="Upload file" />
          </label>
          <FileInput
            {...register("file")}
            className={`${errors.file ? "error" : ""}`}
          />
          {Object.values(errors.file?.types || {}).map((errorMessage, i) => (
            <div key={i} className="error-message">
              {errorMessage}
            </div>
          ))}
        </div>
        <div className="form-section">
          <label>
            <FormattedMessage defaultMessage="Price" />
          </label>
          <div className="price-input-container">
            <input
              {...register("price")}
              onKeyDown={(e) => {
                console.log(e.key);
                if (["-", "e", "ArrowUp", "ArrowDown"].includes(e.key)) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onChange={(e) => {
                e.target.value = e.target.value.slice(0, 20);
                register("price").onChange(e);
              }}
              placeholder={intl.formatMessage(intlMessages.pricePlaceHolder)}
              className={`${errors.price ? "error" : ""}`}
              type="number"
              step="any"
              min={0}
              maxLength={5}
            />
            <div
              className={`currency-toggle-button ${
                currencyToggleVisible ? "expanded" : ""
              }`}
              onClick={() => {
                setTimeout(() => {
                  setCurrencyToggleVisible(!currencyToggleVisible);
                }, 0);
              }}
            >
              {currency}
              <img src={chevronSrc} />
              {currencyToggleVisible && (
                <ExclusivePickerPanel
                  options={[
                    { value: currencyType.eth, display: currencyType.eth },
                    { value: currencyType.usd, display: currencyType.usd },
                  ]}
                  value={currency}
                  onChange={(value) =>
                    setValue("currency", value as currencyType)
                  }
                  onClickOutside={() => setCurrencyToggleVisible(false)}
                />
              )}
            </div>
          </div>
          {Object.values(errors.price?.types || {}).map((errorMessage, i) => (
            <div key={i} className="error-message">
              {errorMessage}
            </div>
          ))}
        </div>
        <div className="form-section">
          <label>
            <FormattedMessage defaultMessage="NFT Name" />
          </label>
          <input
            {...register("name")}
            maxLength={50}
            placeholder={intl.formatMessage(intlMessages.namePlaceHolder)}
            className={`${errors.name ? "error" : ""}`}
          />
          {Object.values(errors.name?.types || {}).map((errorMessage, i) => (
            <div key={i} className="error-message">
              {errorMessage}
            </div>
          ))}
        </div>
        <div className="form-section">
          <label>
            <FormattedMessage defaultMessage="Description" />
            <span className="aditional-info">
              <FormattedMessage defaultMessage="(Optional)" />
            </span>
          </label>
          <textarea
            {...register("description")}
            placeholder={intl.formatMessage(
              intlMessages.descriptionPlaceHolder
            )}
            className={`${errors.description ? "error" : ""}`}
          />
          {Object.values(errors.description?.types || {}).map(
            (errorMessage, i) => (
              <div key={i} className="error-message">
                {errorMessage}
              </div>
            )
          )}
        </div>
        <hr />
        {hasErrors && (
          <InfoBox className="error-box" pink>
            <div className="error-content">
              <div className="errors-title">
                <FormattedMessage defaultMessage="Validation Errors" />
              </div>
              <div className="errors-text">
                <FormattedMessage defaultMessage="Please fix the errors above to continue." />
              </div>
            </div>
          </InfoBox>
        )}
        <button
          className="action-button submit-button"
          disabled={hasErrors || disableForm}
        >
          <FormattedMessage defaultMessage="Create NFT" />
          {disableForm && (
            <div className="disabled-form-modal">
              <div className="modal-title">
                <FormattedMessage defaultMessage="Under Construction" />
              </div>
              <div className="modal-text">
                <FormattedMessage defaultMessage="We’re launching this feature soon." />
              </div>
            </div>
          )}
        </button>
      </form>
      {displayPreview && (
        <div className="preview-section">
          <div className="section-title">
            <FormattedMessage defaultMessage="Preview" />
          </div>
          <NFTPreview
            mediaUrl={fileUrl}
            name={name}
            price={new Big(price || 0)}
          />
        </div>
      )}
    </BasePage>
  );
};

export default NFTMintPage;
