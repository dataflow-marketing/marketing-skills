import { describe, expect, it } from "vitest";
import { changedText, changesSince, fingerprints } from "./changed-pages.ts";

const MENU = { kind: "page" as const, title: "Menu", url: "http://localhost:4101/menu/", text: "Flat white" };
const NEWS = { kind: "post" as const, title: "Iced coffee is back", url: "http://localhost:4101/news/iced/", text: "From Monday." };

describe("fingerprints", () => {
  it("writes one line a page: a short hash, then its address", async () => {
    const lines = (await fingerprints([MENU, NEWS])).trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^[0-9a-f]{16} http:\/\/localhost:4101\/menu\/$/);
  });
});

describe("changesSince", () => {
  it("finds the new, changed and gone pages and counts the rest", async () => {
    const before = await fingerprints([MENU, NEWS]);
    const changedMenu = { ...MENU, text: "Flat white and long black" };
    const hours = { kind: "page" as const, title: "Hours", url: "http://localhost:4101/hours/", text: "From 7" };
    const changes = await changesSince(before, [changedMenu, hours]);
    expect(changes.added.map((item) => item.url)).toEqual([hours.url]);
    expect(changes.changed.map((item) => item.url)).toEqual([MENU.url]);
    expect(changes.removed).toEqual([NEWS.url]);
    expect(changes.same).toBe(0);
  });

  it("says nothing changed when every page is the same", async () => {
    const changes = await changesSince(await fingerprints([MENU]), [MENU]);
    expect(changes.same).toBe(1);
    expect(changedText(changes)).toBe("Nothing changed.\n");
  });
});

describe("changedText", () => {
  it("writes the new and changed pages in full and lists the gone ones", async () => {
    const text = changedText({ added: [NEWS], changed: [], removed: ["http://localhost:4101/old/"], same: 3 });
    expect(text).toBe("## New\n### Iced coffee is back\nURL: http://localhost:4101/news/iced/\nFrom Monday.\n## Gone\nURL: http://localhost:4101/old/\n");
  });
});
