import { ClearItModelOutput } from "@/lib/ai/schema";

type DemoResult = ClearItModelOutput;

/**
 * Realistic mock analyses used when OPENAI_API_KEY is missing (demo mode).
 * We pick the best match based on simple keyword heuristics so the UI feels
 * real while testing without a key.
 */

const insuranceEOB: DemoResult = {
  category: "insurance",
  urgency: "low",
  confidence: "high",
  plainTitle: "This looks like an insurance summary, not a bill.",
  oneSentenceSummary:
    "An Explanation of Benefits (EOB) showing how your insurance processed a recent claim.",
  whatThisIs:
    "This is an Explanation of Benefits from your health insurance company. It summarizes a recent medical visit and shows what was billed, what insurance covered, and what you may owe.",
  whatItMeans:
    "Your provider billed your insurance, the insurance applied your plan's rules, and this document explains the result. The large 'THIS IS NOT A BILL' note means you do not pay from this paper.",
  whyItMatters:
    "It helps you confirm the visit was processed correctly and tells you the amount you might see on a later bill from your provider.",
  nextSteps: [
    "Read the 'patient responsibility' amount so you know what to expect later.",
    "Wait for the actual bill from your doctor's office before paying anything.",
    "Compare this EOB to that bill to make sure the amounts match.",
    "Keep this document with your medical records.",
  ],
  warnings: [],
  keyDetails: [
    { label: "Document type", value: "Explanation of Benefits (EOB)" },
    { label: "Company / sender", value: "Your health insurance plan" },
    { label: "Patient responsibility", value: "$45.00" },
    { label: "Amount billed", value: "$320.00" },
    { label: "Required action", value: "None — this is not a bill" },
  ],
  detectedDeadlines: [],
  suggestedQuestions: [
    "Why was part of this claim not covered?",
    "Will I receive a separate bill for the patient responsibility amount?",
  ],
  callScript:
    "Hi, I received an Explanation of Benefits for a recent visit and I want to confirm I understand it. Can you tell me what my final patient responsibility will be, and whether I should expect a separate bill from the provider? Thank you.",
  replyDraft:
    "Hello, thank you for the Explanation of Benefits. I understand this is not a bill. Could you confirm the patient responsibility amount and when I might receive the actual bill? Thank you.",
  checklist: [
    "Note the patient responsibility amount",
    "Wait for the real bill from the provider",
    "Compare the bill to this EOB",
    "File this with your medical records",
  ],
  simplifiedExplanation:
    "This paper is from your health insurance. It is NOT a bill. It just shows what your visit cost and what your insurance paid. You do not pay anything from this paper. A real bill may come later.",
  shareCard: {
    title: "Insurance summary (not a bill)",
    urgency: "Low",
    meaning: "It explains how your insurance handled a recent visit.",
    nextStep: "Wait for the real bill before paying anything.",
  },
  disclaimer:
    "This is a plain-English explanation, not insurance or financial advice. Confirm coverage details with your insurance company.",
};

