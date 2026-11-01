import "./BookQuotesSettings.sass";

import { type FC, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { backgroundMessages, timingMessages } from "../../../locales/messages";
import { DebounceInput } from "../../shared";
import { defaultData, Props } from "./types";

function getOriginPattern(url: string) {
  try {
    const { origin, protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:"
      ? `${origin}/*`
      : undefined;
  } catch {
    return;
  }
}

const BookQuotesSettings: FC<Props> = ({
  data: savedData,
  setCache,
  setData,
}) => {
  const settings = { ...defaultData, ...savedData };
  const [apiAccess, setApiAccess] = useState<{
    origin: string;
    state: "allowed" | "blocked";
  }>();
  const [requestingPermission, setRequestingPermission] = useState(false);
  const origin = getOriginPattern(settings.url);

  useEffect(() => {
    if (BUILD_TARGET === "web" || !origin) return;

    let current = true;
    const checkAccess = async () => {
      try {
        if (await browser.permissions.contains({ origins: [origin] })) {
          if (current) setApiAccess({ origin, state: "allowed" });
          return;
        }

        await fetch(settings.url);
        if (current) setApiAccess({ origin, state: "allowed" });
      } catch {
        if (current) setApiAccess({ origin, state: "blocked" });
      }
    };
    checkAccess();

    return () => {
      current = false;
    };
  }, [origin, settings.url]);

  const requestApiAccess = async () => {
    if (!origin) return;

    setRequestingPermission(true);
    try {
      const granted = await browser.permissions.request({ origins: [origin] });
      setApiAccess({
        origin,
        state: granted ? "allowed" : "blocked",
      });
      if (granted) setCache(undefined);
    } catch {
      setApiAccess({ origin, state: "blocked" });
    } finally {
      setRequestingPermission(false);
    }
  };

  return (
    <div className="BookQuotesSettings">
      <label>
        <FormattedMessage
          id="plugins.bookQuotes.url"
          defaultMessage="Quotes URL"
          description="Label for the URL of the JSON file with quotes"
        />
        <DebounceInput
          type="text"
          value={settings.url}
          placeholder="https://example.com/quotes.json"
          onChange={(value) => setData({ ...settings, url: value })}
          wait={1000}
        />
      </label>
      <p className="info">
        <FormattedMessage
          id="plugins.bookQuotes.format"
          defaultMessage="A JSON array of objects with a quote in the text field, and optional author, book and tags fields."
          description="Description of the expected format of the quotes file"
        />
      </p>

      {BUILD_TARGET !== "web" &&
        origin &&
        apiAccess?.origin === origin &&
        apiAccess.state === "blocked" && (
          <div className="cors-permission" role="status">
            <strong>
              <FormattedMessage
                id="plugins.bookQuotes.corsBlocked"
                defaultMessage="Unable to load quotes"
                description="Title shown when the quotes request may have been blocked by CORS"
              />
            </strong>
            <p>
              <FormattedMessage
                id="plugins.bookQuotes.corsPermissionDescription"
                defaultMessage="CORS may be blocking this URL. Grant cross-origin access to try again."
                description="Explanation that CORS is one possible cause of the failed quotes request"
              />
            </p>
            <button
              type="button"
              className="button button--primary"
              disabled={requestingPermission}
              onClick={requestApiAccess}
            >
              <FormattedMessage
                id="plugins.bookQuotes.allowCorsAccess"
                defaultMessage="Allow cross-origin access"
                description="Button to request cross-origin access to the quotes URL"
              />
            </button>
          </div>
        )}

      {BUILD_TARGET === "web" && (
        <p className="info">
          <FormattedMessage
            id="plugins.bookQuotes.corsWarning"
            defaultMessage="The URL must allow cross-origin requests in the web version."
            description="CORS requirement for the quotes URL in the web build"
          />
        </p>
      )}

      <label>
        <FormattedMessage
          id="plugins.bookQuotes.showNewQuote"
          defaultMessage="Show a new quote"
          description="Label for the setting that controls how often a new quote is shown"
        />
        <select
          value={settings.timeout}
          onChange={(event) =>
            setData({ ...settings, timeout: Number(event.target.value) })
          }
        >
          <option value={0}>
            <FormattedMessage {...timingMessages.everyNewTab} />
          </option>
          <option value={300}>
            <FormattedMessage {...timingMessages.every5min} />
          </option>
          <option value={900}>
            <FormattedMessage {...timingMessages.every15min} />
          </option>
          <option value={1800}>
            <FormattedMessage {...timingMessages.every30min} />
          </option>
          <option value={3600}>
            <FormattedMessage {...timingMessages.everyHour} />
          </option>
          <option value={86400}>
            <FormattedMessage {...timingMessages.everyDay} />
          </option>
          <option value={604800}>
            <FormattedMessage {...timingMessages.everyWeek} />
          </option>
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          checked={settings.shuffle}
          onChange={(event) =>
            setData({ ...settings, shuffle: event.target.checked })
          }
        />{" "}
        <FormattedMessage
          id="plugins.bookQuotes.shuffle"
          defaultMessage="Shuffle quotes"
          description="Toggle for showing quotes in random order"
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={settings.showBook}
          onChange={(event) =>
            setData({ ...settings, showBook: event.target.checked })
          }
        />{" "}
        <FormattedMessage
          id="plugins.bookQuotes.showBook"
          defaultMessage="Show book title"
          description="Toggle for showing the book title next to the author"
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={settings.showControls}
          onChange={(event) =>
            setData({ ...settings, showControls: event.target.checked })
          }
        />{" "}
        <FormattedMessage {...backgroundMessages.showControls} />
      </label>
    </div>
  );
};

export default BookQuotesSettings;
