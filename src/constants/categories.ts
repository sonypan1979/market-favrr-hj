import { defineMessages } from "react-intl";
import commons from "../localization/commons";

const categorieMessages = defineMessages({
  politicians: {
    defaultMessage: "politicians",
  },
  celebrities: {
    defaultMessage: "celebrities",
  },
  athletes: {
    defaultMessage: "athletes",
  },
  entrepreneurs: {
    defaultMessage: "entrepreneurs",
  },
  activists: {
    defaultMessage: "activists",
  },
});

export default {
  all: {
    id: null,
    message: commons.all,
  },
  politicians: {
    id: "politician",
    message: categorieMessages.politicians,
  },
  celebrities: {
    id: "celebrity",
    message: categorieMessages.celebrities,
  },
  athletes: {
    id: "athlete",
    message: categorieMessages.athletes,
  },
  entrepreneurs: {
    id: "entrepreneur",
    message: categorieMessages.entrepreneurs,
  },
  activists: {
    id: "activist",
    message: categorieMessages.activists,
  },
};