const scamBankText: DemoResult = {
  category: "possible_scam",
  urgency: "possible_scam",
  confidence: "high",
  plainTitle: "This looks like a possible scam text pretending to be your bank.",
  oneSentenceSummary:
    "A text message claiming your account is locked and pushing you to click a link or verify urgently.",
  whatThisIs:
    "This is a text message that looks like it is from a bank. It says your account is locked or frozen and asks you to click a link or call a number right away to fix it.",
  whatItMeans:
    "Real banks rarely text you a link and pressure you to act in minutes. The urgent tone, the link, and the request to 'verify' are classic signs of a phishing scam designed to steal your login or card details.",
  whyItMatters:
    "If you click the link or share information, scammers could drain your account or steal your identity.",
  nextSteps: [
    "Do not click any link or call any number in the message.",
    "Open your bank's official app or type the website address yourself.",
    "Call the number printed on the back of your bank card to ask if anything is wrong.",
    "Delete the message and consider reporting it to your bank.",
  ],
  warnings: [
    "Do not click links, call numbers, or send money based only on this message. Use the official app, official website, or a phone number from a trusted source.",
    "Never share login codes, passwords, or card numbers in reply to a text.",
  ],
  keyDetails: [
    { label: "Message type", value: "Text message (SMS)" },
    { label: "Claimed sender", value: "A bank (unverified)" },
    { label: "Required action", value: "Do NOT act on this message" },
  ],
  detectedDeadlines: [],
  suggestedQuestions: [
    "Is there actually any issue with my account?",
    "Did this message really come from my bank?",
  ],
  callScript:
    "Hi, I got a text saying my account was locked and asking me to verify through a link. I did not click it. Can you check whether there is any real issue with my account using my verified identity? Thank you.",
  replyDraft:
    "I will not be responding to this text or clicking any links. I will contact my bank directly using the number on my card.",
  checklist: [
    "Do not click the link",
    "Open the official bank app instead",
    "Call the number on the back of your card",
    "Delete and report the message",
  ],
  simplifiedExplanation:
    "This text is probably fake. It wants to scare you so you click a link. Do NOT click it. Do NOT call the number. If you are worried, call your bank using the number on your card.",
  shareCard: {
    title: "Possible bank scam text",
    urgency: "Possible Scam",
    meaning: "A fake-looking text trying to get you to click a link.",
    nextStep: "Don't click anything — call the number on your card.",
  },
  disclaimer:
    "This is a plain-English explanation, not security or financial advice. When in doubt, contact your bank directly using a trusted number.",
};

const schoolForm: DemoResult = {
  category: "school_form",
  urgency: "medium",
  confidence: "high",
  plainTitle: "This is a school permission form that needs to be signed.",
  oneSentenceSummary:
    "A field trip permission slip asking for a parent or guardian signature and a small payment by a date.",
  whatThisIs:
    "This is a permission form from a school for a student activity or field trip. It asks a parent or guardian to give consent and may ask for a small fee.",
  whatItMeans:
    "The school needs your signed approval before your child can take part. There is usually a date by which the signed form must be returned.",
  whyItMatters:
    "If the form is not returned by the due date, your child may not be allowed to join the activity.",
  nextSteps: [
    "Read the activity details, date, and any cost.",
    "Sign and date the form where indicated.",
    "Include any required payment if requested.",
    "Return it to the teacher or office before the due date.",
  ],
  warnings: [],
  keyDetails: [
    { label: "Document type", value: "School permission form" },
    { label: "Required action", value: "Sign and return" },
    { label: "Fee", value: "$12.00" },
    { label: "Due date", value: "Friday next week" },
  ],
  detectedDeadlines: [
    {
      label: "Return signed form",
      dateText: "Friday next week",
      explanation: "The signed form and fee are due by this date.",
    },
  ],
  suggestedQuestions: [
    "Is the fee required, or is there financial assistance?",
    "Can the form be returned digitally?",
  ],
  callScript:
    "Hi, I'm calling about the permission form for my child's upcoming activity. I want to confirm the due date and how to submit the payment. Thank you.",
  replyDraft:
    "Hello, thank you for the permission form. I have signed it and will return it with the fee before the due date. Please let me know if anything else is needed.",
  checklist: [
    "Read the activity details and cost",
    "Sign and date the form",
    "Add the payment if required",
    "Return before the due date",
  ],
  simplifiedExplanation:
    "Your child's school wants your okay for an activity. Sign the paper, add the money if it asks, and give it back to the teacher before the due date.",
  shareCard: {
    title: "School permission form",
    urgency: "Medium",
    meaning: "Your child needs your signed okay for an activity.",
    nextStep: "Sign and return it before the due date.",
  },
  disclaimer:
    "This is a plain-English explanation. Check directly with the school for exact details and deadlines.",
};

