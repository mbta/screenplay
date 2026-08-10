import { getInvalidVisualText } from "Components/PaMessageForm/MainForm";

describe("MainForm", () => {
  describe("getInvalidVisualText()", () => {
    test.each([
      { input: "hyphen - endash – emdash —", expected: new Set("–—") },
      { input: "!@#$%^&*()?€©", expected: new Set("€©") },
    ])("detects invalid text", ({ input, expected }) => {
      expect(getInvalidVisualText(input)).toEqual(expected);
    });

    test.each([{ input: "Green Line B/C/D/E service suspended" }])(
      "allows valid messages",
      ({ input }) => {
        expect(getInvalidVisualText(input)).toEqual(new Set());
      },
    );
  });
});
