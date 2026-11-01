import "./BookQuotes.sass";

import type { FC } from "react";

import { useBackgroundRotation } from "../../../hooks";
import { Icon } from "../../../icons";
import { fetchQuotes } from "./api";
import { defaultData, Props } from "./types";

// Bump when the shape of cached quotes changes, so old caches get refetched.
// It must stay the first dep: cached deps are compared only up to the shorter length.
const CACHE_VERSION = 2;

function sizeClass(text: string) {
  if (text.length > 400) return "is-very-long";
  if (text.length > 220) return "is-long";
  return "";
}

const BookQuotes: FC<Props> = ({
  cache,
  data: savedData,
  loader,
  setCache,
  setData,
}) => {
  const data = { ...defaultData, ...savedData };

  // Shuffling is done when fetching, so the arrows always step back and forth
  const { item, go, handlePause } = useBackgroundRotation({
    fetch: () => fetchQuotes(data, loader),
    cacheObj: { cache, setCache },
    data,
    setData,
    loader,
    deps: [CACHE_VERSION, data.url, data.shuffle],
  });

  if (!item) return null;

  const book = data.showBook ? item.book : undefined;
  const onPrev = go(-1);
  const onNext = go(1);

  const opacity = Math.min(Math.max(data.backgroundOpacity, 0), 100) / 100;

  return (
    <div
      className="BookQuotes"
      style={{
        backgroundColor: `rgba(40, 40, 40, ${opacity})`,
        // Without a visible panel the blur would still smear the background
        backdropFilter: opacity > 0 ? undefined : "none",
      }}
    >
      <div className={`BookQuotesBody ${sizeClass(item.text)}`}>
        {item.tags && <p className="BookQuotesTags">{item.tags}</p>}

        <h4 className="BookQuotesContent">
          “{item.text}”
          {(item.author || book) && (
            <sub>
              {book && <cite>{book}</cite>}
              {item.author && book && ", "}
              {item.author}
            </sub>
          )}
        </h4>
      </div>

      <div className={`controls ${data.showControls ? "" : "is-on-hover"}`}>
        <button type="button" disabled={!onPrev} onClick={onPrev ?? undefined}>
          <Icon name="feather:arrow-left" />
        </button>{" "}
        <button type="button" onClick={handlePause}>
          <Icon name={data.paused ? "feather:play" : "feather:pause"} />
        </button>{" "}
        <button type="button" disabled={!onNext} onClick={onNext ?? undefined}>
          <Icon name="feather:arrow-right" />
        </button>
      </div>
    </div>
  );
};

export default BookQuotes;