const appError: DemoResult = {
  category: "app_error",
  urgency: "low",
  confidence: "medium",
  plainTitle: "This looks like an app installation error.",
  oneSentenceSummary:
    "An error message that appeared while installing or updating an app, often due to storage or connection issues.",
  whatThisIs:
    "This is an error message from your phone or computer that popped up while installing or updating an app. The code usually points to a temporary problem like low storage or a weak connection.",
  whatItMeans:
    "Something stopped the install from finishing. It is usually not serious and can often be fixed by freeing space, checking your connection, and trying again.",
  whyItMatters:
    "It only matters because the app you wanted did not install. There is no safety or money risk here.",
  nextSteps: [
    "Check that you have enough free storage on your device.",
    "Make sure you have a stable Wi-Fi or data connection.",
    "Restart the device and try the install again.",
    "If it keeps failing, search the exact error code in the app store's help.",
  ],
  warnings: [],
  keyDetails: [
    { label: "Type", value: "App install / update error" },
    { label: "Required action", value: "Retry after freeing space" },
  ],
  detectedDeadlines: [],
  suggestedQuestions: [
    "Do I have enough free storage?",
    "Is my internet connection stable?",
  ],
  callScript:
    "Hi, I'm getting an error when I try to install an app on my device. I've checked my storage and connection. Can you help me figure out what the error code means? Thank you.",
  replyDraft:
    "Hi, I'm running into an install error with this app. I've tried restarting and checking storage. Could you advise on next steps? Thanks.",
  checklist: [
    "Free up storage space",
    "Check your internet connection",
    "Restart the device",
    "Try the install again",
  ],
  simplifiedExplanation:
    "Your app didn't finish installing. This usually happens when the phone is full or the internet is weak. Make space, check Wi-Fi, restart, and try again.",
  shareCard: {
    title: "App install error",
    urgency: "Low",
    meaning: "The app couldn't finish installing, usually a minor issue.",
    nextStep: "Free up space, check your connection, and retry.",
  },
  disclaimer:
    "This is a plain-English explanation. For device-specific issues, check the official support page for your app or device.",
};

const medicalMessage: DemoResult = {
  category: "medical",
  urgency: "medium",
  confidence: "medium",
  plainTitle: "This is a medical portal message about your medication.",
  oneSentenceSummary:
    "A message from your healthcare provider's portal about a prescription or medication change.",
  whatThisIs:
    "This is a message from a patient portal (like MyChart) from your doctor's office. It appears to be about a medication — a new prescription, a dose change, or a refill note.",
  whatItMeans:
    "Your care team is sharing an update about your medication. The exact instructions matter, so it is important to read it carefully and confirm anything you are unsure about.",
  whyItMatters:
    "Taking medication correctly affects your health. Misreading a dose or timing could be harmful.",
  nextSteps: [
    "Read the medication name, dose, and timing carefully.",
    "Confirm the instructions with your doctor or pharmacist before changing anything.",
    "Ask whether this replaces a previous prescription.",
    "Set a reminder if a new schedule is involved.",
  ],
  warnings: [
    "Do not change how you take any medication based only on this summary. Confirm with your doctor or pharmacist.",
  ],
  keyDetails: [
    { label: "Source", value: "Patient portal message" },
    { label: "Topic", value: "Medication update" },
    { label: "Required action", value: "Confirm details with provider" },
  ],
  detectedDeadlines: [],
  suggestedQuestions: [
    "Does this change replace my current medication?",
    "What is the exact dose and timing?",
    "Are there side effects I should watch for?",
  ],
  callScript:
    "Hi, I received a portal message about my medication. I want to confirm the exact name, dose, and timing, and whether this replaces what I was taking before. Can you help me? Thank you.",
  replyDraft:
    "Hello, thank you for the message about my medication. Could you confirm the exact dose and timing, and whether this replaces my previous prescription? I want to be sure I follow it correctly.",
  checklist: [
    "Read the medication name and dose",
    "Confirm instructions with your doctor or pharmacist",
    "Ask if it replaces a current medication",
    "Set a reminder for the schedule",
  ],
  simplifiedExplanation:
    "Your doctor's office sent a note about your medicine. Read it slowly. Before you change how you take any medicine, call your doctor or pharmacist to make sure you understand it.",
  shareCard: {
    title: "Medical portal message about medication",
    urgency: "Medium",
    meaning: "Your care team sent an update about your medication.",
    nextStep: "Confirm the dose and timing with your doctor or pharmacist.",
  },
  disclaimer:
    "This is a plain-English explanation, not medical advice. Confirm medication, dosage, symptoms, and treatment decisions with a doctor or pharmacist.",
};

