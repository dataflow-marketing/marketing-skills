import { describe, expect, it } from "vitest";
import { samePath } from "./same-path.ts";

describe("samePath", () => {
  it("matches the same path written two ways", () => {
    expect(samePath("drafts/iced-coffee.txt", "./drafts/iced-coffee.txt")).toBe(true);
    expect(samePath("/home/sam/dfm/drafts/iced-coffee.txt", "drafts/iced-coffee.txt")).toBe(true);
  });

  it("does not match a different file or a name that only ends the same", () => {
    expect(samePath("drafts/iced-coffee.txt", "drafts/hot-coffee.txt")).toBe(false);
    expect(samePath("drafts/my-iced-coffee.txt", "iced-coffee.txt")).toBe(false);
  });
});
