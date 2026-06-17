import { applySafetyPlaybooks } from "@/lib/ai/safety";
import type { AnalyzeRequest, ClearItAnalysis } from "@/lib/types";
import { createId } from "@/lib/utils";

type DemoTemplate = Omit<ClearItAnalysis, "id" | "createdAt">;

const baseDisclaimer =
  "ClearIt helps explain information in plain English. It does not replace professional legal, medical, financial, tax, or emergency advice.";

const demos: DemoTemplate[] = [
  {
    category: "insurance",
    urgency: "low",
    confidence: "high",
    plainTitle: "This looks like an insurance explanation, not a bill.",
    oneSentenceSummary: "It appears to be an Explanation of Benefits showing what insurance processed and what may be owed later.",
    whatThisIs: "This is likely an Explanation of Benefits from an insurance company. It summarizes a medical visit or claim and how the insurance plan handled it.",
    whatItMeans: "It is usually not a bill. It shows the billed amount, insurance discount, what insurance paid, and any amount that may become your responsibility if the provider bills you.",
    whyItMatters: "People often mistake these for bills and pay too early. The safest next step is to wait for the provider bill or check your provider portal.",
    nextSteps: [
      "Look for words like \"This is not a bill\" near the top or bottom.",
      "Compare the patient responsibility amount with any bill from the provider.",
      "If something looks wrong, call the insurance company using the number on your insurance card.",
    ],
    warnings: ["Do not pay from this notice alone unless it clearly includes payment instructions from the provider."],
    keyDetails: [
      { label: "Document type", value: "Explanation of Benefits" },
      { label: "Required action", value: "Review and wait for provider bill" },
    ],
    detectedDeadlines: [],
    suggestedQuestions: [
      "Is this a bill or only an Explanation of Benefits?",
      "Why was this amount marked as patient responsibility?",
      "Has the provider sent an actual bill yet?",
    ],
    callScript:
      "Hi, I received an Explanation of Benefits and want to confirm whether I owe anything right now. Can you help me compare the patient responsibility amount with my claim?",
    replyDraft:
      "Hello, I received an Explanation of Benefits for this claim and would like to confirm whether any balance is actually due. Please let me know if a provider bill has been issued.",
    checklist: ["Check for \"not a bill\" language", "Compare with provider bill", "Call insurance if the amount looks wrong"],
    simplifiedExplanation: "This paper is probably a summary from insurance. It tells you what they covered. It probably is not asking you to pay today.",
    shareCard: {
      title: "Insurance explanation, not a bill",
      urgency: "Low",
      meaning: "Insurance processed a claim; payment may not be due from this notice.",
      nextStep: "Wait for the provider bill or verify in the provider portal.",
    },
    disclaimer: baseDisclaimer,
  },
  {
    category: "possible_scam",
    urgency: "possible_scam",
    confidence: "high",
    plainTitle: "This may be a scam bank alert.",
    oneSentenceSummary: "The message uses urgent pressure and a link, which are common scam signs.",
    whatThisIs: "This appears to be a text claiming to be from a bank or fraud department.",
    whatItMeans: "It may be trying to get you to click a link, reveal login details, or call a fake number.",
    whyItMatters: "Scammers often copy bank language to steal passwords, verification codes, or money.",
    nextSteps: [
      "Do not click the link or reply to the message.",
      "Open your bank app directly or call the number on the back of your card.",
      "If you already clicked or shared information, change your password and contact the bank immediately.",
    ],
    warnings: ["Urgent bank texts with links are risky, especially if they ask for codes, passwords, or payment."],
    keyDetails: [
      { label: "Risk signal", value: "Urgent link or account warning" },
      { label: "Required action", value: "Verify through official bank channel" },
    ],
    detectedDeadlines: [],
    suggestedQuestions: ["Did this message come from my bank's official short code?", "Is there an alert inside the official bank app?"],
    callScript:
      "Hi, I received a suspicious text claiming there is a problem with my account. Can you check my account for any real alerts? I will not use the link in the text.",
    replyDraft: "Do not reply to the suspicious message. Contact the bank through the official app or trusted phone number instead.",
    checklist: ["Do not click", "Open official app", "Call trusted number", "Change password if you shared information"],
    simplifiedExplanation: "This text might be fake. Do not tap the link. Check your bank in the official app.",
    shareCard: {
      title: "Possible scam bank text",
      urgency: "Possible Scam",
      meaning: "The message has common scam signs.",
      nextStep: "Use the official bank app or trusted phone number.",
    },
    disclaimer: baseDisclaimer,
  },
  {
    category: "school_form",
    urgency: "medium",
    confidence: "high",
    plainTitle: "This looks like a school permission form.",
    oneSentenceSummary: "A parent or guardian likely needs to sign and return it before a school activity.",
    whatThisIs: "This appears to be a permission slip or school form asking for approval, contact information, and possibly a fee.",
    whatItMeans: "The school needs your response before the listed activity or deadline so the student can participate.",
    whyItMatters: "Missing the deadline may mean the student cannot attend or the office needs extra follow-up.",
    nextSteps: ["Fill in parent/guardian information.", "Sign the form.", "Return it to the teacher or school office before the deadline."],
    warnings: [],
    keyDetails: [
      { label: "Document type", value: "Permission form" },
      { label: "Required action", value: "Sign and return" },
    ],
    detectedDeadlines: [{ label: "Return deadline", dateText: "See form", explanation: "Return by the date printed on the form if one is shown." }],
    suggestedQuestions: ["Is there a fee?", "Where should I return the form?", "Does my student need lunch or medication information included?"],
    callScript: "Hi, I have a question about the permission form. Can you confirm the return deadline and whether there is any fee?",
    replyDraft: "Hello, I received the permission form and plan to return it. Could you confirm the deadline and any fee required?",
    checklist: ["Fill contact information", "Sign form", "Add payment if required", "Return before deadline"],
    simplifiedExplanation: "This is probably a school form. A parent needs to fill it out, sign it, and send it back.",
    shareCard: {
      title: "School permission form",
      urgency: "Medium",
      meaning: "A signature or response is needed for a school activity.",
      nextStep: "Sign and return it before the listed deadline.",
    },
    disclaimer: baseDisclaimer,
  },
  {
    category: "app_error",
    urgency: "low",
    confidence: "medium",
    plainTitle: "This looks like an app install or update error.",
    oneSentenceSummary: "The app likely could not install because of storage, compatibility, connection, or account settings.",
    whatThisIs: "This appears to be a phone or app store error message.",
    whatItMeans: "Something prevented the app from installing or updating. The message may include an error code that support can use.",
    whyItMatters: "Most install errors are fixable and not dangerous, but saving the exact code helps.",
    nextSteps: ["Check Wi-Fi or cellular connection.", "Free up storage space.", "Restart the phone.", "Try updating from the official app store again."],
    warnings: ["Only install apps from the official app store or the company's official website."],
    keyDetails: [{ label: "Required action", value: "Retry install after basic checks" }],
    detectedDeadlines: [],
    suggestedQuestions: ["What is the exact error code?", "Is my phone compatible with this app version?"],
    callScript: "Hi, I am seeing an install error for your app. The error code is [code]. Can you tell me what it means and how to fix it?",
    replyDraft: "Hello, I am trying to install the app but keep seeing this error. Could you help me troubleshoot it?",
    checklist: ["Check connection", "Free storage", "Restart device", "Use official app store"],
    simplifiedExplanation: "The app did not install. Try checking internet, storage, and restarting your phone.",
    shareCard: {
      title: "App install error",
      urgency: "Low",
      meaning: "The app could not install or update.",
      nextStep: "Check connection/storage and retry from the official store.",
    },
    disclaimer: baseDisclaimer,
  },
  {
    category: "medical",
    urgency: "medium",
    confidence: "medium",
    plainTitle: "This looks like a medical portal medication message.",
    oneSentenceSummary: "It may be about a prescription, refill, dosage, appointment, or follow-up instruction.",
    whatThisIs: "This appears to be a message from a medical portal or pharmacy about medication or care instructions.",
    whatItMeans: "The sender may be asking you to review instructions, confirm a refill, schedule follow-up, or contact the care team.",
    whyItMatters: "Medication and care instructions should be confirmed if anything is unclear, especially dosage or timing.",
    nextSteps: [
      "Read the medication name and instructions carefully.",
      "Do not change dosage based only on a summary.",
      "Message the care team or call the pharmacy if anything is unclear.",
    ],
    warnings: ["If you have severe symptoms or trouble breathing, seek urgent or emergency care."],
    keyDetails: [
      { label: "Sender type", value: "Medical portal or pharmacy" },
      { label: "Required action", value: "Confirm instructions if unclear" },
    ],
    detectedDeadlines: [],
    suggestedQuestions: ["What dose should I take?", "When should I start or stop this medication?", "Who should I call if I have side effects?"],
    callScript:
      "Hi, I received a portal message about my medication and want to confirm the instructions. Can you review the dosage, timing, and any warning signs with me?",
    replyDraft:
      "Hello, I received this medication message and want to make sure I understand it correctly. Could you confirm the dose, timing, and what I should do if I have side effects?",
    checklist: ["Confirm medication name", "Confirm dose", "Ask about side effects", "Contact doctor/pharmacist with questions"],
    simplifiedExplanation: "This is probably a health message about medicine. Ask your doctor or pharmacist if any instruction is unclear.",
    shareCard: {
      title: "Medical portal message",
      urgency: "Medium",
      meaning: "It may include medication or care instructions.",
      nextStep: "Confirm dosage and instructions with a doctor or pharmacist.",
    },
    disclaimer:
      "This is a plain-English explanation, not medical advice. Confirm medication, dosage, symptoms, and treatment decisions with a doctor or pharmacist.",
  },
  {
    category: "utility",
    urgency: "high",
    confidence: "high",
    plainTitle: "This looks like a utility bill or shutoff warning.",
    oneSentenceSummary: "A payment may be due soon, and overdue language can make this high priority.",
    whatThisIs: "This appears to be a utility notice for electric, gas, water, internet, or a similar service.",
    whatItMeans: "The company is saying there may be an amount due. If the notice mentions overdue, final notice, or shutoff, handle it quickly.",
    whyItMatters: "Missing a utility deadline can lead to late fees or service interruption.",
    nextSteps: [
      "Verify the amount and due date on the official utility website or app.",
      "Pay through the official channel if the charge is correct.",
      "Call customer support from a trusted bill or website if you need a payment plan.",
    ],
    warnings: ["Be careful with payment links in unexpected texts. Use the official utility website or app."],
    keyDetails: [
      { label: "Required action", value: "Verify and pay if correct" },
      { label: "Possible deadline", value: "Due date or shutoff date on notice" },
    ],
    detectedDeadlines: [{ label: "Payment deadline", dateText: "See notice", explanation: "Pay before the listed due or shutoff date to avoid interruption." }],
    suggestedQuestions: ["Is this balance current?", "Can I set up a payment plan?", "Is there any pending shutoff date?"],
    callScript:
      "Hi, I received a utility notice and want to confirm the balance, due date, and whether there is any risk of service interruption. Can you help me review my options?",
    replyDraft:
      "Hello, I received this utility notice and would like to confirm my balance, due date, and any available payment plan options.",
    checklist: ["Verify in official account", "Confirm due date", "Pay or request payment plan", "Save confirmation number"],
    simplifiedExplanation: "This may be a utility bill. Check the official account and pay soon if it is real.",
    shareCard: {
      title: "Utility bill or warning",
      urgency: "High",
      meaning: "Payment may be due soon and service could be affected.",
      nextStep: "Verify through the official utility account and handle it quickly.",
    },
    disclaimer: baseDisclaimer,
  },
];

