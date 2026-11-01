import { defineMessages } from "react-intl";

import { Config } from "../../types";
import BookQuotes from "./BookQuotes";
import BookQuotesSettings from "./BookQuotesSettings";
import { defaultData } from "./types";

const messages = defineMessages({
  name: {
    id: "plugins.bookQuotes.name",
    defaultMessage: "Book Quotes",
    description: "Name of the Book Quotes widget",
  },
  description: {
    id: "plugins.bookQuotes.description",
    defaultMessage: "Browse your own collection of quotes from a JSON file.",
    description: "Description of the Book Quotes widget",
  },
});

const config: Config = {
  key: "widget/bookQuotes",
  name: messages.name,
  description: messages.description,
  dashboardComponent: BookQuotes,
  settingsComponent: BookQuotesSettings,
  defaultData,
};

export default config;
