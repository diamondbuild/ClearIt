import { ClearItAnalysis } from "@/lib/types";

export const DEMO_RESULTS: ClearItAnalysis[] = [
  {
    id: "demo-insurance-eob",
    createdAt: new Date().toISOString(),
    category: "insurance",
    urgency: "low",
    confidence: "high",
    plainTitle: "This is an Explanation of Benefits — not a bill.",
    oneSentenceSummary:
      "Your insurance company is showing you what they paid for a recent doctor visit — you don't owe anything additional.",
    whatThisIs:
      "This is an Explanation of Benefits (EOB) from your health insurance company. It is a summary showing how your insurance processed a recent medical claim. It is NOT a bill. You do not need to pay this amount.",
    whatItMeans:
      "Your doctor submitted a claim to your insurance after your appointment. The insurance reviewed it, paid their portion, and this document explains the breakdown. The amount shown may look scary, but it represents what was billed, not what you actually owe.",
    whyItMatters:
      "You should keep this document for your records. If you later receive a bill from your doctor that seems higher than expected, compare it to this EOB. If they don't match, call your insurance company.",
    nextSteps: [
      "Do NOT pay this document — it is not a bill.",
      "Wait for a separate bill from your doctor's office if you owe a copay or deductible.",
      "Compare the EOB to any future bill from your provider to make sure the amounts match.",
      "File this document for your health records.",
    ],
    warnings: [],
    keyDetails: [
      { label: "Document type", value: "Explanation of Benefits (EOB)" },
      { label: "Status", value: "Claim Processed" },
      { label: "Patient responsibility", value: "$0.00" },
      { label: "Insurance paid", value: "$245.00" },
    ],
    detectedDeadlines: [],
    suggestedQuestions: [
      "Is this really not a bill?",
      "What happens if I get a separate bill?",
      "Who do I call if the bill amount doesn't match?",
    ],
    callScript:
      "Hi, I received an Explanation of Benefits for a recent visit. I want to confirm — do I owe any money, or is this just a summary? Thank you.",
    replyDraft:
      "Hello, I received an Explanation of Benefits dated [date]. I'd like to confirm I don't owe any additional amount. Please let me know if there's anything I need to do. Thank you.",
    checklist: [
      "Read the EOB carefully",
      "Confirm it says 'This is not a bill'",
      "File it with your medical records",
      "Wait for actual bill from provider if applicable",
      "Compare to provider bill when received",
    ],
    simplifiedExplanation:
      "This paper is from your insurance company. They are telling you what they paid for your doctor visit. You do NOT need to pay this. Keep it safe in case you get a bill later.",
    shareCard: {
      title: "Insurance Explanation of Benefits",
      urgency: "Low",
      meaning: "This is not a bill — your insurance is just showing what they paid.",
      nextStep: "No action needed. File for your records.",
    },
    disclaimer:
      "This is a plain-English explanation of what appears to be an insurance document. Always verify billing and payment details directly with your insurance company and healthcare provider.",
  },

  {
    id: "demo-bank-scam",
    createdAt: new Date().toISOString(),
    category: "possible_scam",
    urgency: "possible_scam",
    confidence: "high",
    plainTitle: "This looks like a bank scam text message.",
    oneSentenceSummary:
      "This text is almost certainly a scam designed to steal your banking information — do not click any links.",
    whatThisIs:
      "This appears to be a 'smishing' attack — a scam text message pretending to be from your bank. Scammers send these to trick people into clicking fake links and entering their banking credentials or personal information.",
    whatItMeans:
      "The sender is NOT your real bank. Your bank will never text you asking you to verify your account by clicking a link or provide your full account number, password, or Social Security number via text. This is a fraud attempt.",
    whyItMatters:
      "If you click the link or enter any information, scammers could gain access to your bank account, steal money, or use your identity. This is a serious threat to your finances.",
    nextSteps: [
      "Do NOT click any links in this message.",
      "Do NOT call any phone number listed in this message.",
      "Do NOT reply to this message.",
      "If you're concerned about your account, go directly to your bank's official website or call the number on the back of your debit/credit card.",
      "Report this message to your bank's fraud line.",
      "Forward the text to 7726 (SPAM) to report it to your carrier.",
      "Delete the message after reporting.",
    ],
    warnings: [
      "Do not click links, call numbers, or send money based only on this message. Use the official app, official website, or a phone number from a trusted source.",
      "This message shows classic scam signals: urgency, threats, and requests to click a link.",
      "Your real bank will never ask for your full password or Social Security number via text.",
    ],
    keyDetails: [
      { label: "Sender", value: "Unknown / suspicious number" },
      { label: "Scam type", value: "Smishing (SMS phishing)" },
      { label: "Red flags", value: "Urgent language, link in message" },
    ],
    detectedDeadlines: [],
    suggestedQuestions: [
      "How do I know if a text is really from my bank?",
      "What if I already clicked the link?",
      "How do I report this?",
    ],
    callScript:
      "Hi, I received a suspicious text claiming to be from your bank. I want to report it and verify my account is secure. I did not click any links. Can you check my account for any unusual activity?",
    replyDraft:
      "Do not reply to suspected scam messages. Contact your bank directly using the official number on the back of your card.",
    checklist: [
      "Do NOT click any links",
      "Do NOT call numbers in the message",
      "Call your bank using the number on your card",
      "Check your account for suspicious activity",
      "Report to bank's fraud line",
      "Forward to 7726 (SPAM)",
      "Delete the message",
    ],
    simplifiedExplanation:
      "This text is trying to trick you. It is NOT from your bank. Don't click anything. Call your bank using the phone number on the back of your bank card.",
    shareCard: {
      title: "Possible Bank Scam Text",
      urgency: "Possible Scam",
      meaning: "This appears to be a scam text pretending to be from your bank.",
      nextStep: "Do NOT click any links. Call your bank directly.",
    },
    disclaimer:
      "This is a plain-English explanation of what appears to be a fraudulent message. Do not click links or provide personal information. Contact your bank directly using official channels.",
  },

  {
    id: "demo-school-form",
    createdAt: new Date().toISOString(),
    category: "school_form",
    urgency: "medium",
    confidence: "high",
    plainTitle: "This is a school permission slip that needs your signature.",
    oneSentenceSummary:
      "Your child's school needs your permission and signature for an upcoming field trip or activity.",
    whatThisIs:
      "This is a parental permission form from your child's school. Schools are required to get written consent from parents or guardians before students participate in field trips, certain activities, or programs outside the normal school day.",
    whatItMeans:
      "You need to read this, sign it, and return it by the deadline. If you don't return it in time, your child may not be able to participate in the event.",
    whyItMatters:
      "Missing the deadline means your child could be left out of the activity. The school also needs this for legal and safety reasons.",
    nextSteps: [
      "Read the form completely before signing.",
      "Check the event date, location, and any special requirements (clothing, supplies, money).",
      "Sign and date the form.",
      "Return it to your child's teacher by the deadline.",
      "Keep a copy for your records if possible.",
    ],
    warnings: [],
    keyDetails: [
      { label: "Document type", value: "Permission Slip / Consent Form" },
      { label: "Return to", value: "Your child's teacher" },
      { label: "Action required", value: "Sign and return" },
    ],
    detectedDeadlines: [
      {
        label: "Return deadline",
        dateText: "See form for specific date",
        explanation: "You must return the signed form before this date for your child to participate.",
      },
    ],
    suggestedQuestions: [
      "What happens if I miss the deadline?",
      "Can I submit this electronically?",
      "Who do I contact with questions?",
    ],
    callScript:
      "Hi, I'm calling about the permission slip my child brought home. I have a question about [specific item]. Can you help me?",
    replyDraft:
      "Hello, I'm [Parent Name], parent of [Child Name] in [Grade/Class]. I'm returning the signed permission slip for [Event]. Please let me know if you need anything else.",
    checklist: [
      "Read the entire form",
      "Note the event date and any requirements",
      "Sign and date the form",
      "Give form to your child to return to teacher",
      "Note the return deadline on your calendar",
    ],
    simplifiedExplanation:
      "Your child's school needs you to sign a paper so your child can go on a trip or do a special activity. Sign it and send it back to the teacher before the deadline.",
    shareCard: {
      title: "School Permission Slip",
      urgency: "Medium",
      meaning: "Your child's school needs your signature for an upcoming activity.",
      nextStep: "Sign the form and return it to the teacher by the deadline.",
    },
    disclaimer:
      "This is a plain-English explanation of what appears to be a school form. Always read official school communications carefully and contact the school directly with any questions.",
  },

  {
    id: "demo-app-error",
    createdAt: new Date().toISOString(),
    category: "app_error",
    urgency: "low",
    confidence: "high",
    plainTitle: "This is a software installation error message.",
    oneSentenceSummary:
      "An app failed to install because of a compatibility or permission issue — this is usually fixable.",
    whatThisIs:
      "This is a software error message that appeared when you tried to install or update an application. Error messages like this indicate something went wrong during the installation process — usually a compatibility issue, a permission problem, or a corrupted download.",
    whatItMeans:
      "The application did not install correctly. You'll need to troubleshoot the issue before the app will work. This is a common problem and usually solvable without technical expertise.",
    whyItMatters:
      "The app won't work until this is resolved. The good news is this is usually not a serious problem and can be fixed with a few troubleshooting steps.",
    nextSteps: [
      "Restart your device and try installing again.",
      "Make sure you have enough storage space available.",
      "Check that you're running a compatible operating system version.",
      "Try downloading the installer again (the file may be corrupted).",
      "Temporarily disable antivirus software if it might be blocking the installation.",
      "Search the error code online for specific solutions.",
      "Contact the app's support team if none of the above works.",
    ],
    warnings: [],
    keyDetails: [
      { label: "Error type", value: "Installation failure" },
      { label: "Severity", value: "Low — no data loss, no security risk" },
    ],
    detectedDeadlines: [],
    suggestedQuestions: [
      "Is my data safe?",
      "Do I need to buy new software?",
      "Who can help me fix this?",
    ],
    callScript:
      "Hi, I'm getting an error when I try to install your software. The error message says [error text]. I'm running [operating system]. Can you help me troubleshoot this?",
    replyDraft:
      "Hello support team, I'm experiencing an installation error with your application. The error message reads: [error text]. I'm using [operating system version]. I've already tried restarting and re-downloading. Please advise on next steps.",
    checklist: [
      "Restart your device",
      "Check available storage space",
      "Re-download the installer",
      "Check OS compatibility requirements",
      "Try running as administrator",
      "Contact app support if still failing",
    ],
    simplifiedExplanation:
      "An app tried to install on your device but something went wrong. This is usually not a big deal. Try turning your device off and on again, then try installing the app again.",
    shareCard: {
      title: "App Installation Error",
      urgency: "Low",
      meaning: "An app failed to install — this is usually fixable.",
      nextStep: "Restart your device and try installing again.",
    },
    disclaimer:
      "This is a plain-English explanation of what appears to be a software error message. For specific technical solutions, consult the software's official support documentation.",
  },

  {
    id: "demo-medical-message",
    createdAt: new Date().toISOString(),
    category: "medical",
    urgency: "medium",
    confidence: "high",
    plainTitle: "This is a message from your medical provider about a prescription.",
    oneSentenceSummary:
      "Your doctor's office sent a message about a medication — you may need to take an action or confirm something.",
    whatThisIs:
      "This appears to be a secure message from your doctor's office or patient portal about a prescription or medication. Healthcare providers send these to communicate medication instructions, prescription renewals, or important updates about your treatment.",
    whatItMeans:
      "Your doctor or their staff sent you information about your medication. This could be a new prescription, a renewal notice, dosage instructions, or a reminder. You should read it carefully and respond if action is needed.",
    whyItMatters:
      "Medication communications from your doctor are important for your health. Missing or misunderstanding these messages could affect your treatment.",
    nextSteps: [
      "Read the message carefully in its entirety.",
      "If a prescription was sent to a pharmacy, confirm which pharmacy and when it will be ready.",
      "If you have questions about the medication, call your doctor's office or speak with a pharmacist.",
      "If the message asks you to confirm something, do so through the official patient portal only.",
      "Do not make changes to your medication routine without consulting your doctor.",
    ],
    warnings: [],
    keyDetails: [
      { label: "Message source", value: "Medical provider / patient portal" },
      { label: "Action required", value: "Review and confirm" },
    ],
    detectedDeadlines: [],
    suggestedQuestions: [
      "What is this medication for?",
      "Are there any side effects I should know about?",
      "When should I pick up my prescription?",
      "Do I need to do anything before starting?",
    ],
    callScript:
      "Hi, I received a message through the patient portal about a prescription for [medication name]. I wanted to confirm the details and ask a few questions. Is [medication name] ready for pickup? What are the instructions for taking it?",
    replyDraft:
      "Hello, I received your message about my prescription through the portal. I have a couple of questions: [question 1], [question 2]. Please let me know at your earliest convenience. Thank you.",
    checklist: [
      "Read the full message from your provider",
      "Note any medication name, dosage, and instructions",
      "Confirm the pharmacy location",
      "Ask your pharmacist about side effects when picking up",
      "Schedule any follow-up appointments mentioned",
    ],
    simplifiedExplanation:
      "Your doctor sent you a note about your medicine. Read it carefully. If you're not sure what it means, call your doctor's office or ask the pharmacist when you pick up your medicine.",
    shareCard: {
      title: "Medical Prescription Message",
      urgency: "Medium",
      meaning: "Your doctor sent a message about your medication — action may be needed.",
      nextStep: "Read the full message and contact your doctor or pharmacist with questions.",
    },
    disclaimer:
      "This is a plain-English explanation, not medical advice. Confirm all medication instructions, dosages, symptoms, and treatment decisions with your doctor or pharmacist.",
  },

  {
    id: "demo-utility-bill",
    createdAt: new Date().toISOString(),
    category: "utility",
    urgency: "high",
    confidence: "high",
    plainTitle: "This is an overdue utility bill — payment is required soon.",
    oneSentenceSummary:
      "Your electricity or gas bill has a past-due balance and your service may be disconnected if you don't pay.",
    whatThisIs:
      "This is a utility bill from your electricity, gas, or water provider. It shows your current charges, any past-due balance, and a payment due date. The language suggests a past-due amount that has triggered a disconnection warning.",
    whatItMeans:
      "You have a balance due on your utility account. The bill indicates that if you don't pay by the stated date, your service could be disconnected. Reconnection fees and deposits may apply if service is interrupted.",
    whyItMatters:
      "Utility disconnection can happen quickly after the deadline and may result in additional fees. Acting now prevents interruption to your essential services.",
    nextSteps: [
      "Pay the amount due before the deadline to avoid disconnection.",
      "If you cannot pay in full, call the utility company immediately to discuss payment plans.",
      "Ask about hardship or assistance programs — many utilities offer these.",
      "Keep your account number ready when you call.",
      "After paying, save your confirmation number or receipt.",
    ],
    warnings: [
      "Service disconnection may occur if payment is not received by the due date.",
      "Reconnection fees may apply if service is interrupted.",
    ],
    keyDetails: [
      { label: "Bill type", value: "Utility Bill (Electricity / Gas / Water)" },
      { label: "Status", value: "Past Due" },
      { label: "Action required", value: "Pay immediately or call provider" },
    ],
    detectedDeadlines: [
      {
        label: "Payment due date",
        dateText: "See bill for exact date",
        explanation: "Pay before this date to avoid service disconnection.",
      },
    ],
    suggestedQuestions: [
      "Can I set up a payment plan?",
      "Are there assistance programs I can apply for?",
      "What is the reconnection fee if I'm disconnected?",
    ],
    callScript:
      "Hi, I'm calling about my account. I received a past-due notice and want to discuss my options. My account number is [account number]. Can you tell me the exact amount due and whether there are any payment plan options available?",
    replyDraft:
      "Hello, I am writing regarding account number [account number]. I received a past-due notice and would like to discuss payment options. Please contact me at [phone/email] to arrange payment. Thank you.",
    checklist: [
      "Find your account number on the bill",
      "Check the exact amount due and due date",
      "Pay online, by phone, or in person",
      "If unable to pay in full, call to request a payment plan",
      "Ask about utility assistance programs",
      "Save your payment confirmation number",
    ],
    simplifiedExplanation:
      "You owe money on your electricity or gas bill. You need to pay it soon or they might turn off your service. Call the company if you can't pay the full amount — they may be able to help.",
    shareCard: {
      title: "Past-Due Utility Bill",
      urgency: "High",
      meaning: "Your utility bill is overdue and service may be disconnected soon.",
      nextStep: "Pay the balance now or call the utility company to set up a payment plan.",
    },
    disclaimer:
      "This is a plain-English explanation of what appears to be a utility bill. Contact your utility provider directly to verify your balance and discuss payment options.",
  },
];

export function getDemoResult(index: number = 0): ClearItAnalysis {
  const result = DEMO_RESULTS[index % DEMO_RESULTS.length];
  return {
    ...result,
    id: `demo-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}

export function getRandomDemoResult(): ClearItAnalysis {
  const index = Math.floor(Math.random() * DEMO_RESULTS.length);
  return getDemoResult(index);
}
