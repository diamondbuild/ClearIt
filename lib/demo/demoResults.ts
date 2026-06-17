import type { ClearItAnalysis } from "@/lib/types";

type DemoScenario = {
  id: string;
  title: string;
  matcher: (text: string) => boolean;
  build: () => ClearItAnalysis;
};

const now = () => new Date().toISOString();

const withBase = (partial: Partial<ClearItAnalysis>): ClearItAnalysis => ({
  id: crypto.randomUUID(),
  createdAt: now(),
  category: "unknown",
  urgency: "unknown",
  confidence: "medium",
  plainTitle: "I could not safely determine what this is.",
  oneSentenceSummary:
    "The content is unclear, so use the official sender's contact details to verify next steps.",
  whatThisIs:
    "This may be a message, notice, or screenshot, but there is not enough reliable detail to classify it confidently.",
  whatItMeans:
    "It might still matter, especially if it mentions account access, payment, deadlines, or personal information.",
  whyItMatters:
    "Acting on unclear information can cause mistakes, missed deadlines, or potential scams.",
  nextSteps: [
    "Use the official website or official app for the sender to verify this message.",
    "Do not click links or call numbers shown in the message until verified.",
  ],
  warnings: [],
  keyDetails: [],
  detectedDeadlines: [],
  suggestedQuestions: [
    "Can you confirm this message is legitimate?",
    "Is there any action I need to take right now?",
  ],
  callScript:
    "Hi, I received a message I cannot verify. Can you confirm whether it came from your organization and tell me any official next steps?",
  replyDraft:
    "Hi, I want to verify this message through your official channel before taking action. Please confirm if this is legitimate and what I should do next.",
  checklist: [
    "Verify sender through official source",
    "Avoid links in the original message",
    "Write down confirmed next step",
  ],
  simplifiedExplanation:
    "This is not clear enough to trust yet. Check with the real company using their official app or website.",
  shareCard: {
    title: "Unclear message or notice",
    urgency: "Unknown",
    meaning: "The content is not clear enough to verify safely.",
    nextStep: "Use official channels to confirm before acting.",
  },
  disclaimer:
    "This is a plain-English explanation and may be incomplete if the content is unclear.",
  ...partial,
});

