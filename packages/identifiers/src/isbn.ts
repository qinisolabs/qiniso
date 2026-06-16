export interface IsbnResult {
  input: string;
  normalized: string;
  valid: boolean;
  type: "ISBN-13" | null;
  checkDigit: string | null;
  errors: string[];
}

/** Compute the ISBN-13 check digit for the first 12 digits. */
export function isbn13CheckDigit(first12: string): string {
  if (!/^\d{12}$/.test(first12)) {
    throw new Error("isbn13CheckDigit expects exactly 12 digits.");
  }
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = first12.charCodeAt(i) - 48;
    sum += i % 2 === 0 ? d : d * 3;
  }
  return String((10 - (sum % 10)) % 10);
}

/**
 * Validate an ISBN-13: 13 digits (hyphens/spaces ignored) with a correct
 * mod-10 weighted check digit.
 */
export function validateIsbn13(input: string): IsbnResult {
  const normalized = input.replace(/[\s-]/g, "");
  const result: IsbnResult = {
    input,
    normalized,
    valid: false,
    type: null,
    checkDigit: null,
    errors: [],
  };

  if (!/^\d{13}$/.test(normalized)) {
    result.errors.push("ISBN-13 must be exactly 13 digits (after removing hyphens/spaces).");
    return result;
  }
  if (!/^(978|979)/.test(normalized)) {
    result.errors.push('ISBN-13 must begin with the "978" or "979" GS1 prefix.');
    return result;
  }

  result.type = "ISBN-13";
  const expected = isbn13CheckDigit(normalized.slice(0, 12));
  result.checkDigit = expected;
  if (expected !== normalized[12]) {
    result.errors.push(`Check digit failed: expected ${expected}, got ${normalized[12]}.`);
    return result;
  }

  result.valid = true;
  return result;
}