const utilityBill: DemoResult = {
  category: "utility",
  urgency: "high",
  confidence: "high",
  plainTitle: "This is a utility bill that appears to be past due.",
  oneSentenceSummary:
    "An electricity/water/gas bill showing an amount owed with overdue or disconnection language.",
  whatThisIs:
    "This is a bill from a utility company for service like electricity, water, or gas. It shows an amount due and includes language suggesting the payment is late.",
  whatItMeans:
    "You owe a balance and it may be overdue. Some utility notices warn about late fees or service shut-off if it is not paid soon.",
  whyItMatters:
    "If a utility bill goes unpaid past the due date, you could face late fees or a service interruption.",
  nextSteps: [
    "Confirm the amount due and the due date on the bill.",
    "Pay through the utility's official app, website, or phone number — not links in a text.",
    "If you cannot pay in full, call the company to ask about a payment plan.",
    "Keep your confirmation number after paying.",
  ],
  warnings: [
    "If this arrived as a text or email with a payment link, verify it on the official utility website before paying.",
  ],
  keyDetails: [
    { label: "Document type", value: "Utility bill" },
    { label: "Amount due", value: "$148.32" },
    { label: "Due date", value: "Overdue — pay as soon as possible" },
    { label: "Required action", value: "Pay or set up a payment plan" },
  ],
  detectedDeadlines: [
    {
      label: "Payment due",
      dateText: "Past due",
      explanation:
        "The bill appears overdue, so paying promptly helps avoid late fees or shut-off.",
    },
  ],
  suggestedQuestions: [
    "What is the exact past-due balance?",
    "Is a payment plan available?",
    "Are there late fees already added?",
  ],
  callScript:
    "Hi, I'm calling about my utility account. I received a bill that appears past due for about $148. I'd like to confirm the balance and either pay it or set up a payment plan. Can you help me? Thank you.",
  replyDraft:
    "Hello, I received my utility bill and want to make sure it's paid on time. Could you confirm the current balance due and accepted payment methods? Thank you.",
  checklist: [
    "Confirm the amount and due date",
    "Pay through the official channel",
    "Ask about a payment plan if needed",
    "Save your confirmation number",
  ],
  simplifiedExplanation:
    "This is a bill for power, water, or gas, and it looks late. Pay it soon using the company's real app or website. If you can't pay it all, call them and ask for a payment plan.",
  shareCard: {
    title: "Utility bill (looks past due)",
    urgency: "High",
    meaning: "You owe money on a utility bill and it may be overdue.",
    nextStep: "Pay it soon through the official app, site, or phone number.",
  },
  disclaimer:
    "This is a plain-English explanation, not financial advice. Verify the balance and due date directly with your utility provider.",
};

