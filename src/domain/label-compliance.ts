export interface LabelDraft {
  productName: string;
  ingredients: string[];
  netWeightGrams: number | null;
  producerName: string;
  producerAddress: string;
  productionCode: string;
  productionDate: string;
  bestBefore: string;
  pirtNumber: string;
  halalCertificateNumber: string;
  marketingText: string;
}

export const LABEL_REQUIREMENTS = [
  "product_name",
  "ingredients",
  "net_weight",
  "producer",
  "production_code_and_date",
  "best_before",
  "pirt_number",
] as const;

export type LabelRequirement = (typeof LABEL_REQUIREMENTS)[number];

export type LabelRequirementFiller = "draft" | "owner_only";

export interface LabelCheck {
  requirement: LabelRequirement;
  satisfied: boolean;
  filler: LabelRequirementFiller;
  formatProblem: boolean;
}

export type ForbiddenClaim =
  | "cure_claim"
  | "health_claim"
  | "halal_without_certificate"
  | "bpom_registration_claim";

export interface LabelCompliance {
  checks: LabelCheck[];
  forbiddenClaims: ForbiddenClaim[];
  readyToPrint: boolean;
}

const PIRT_DIGIT_COUNT = 15;

const FORBIDDEN_CLAIM_PATTERNS: Array<[ForbiddenClaim, RegExp]> = [
  ["cure_claim", /\b(menyembuhkan|obat|mengobati)\b/i],
  [
    "health_claim",
    /\b(mencegah|menurunkan risiko|meningkatkan (imun|kekebalan)|menambah kecerdasan)\b/i,
  ],
  ["bpom_registration_claim", /\b(bpom ri md|terdaftar di bpom|izin bpom)\b/i],
];

const filled = (value: string) => value.trim().length > 0;

export function pirtNumberLooksValid(value: string): boolean {
  return value.replace(/\D/g, "").length === PIRT_DIGIT_COUNT;
}

export function findForbiddenClaims(
  draft: Pick<LabelDraft, "marketingText" | "halalCertificateNumber">,
): ForbiddenClaim[] {
  const claims = FORBIDDEN_CLAIM_PATTERNS.filter(([, pattern]) =>
    pattern.test(draft.marketingText),
  ).map(([claim]) => claim);
  if (
    /\bhalal\b/i.test(draft.marketingText) &&
    !filled(draft.halalCertificateNumber)
  ) {
    claims.push("halal_without_certificate");
  }
  return claims;
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export function pirtLabel(value: string): string {
  return /p-?irt/i.test(value) ? value : `P-IRT No. ${value}`;
}

export function checkLabelCompliance(draft: LabelDraft): LabelCompliance {
  const pirtFilled = filled(draft.pirtNumber);
  const checks: LabelCheck[] = [
    {
      requirement: "product_name",
      satisfied: filled(draft.productName),
      filler: "draft",
      formatProblem: false,
    },
    {
      requirement: "ingredients",
      satisfied: draft.ingredients.some(filled),
      filler: "draft",
      formatProblem: false,
    },
    {
      requirement: "net_weight",
      satisfied:
        Number.isFinite(draft.netWeightGrams) &&
        (draft.netWeightGrams ?? 0) > 0,
      filler: "draft",
      formatProblem: false,
    },
    {
      requirement: "producer",
      satisfied: filled(draft.producerName) && filled(draft.producerAddress),
      filler: "draft",
      formatProblem: false,
    },
    {
      requirement: "production_code_and_date",
      satisfied:
        filled(draft.productionCode) && validDate(draft.productionDate),
      filler: "draft",
      formatProblem: false,
    },
    {
      requirement: "best_before",
      satisfied:
        validDate(draft.bestBefore) &&
        validDate(draft.productionDate) &&
        draft.bestBefore >= draft.productionDate,
      filler: "draft",
      formatProblem:
        filled(draft.bestBefore) &&
        (!validDate(draft.bestBefore) ||
          draft.bestBefore < draft.productionDate),
    },
    {
      requirement: "pirt_number",
      satisfied: pirtFilled && pirtNumberLooksValid(draft.pirtNumber),
      filler: "owner_only",
      formatProblem: pirtFilled && !pirtNumberLooksValid(draft.pirtNumber),
    },
  ];
  const forbiddenClaims = findForbiddenClaims({
    ...draft,
    marketingText: [
      draft.productName,
      ...draft.ingredients,
      draft.marketingText,
    ].join(" "),
  });
  return {
    checks,
    forbiddenClaims,
    readyToPrint:
      checks.every((check) => check.satisfied) && forbiddenClaims.length === 0,
  };
}
