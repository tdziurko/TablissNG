import { fetchQuotes, parseQuotes } from "./api";

const loader = { push: () => {}, pop: () => {} };
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("bookQuotes/api", () => {
  it("parses quotes with author and book", () => {
    expect(
      parseQuotes([
        {
          text: "  Quote one. ",
          author: "Author",
          book: "101 technik\r\ndla zarządzających",
          tags: "#management",
        },
      ]),
    ).toEqual([
      {
        text: "Quote one.",
        author: "Author",
        book: "101 technik dla zarządzających",
        tags: "#management",
      },
    ]);
  });

  it("joins tags given as an array", () => {
    expect(parseQuotes([{ text: "Q", tags: ["#a", " #b "] }])).toEqual([
      { text: "Q", tags: "#a #b" },
    ]);
  });

  it("accepts quote and content fields and skips invalid entries", () => {
    expect(
      parseQuotes([
        { quote: "From quote" },
        { content: "From content", author: "Someone" },
        { author: "No text" },
        null,
        "string",
      ]),
    ).toEqual([
      { text: "From quote" },
      { text: "From content", author: "Someone" },
    ]);
  });

  it("returns no quotes when the body is not an array", () => {
    expect(parseQuotes({ text: "Not a list" })).toEqual([]);
  });

  it("fetches quotes in order when shuffle is disabled", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify([{ text: "A" }, { text: "B" }]));

    await expect(
      fetchQuotes(
        { url: "https://example.com/quotes.json", shuffle: false },
        loader,
      ),
    ).resolves.toEqual([{ text: "A" }, { text: "B" }]);
  });

  it("returns no quotes when the request fails", async () => {
    globalThis.fetch = async () => new Response("", { status: 404 });

    await expect(
      fetchQuotes(
        { url: "https://example.com/quotes.json", shuffle: false },
        loader,
      ),
    ).resolves.toEqual([]);
  });

  it("does not fetch without a URL", async () => {
    globalThis.fetch = async () => {
      throw new Error("Should not be called");
    };

    await expect(
      fetchQuotes({ url: " ", shuffle: true }, loader),
    ).resolves.toEqual([]);
  });
});