function chooseDemo(input: AnalyzeRequest): DemoTemplate {
  const text = input.text?.toLowerCase() ?? "";

  if (text.includes("gift card") || text.includes("zelle") || text.includes("account locked") || text.includes("password") || text.includes("bank")) {
    return demos[1];
  }

  if (text.includes("insurance") || text.includes("benefits") || text.includes("claim") || text.includes("not a bill")) {
    return demos[0];
  }

  if (text.includes("school") || text.includes("permission") || text.includes("field trip")) {
    return demos[2];
  }

  if (text.includes("install") || text.includes("error") || text.includes("app")) {
    return demos[3];
  }

  if (text.includes("medication") || text.includes("pharmacy") || text.includes("doctor") || text.includes("portal")) {
    return demos[4];
  }

  if (text.includes("utility") || text.includes("electric") || text.includes("water") || text.includes("overdue") || text.includes("shutoff")) {
    return demos[5];
  }

  return input.imageBase64 ? demos[0] : demos[1];
}

export function getDemoResult(input: AnalyzeRequest): ClearItAnalysis {
  const template = chooseDemo(input);
  const result: ClearItAnalysis = {
    ...template,
    id: createId("demo"),
    createdAt: new Date().toISOString(),
    warnings: [...template.warnings],
    nextSteps: [...template.nextSteps],
    keyDetails: [...template.keyDetails],
    detectedDeadlines: [...template.detectedDeadlines],
    suggestedQuestions: [...template.suggestedQuestions],
    checklist: [...template.checklist],
    shareCard: { ...template.shareCard },
  };

  return applySafetyPlaybooks(result, input);
}
