import { getInvalidVisualText } from "Components/PaMessageForm/MainForm";

describe("MainForm", () => {
  describe("getInvalidVisualText()", () => {
    test.each([
      { input: "hyphen - endash – emdash —", expected: new Set("–—") },
      { input: "See the train coming?", expected: new Set("?") },
      { input: "Green Line[D] service suspended", expected: new Set("[]") },
      { input: "Service will result in ~15 minutes", expected: new Set("~") },
    ])("detects invalid text", ({ input, expected }) => {
      expect(getInvalidVisualText(input)).toEqual(expected);
    });
  });
});
