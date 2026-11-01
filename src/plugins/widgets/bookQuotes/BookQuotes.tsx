import "./BookQuotes.sass";

import type { FC } from "react";

import { useBackgroundRotation } from "../../../hooks";
import { Icon } from "../../../icons";
import { fetchQuotes } from "./api";
import { defaultData, Props } from "./types";

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
    deps: [data.url, data.shuffle],
  });

  if (!item) return null;

  const book = data.showBook ? item.book : undefined;
  const onPrev = go(-1);
  const onNext = go(1);

  return (
    <div className="BookQuotes">
      <h4 className="BookQuotesContent">
        “{item.text}”
        {(item.author || book) && (
          <sub>
            <br />
            &mdash; {book && <cite>{book}</cite>}
            {item.author && book && ", "}
            {item.author}
          </sub>
        )}
      </h4>

      {item.tags && <p className="BookQuotesTags">{item.tags}</p>}

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