const genericText: DemoResult = {
  category: "general_message",
  urgency: "low",
  confidence: "medium",
  plainTitle: "Here's the plain-English version of your message.",
  oneSentenceSummary:
    "A general message that doesn't clearly fit a single category.",
  whatThisIs:
    "This is a general message or note. Based on what was provided, it doesn't strongly match a specific type like a bill, legal notice, or scam.",
  whatItMeans:
    "It appears to be informational. Nothing in it clearly requires payment, signatures, or urgent action — but read it over to be sure.",
  whyItMatters:
    "Most general messages are low-stakes, but it's still good to confirm there's no hidden deadline or request.",
  nextSteps: [
    "Re-read the message for any request, date, or amount.",
    "If something is unclear, contact the sender through a trusted channel.",
    "If it asks for money or personal info, treat it with caution.",
  ],
  warnings: [],
  keyDetails: [{ label: "Type", value: "General message" }],
  detectedDeadlines: [],
  suggestedQuestions: ["Is there anything I need to do or respond to?"],
  callScript:
    "Hi, I received a message and I want to confirm whether there's anything I need to do in response. Can you help clarify? Thank you.",
  replyDraft:
    "Hello, thanks for your message. Could you let me know if there's anything you need from me? Thank you.",
  checklist: [
    "Re-read for requests or dates",
    "Contact the sender if unclear",
    "Be cautious if money or info is requested",
  ],
  simplifiedExplanation:
    "This is just a message. It doesn't seem to need money or a signature. Read it again to be sure, and ask the sender if you're not sure what it means.",
  shareCard: {
    title: "General message",
    urgency: "Low",
    meaning: "An informational message with no clear urgent action.",
    nextStep: "Re-read it and contact the sender if anything is unclear.",
  },
  disclaimer:
    "This is a plain-English explanation. If the message involves legal, medical, financial, or safety matters, confirm with a qualified source.",
};

type Matcher = {
  result: DemoResult;
  test: (text: string) => boolean;
};

const matchers: Matcher[] = [
  {
    result: scamBankText,
    test: (t) =>
      /(account (is )?(locked|frozen|suspended)|verify your|click (the|this) link|gift card|wire transfer|crypto|zelle|cash app|venmo|unusual (activity|login)|prize|refund pending|delivery failed|unpaid toll|act now|social security number|login code|password reset|reset code)/i.test(
        t,
      ),
  },
  {
    result: insuranceEOB,
    test: (t) =>
      /(explanation of benefits|this is not a bill|eob|claim (number|processed)|patient responsibility|allowed amount|in[- ]network)/i.test(
        t,
      ),
  },
  {
    result: medicalMessage,
    test: (t) =>
      /(mychart|patient portal|prescription|medication|dosage|refill|pharmacy|doctor|lab result|mg\b)/i.test(
        t,
      ),
  },
  {
    result: schoolForm,
    test: (t) =>
      /(permission (slip|form)|field trip|parent(\/| or )guardian|sign and return|school|teacher|consent form)/i.test(
        t,
      ),
  },
  {
    result: utilityBill,
    test: (t) =>
      /(utility|electric(ity)?|water bill|gas bill|past due|amount due|disconnect|shut[- ]off|kwh|meter|late fee)/i.test(
        t,
      ),
  },
  {
    result: appError,
    test: (t) =>
      /(error code|install(ation)? failed|update failed|app (won't|wont|can't|cant) (open|install)|exception|crash|0x[0-9a-f]+|storage full|try again later)/i.test(
        t,
      ),
  },
];

/**
 * Pick a realistic demo result based on the input. Falls back to a generic
 * message result for plain text, and an insurance example for image-only input.
 */
export function pickDemoResult(
  text?: string,
  hadImage?: boolean,
): DemoResult {
  const t = (text ?? "").trim();

  if (t.length > 0) {
    for (const matcher of matchers) {
      if (matcher.test(t)) return matcher.result;
    }
    return genericText;
  }

  // Image-only demo input: rotate through a couple of believable examples.
  if (hadImage) {
    const samples = [insuranceEOB, utilityBill, schoolForm];
    const idx = Math.floor(Date.now() / 1000) % samples.length;
    return samples[idx];
  }

  return genericText;
}

export const DEMO_LIBRARY = {
  insuranceEOB,
  scamBankText,
  schoolForm,
  appError,
  medicalMessage,
  utilityBill,
  genericText,
};
