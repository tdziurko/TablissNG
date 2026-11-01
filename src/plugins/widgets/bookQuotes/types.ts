import { RotatingCache } from "../../../hooks";
import { API } from "../../types";

export type BookQuote = {
  text: string;
  author?: string;
  book?: string;
  tags?: string;
};

export type Data = {
  url: string;
  paused: boolean;
  shuffle: boolean;
  showBook: boolean;
  showControls: boolean;
  timeout: number; // in seconds, 0 means every new tab
};

export type Cache = RotatingCache<BookQuote>;

export type Props = API<Data, Cache>;

export const defaultData: Data = {
  url: "",
  paused: false,
  shuffle: true,
  showBook: true,
  showControls: true,
  timeout: 1800,
};
