// South Africa ID number — 13 digits: YYMMDD + SSSS + C + A + Z.
// Last digit is a Luhn check over the first 12; embeds date of birth, gender, citizenship.
export interface SaIdResult {
  input: string;
  normalized: string;
  valid: boolean;
  dateOfBirth: string | null;
  gender: "male" | "female" | null;
  citizenship: "citizen" | "permanent resident" | null;
  errors: string[];
}

function luhnValid(num: string): boolean {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = num.charCodeAt(i) - 48;
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function validateSaId(input: string): SaIdResult {
  const clean = input.replace(/\s/g, "");
  const base: SaIdResult = {
    input,
    normalized: clean,
    valid: false,
    dateOfBirth: null,
    gender: null,
    citizenship: null,
    errors: [],
  };
  if (!/^\d{13}$/.test(clean)) return { ...base, errors: ["SA ID must be 13 digits."] };

  const yy = +clean.slice(0, 2);
  const mm = +clean.slice(2, 4);
  const dd = +clean.slice(4, 6);
  const errors: string[] = [];
  if (mm < 1 || mm > 12) errors.push("Invalid month in date of birth.");
  if (dd < 1 || dd > 31) errors.push("Invalid day in date of birth.");
  if (!luhnValid(clean)) errors.push("Checksum failed (Luhn).");

  const citizenshipDigit = +clean[10];
  if (citizenshipDigit > 1) errors.push("Invalid citizenship digit (must be 0 or 1).");

  if (errors.length) return { ...base, errors };

  // Two-digit year → assume 1900s/2000s by < current 2-digit year heuristic is unreliable; report raw.
  const century = yy <= 25 ? "20" : "19";
  const dob = `${century}${String(yy).padStart(2, "0")}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  const gender = +clean.slice(6, 10) >= 5000 ? "male" : "female";
  const citizenship = citizenshipDigit === 0 ? "citizen" : "permanent resident";

  return { ...base, valid: true, dateOfBirth: dob, gender, citizenship, errors: [] };
}
