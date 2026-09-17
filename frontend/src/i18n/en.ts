export const en = {
  appName: "Ruko",
  tagline: "Before you pay, click, or call back — ask Ruko.",

  // --- Check screen ---
  checkHeading: "Is this a scam?",
  checkSubheading: "Paste the message, or upload a screenshot. We'll tell you why.",
  pasteLabel: "Paste the message, link, UPI ID or phone number",
  pastePlaceholder: "Paste here…",
  uploadButton: "Upload screenshot",
  changeImageButton: "Change screenshot",
  removeImageButton: "Remove",
  checkButton: "Check it",
  checkingButton: "Checking…",
  privacyNote: "We never need your OTP, PIN or password.",
  languageLabel: "Language",
  emptyInputError: "Paste a message or upload a screenshot first.",
  networkError: "Could not reach Ruko. Check your internet and try again.",
  imageTooLargeError: "That image is too large. Please pick one under 5 MB.",
  imageTypeError: "Please upload a JPEG or PNG screenshot.",

  // --- Loading ---
  loadingLine1: "Reading the message…",
  loadingLine2: "Checking the links and UPI IDs…",
  loadingLine3: "Comparing with known scam patterns…",

  // --- Verdict screen ---
  levelScam: "Scam",
  levelSuspicious: "Suspicious",
  levelNoScamSigns: "No scam signs",
  levelScamSub: "Do not pay, click or reply.",
  levelSuspiciousSub: "Something is off. Slow down and verify.",
  levelNoScamSignsSub: "Nothing suspicious found.",
  cautionLine:
    "No scam signs found — but if in doubt, call the official number from the bank's own website.",
  partialNote: "Partial check: we could only run the automatic checks this time.",
  whyTitle: "Why we think so",
  doNowTitle: "Do this now",
  dontDoTitle: "Don't do this",
  communityTitle: "Reported by others",
  communityCount: (n: number) => `Reported ${n} ${n === 1 ? "time" : "times"}`,
  yourMessageTitle: "What you checked",
  reportButton: "Report as scam",
  reportedButton: "Reported — thank you",
  alreadyPaidButton: "I already paid",
  warnFamilyButton: "Warn my family",
  checkAnotherButton: "Check something else",
  scoreLabel: "Risk score",

  // --- Golden hour ---
  goldenHourTitle: "You may still get the money back",
  goldenHourSub: "The first few hours matter most. Do these three things now.",
  step1930Title: "Call 1930",
  step1930Body: "The national cyber fraud helpline. Free, and open 24 hours.",
  step1930Action: "Call 1930 now",
  stepPortalTitle: "File a complaint online",
  stepPortalBody: "cybercrime.gov.in is the official government portal.",
  stepPortalAction: "Open cybercrime.gov.in",
  stepBankTitle: "Call your bank",
  stepBankBody:
    "Ask them to block the card or UPI and freeze the transaction. Use the number on your card, not one from the message.",
  goldenHourNote:
    "Ruko does not file anything for you. You have to make these calls yourself.",
  backButton: "Back",

  // --- Scam types ---
  scamTypes: {
    digital_arrest: "Fake police / “digital arrest”",
    kyc_update: "Fake KYC update",
    electricity_bill: "Fake electricity bill",
    parcel_customs: "Fake parcel or customs",
    upi_refund_collect: "Fake UPI refund",
    investment_trading: "Fake investment or trading",
    task_job: "Task or job scam",
    lottery_prize: "Fake lottery or prize",
    loan_app: "Loan app trap",
    fake_customer_care: "Fake customer care",
    relative_in_trouble: "“Relative in trouble”",
    blackmail: "Blackmail or sextortion",
    other_scam: "Scam",
    none_detected: "No known pattern",
  },

  // --- Footer ---
  footerDisclaimer:
    "Ruko is guidance, not a guarantee. It never files a complaint for you.",
  footerHelpline: "Fraud helpline 1930",
  footerPortal: "cybercrime.gov.in",
};

export type Strings = typeof en;
