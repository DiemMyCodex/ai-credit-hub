import { describe, it, expect } from "vitest";

describe("Seam 2: Banking Webhook & Transfer Code Parser", () => {
  const prefix = "AIHUB";
  const regex = new RegExp(`(${prefix}\\d{4,10})`, "i");

  it("should extract order code correctly from various Vietnamese banking memo formats", () => {
    // Format 1: Direct memo
    const memo1 = "AIHUB982143 chuyen tien";
    const match1 = memo1.toUpperCase().match(regex);
    expect(match1?.[1]).toBe("AIHUB982143");

    // Format 2: Bank prefixed transaction memo
    const memo2 = "MBVCB.10293848.AIHUB554120.CT tu 0987654321";
    const match2 = memo2.toUpperCase().match(regex);
    expect(match2?.[1]).toBe("AIHUB554120");

    // Format 3: Space separated or lowercase
    const memo3 = "nap tien aihub776100 cam on";
    const match3 = memo3.toUpperCase().match(regex);
    expect(match3?.[1]).toBe("AIHUB776100");
  });

  it("should safely return null when memo does not match the order code syntax", () => {
    const invalidMemo = "Chuyen khoan tien an trua";
    const match = invalidMemo.toUpperCase().match(regex);
    expect(match).toBeNull();
  });
});