const scenarios: DemoScenario[] = [
  {
    id: "insurance",
    title: "Insurance explanation of benefits",
    matcher: (text) =>
      /insurance|eob|explanation of benefits|claim|not a bill/i.test(text),
    build: () =>
      withBase({
        category: "insurance",
        urgency: "low",
        confidence: "high",
        plainTitle: "This looks like an insurance explanation, not a bill.",
        oneSentenceSummary:
          "It explains how your insurance processed care and what may still be your responsibility.",
        whatThisIs:
          "This appears to be an Explanation of Benefits (EOB) from an insurance company.",
        whatItMeans:
          "An EOB is usually a summary, not a payment request. It shows charges, covered amount, and possible patient responsibility.",
        whyItMatters:
          "You should compare it with provider bills to make sure amounts match and no errors exist.",
        nextSteps: [
          "Look for the phrase 'This is not a bill' and keep a copy.",
          "Match the service date and provider against your records.",
          "If something looks wrong, call the insurer's official member services number.",
        ],
        keyDetails: [
          { label: "Document type", value: "Explanation of Benefits (EOB)" },
        ],
        suggestedQuestions: [
          "Was this claim fully processed?",
          "Do I owe anything now, or should I wait for a provider bill?",
        ],
        disclaimer:
          "This is a plain-English explanation, not insurance or financial advice.",
        shareCard: {
          title: "Insurance explanation, not a bill",
          urgency: "Low",
          meaning: "This looks informational and should be matched with any provider bill.",
          nextStep: "Review claim details and call your insurer if anything looks off.",
        },
      }),
  },
  {
    id: "scam",
    title: "Suspicious bank text",
    matcher: (text) =>
      /bank|locked|zelle|cash app|venmo|wire|gift card|verify now|urgent|account alert/i.test(
        text,
      ),
    build: () =>
      withBase({
        category: "possible_scam",
        urgency: "possible_scam",
        confidence: "high",
        plainTitle: "This may be a scam pretending to be a bank alert.",
        oneSentenceSummary:
          "The message uses urgency and asks for fast action, which is a common scam pattern.",
        whatThisIs:
          "This appears to be a suspicious account security or payment message.",
        whatItMeans:
          "Scammers often pressure people to click a link, call a fake number, or move money quickly.",
        whyItMatters:
          "Following scam instructions can lead to stolen money or account access.",
        nextSteps: [
          "Do not click links or call numbers in the message.",
          "Open your bank app directly or type the bank website yourself.",
          "Call the number on the back of your card to verify any real alert.",
        ],
        warnings: [
          "Do not click links, call numbers, or send money based only on this message. Use the official app, official website, or a phone number from a trusted source.",
        ],
        keyDetails: [{ label: "Risk signal", value: "Urgent account threat language" }],
        disclaimer:
          "This is a plain-English explanation, not financial or fraud recovery advice.",
        shareCard: {
          title: "Possible scam bank alert",
          urgency: "Possible Scam",
          meaning: "The message looks suspicious and may be trying to steal money or account access.",
          nextStep: "Verify through your bank's official app or phone number.",
        },
      }),
  },
  {
    id: "school-form",
    title: "School permission form",
    matcher: (text) => /permission slip|field trip|school form|guardian/i.test(text),
    build: () =>
      withBase({
        category: "school_form",
        urgency: "medium",
        confidence: "high",
        plainTitle: "This looks like a school permission form.",
        oneSentenceSummary:
          "It likely needs a parent or guardian review and signature before a deadline.",
        whatThisIs:
          "This appears to be a school form for consent, student details, or trip participation.",
        whatItMeans:
          "The school needs your approval and may require health, emergency, or contact information.",
        whyItMatters:
          "Missing the deadline could prevent participation or delay school processing.",
        nextSteps: [
          "Check due date and required signature fields.",
          "Complete missing contact or medical fields carefully.",
          "Return it using the school's official submission method.",
        ],
        detectedDeadlines: [
          {
            label: "Form return deadline",
            dateText: "Check form due date",
            explanation: "Submit before the listed due date so it can be processed on time.",
          },
        ],
        disclaimer:
          "This is a plain-English explanation. Confirm requirements with your school office.",
      }),
  },
  {
    id: "app-error",
    title: "App install error",
    matcher: (text) =>
      /error|failed|install|exception|code|stack trace|app/i.test(text),
    build: () =>
      withBase({
        category: "app_error",
        urgency: "low",
        confidence: "medium",
        plainTitle: "This looks like an app install or update error.",
        oneSentenceSummary:
          "The app could not complete installation because of a configuration, network, or compatibility issue.",
        whatThisIs:
          "This appears to be a software/app error message.",
        whatItMeans:
          "The app process stopped unexpectedly and needs troubleshooting steps.",
        whyItMatters:
          "If unresolved, you may not be able to use the app or complete a task.",
        nextSteps: [
          "Restart the device and try the install again.",
          "Check storage space and OS version requirements.",
          "Use the official support page and include the exact error code.",
        ],
        disclaimer:
          "This is a plain-English explanation, not official technical support advice.",
      }),
  },
  {
    id: "medical",
    title: "Medical portal message",
    matcher: (text) =>
      /doctor|pharmacy|prescription|medication|portal|lab result|clinic/i.test(text),
    build: () =>
      withBase({
        category: "medical",
        urgency: "medium",
        confidence: "high",
        plainTitle: "This looks like a medical portal medication message.",
        oneSentenceSummary:
          "It appears to discuss medication instructions or follow-up care that should be confirmed with your care team.",
        whatThisIs:
          "This appears to be a message from a clinic, doctor, or pharmacy portal.",
        whatItMeans:
          "It likely contains care instructions, refill details, or changes that affect your treatment.",
        whyItMatters:
          "Medication and treatment details should be confirmed to avoid mistakes.",
        nextSteps: [
          "Read dosage and timing carefully.",
          "Call the clinic or pharmacist if any instruction is unclear.",
          "Confirm interactions with other medications before making changes.",
        ],
        warnings: ["Do not change medication dosage based only on this summary."],
        disclaimer:
          "This is a plain-English explanation, not medical advice. Confirm medication, dosage, symptoms, and treatment decisions with a doctor or pharmacist.",
      }),
  },
  {
    id: "utility",
    title: "Utility bill",
    matcher: (text) => /utility|electric|water|gas bill|past due|disconnection/i.test(text),
    build: () =>
      withBase({
        category: "utility",
        urgency: "high",
        confidence: "high",
        plainTitle: "This appears to be a utility bill with a payment deadline.",
        oneSentenceSummary:
          "It shows an amount due and may mention late status or service interruption risk.",
        whatThisIs:
          "This appears to be a utility statement for power, water, gas, or similar service.",
        whatItMeans:
          "A balance is due and the provider may add fees or interruption warnings if unpaid.",
        whyItMatters:
          "Missing the due date can increase costs or disrupt essential service.",
        nextSteps: [
          "Confirm account number and amount due in the official provider portal.",
          "Pay by the due date or contact billing support to discuss options.",
          "Save confirmation details after payment.",
        ],
        keyDetails: [
          { label: "Potential action", value: "Payment required by listed due date" },
        ],
        detectedDeadlines: [
          {
            label: "Payment due date",
            dateText: "See statement due date",
            explanation: "Pay before this date to reduce late fees or service risk.",
          },
        ],
        disclaimer:
          "This is a plain-English explanation, not financial advice. Confirm exact billing details with your utility provider.",
      }),
  },
];

const fallbackScenario = scenarios[0];

const pickScenario = (text: string): DemoScenario => {
  const lowered = text.toLowerCase();
  return scenarios.find((scenario) => scenario.matcher(lowered)) ?? fallbackScenario;
};

export const getDemoResult = (text?: string, usedImage?: boolean): ClearItAnalysis => {
  if (!text?.trim()) {
    if (usedImage) {
      return withBase({
        plainTitle: "I read the image, but the text is unclear.",
        oneSentenceSummary:
          "Try a sharper image with better lighting or paste the text directly for a clearer explanation.",
        whatThisIs:
          "The upload looks like a photo or screenshot, but there is not enough readable text for confident analysis.",
        whatItMeans:
          "The content may still be important, but details were not clear enough to confirm category or urgency.",
        whyItMatters:
          "Important details can be missed when text is blurry or cut off.",
        nextSteps: [
          "Retake the image closer and avoid cutting off text.",
          "Try brighter light and avoid glare.",
          "Paste the text directly for a more accurate result.",
        ],
      });
    }

    return fallbackScenario.build();
  }

  return pickScenario(text).build();
};
