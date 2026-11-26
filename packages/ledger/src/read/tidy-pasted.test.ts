import { describe, expect, it } from "vitest";
import { tidyPasted } from "./tidy-pasted.ts";

describe("tidyPasted", () => {
  it("makes curly quotes and apostrophes straight", () => {
    expect(tidyPasted("\u201CIced coffee is back\u201D for Sam\u2019s regulars")).toBe('"Iced coffee is back" for Sam\'s regulars');
  });

  it("makes odd spaces ordinary and drops a byte order mark at the start", () => {
    expect(tidyPasted("\uFEFFspec 1\nnew\u00A0post")).toBe("spec 1\nnew post");
  });

  it("keeps everything else as written", () => {
    expect(tidyPasted("caf\u00E9 \u2192 visits, a summary with \u2026")).toBe("caf\u00E9 \u2192 visits, a summary with \u2026");
  });
});
