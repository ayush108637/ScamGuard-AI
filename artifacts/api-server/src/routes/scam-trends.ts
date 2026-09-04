import { Router, type IRouter } from "express";
import type { ScamTrendsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const officialSource =
  "Curated from I4C, CERT-In and Government of India cyber-safety advisories";

const trends = [
  {
    id: "digital-arrest",
    name: "Digital Arrest Scams",
    severity: "high" as const,
    summary: "Criminals pose as police or courts and demand money over a video call.",
    howItWorks:
      "A caller claims your identity or parcel is linked to a crime, keeps you on camera, and demands an immediate transfer to avoid arrest.",
    warningSigns: ["Video-call interrogation", "Threats of arrest", "Demand for secrecy or immediate payment"],
    whatToDo: "End the call, do not transfer money, and call 1930 or your local police station.",
    source: officialSource,
  },
  {
    id: "investment-crypto",
    name: "Investment / Crypto Scams",
    severity: "high" as const,
    summary: "Fake experts promise guaranteed profits through trading groups or apps.",
    howItWorks:
      "A group shows fabricated profits, encourages a small deposit, then blocks withdrawals or asks for repeated fees.",
    warningSigns: ["Guaranteed returns", "Unlicensed app or group", "Pressure to deposit more to withdraw"],
    whatToDo: "Do not invest from a message or group. Verify the entity with official regulators.",
    source: officialSource,
  },
  {
    id: "fake-jobs",
    name: "Fake Job Scams",
    severity: "high" as const,
    summary: "Fraudsters collect registration fees or identity documents for fake work.",
    howItWorks:
      "A recruiter promises quick work, asks for a fee or APK, and disappears after collecting money or personal data.",
    warningSigns: ["Upfront fee", "Unverified recruiter", "Request to install an APK"],
    whatToDo: "Use the employer's official careers page and never pay to get a job.",
    source: officialSource,
  },
  {
    id: "phishing",
    name: "Phishing Scams",
    severity: "high" as const,
    summary: "Lookalike links steal passwords, card details, or one-time passwords.",
    howItWorks:
      "A message creates urgency and sends you to a copycat website that captures information as you sign in.",
    warningSigns: ["Misspelled domain", "Urgent login request", "Shortened link"],
    whatToDo: "Close the page and reach the service from its official app or website.",
    source: officialSource,
  },
  {
    id: "fake-kyc",
    name: "Fake KYC / Account Suspension",
    severity: "high" as const,
    summary: "A fake bank or wallet warning threatens suspension unless you verify now.",
    howItWorks:
      "The sender asks for an OTP, PIN, or a link-based KYC update to take over your account.",
    warningSigns: ["KYC suspension threat", "OTP or PIN request", "Unknown sender"],
    whatToDo: "Ignore the link and contact the bank using the number on its official website or card.",
    source: officialSource,
  },
  {
    id: "messaging",
    name: "WhatsApp / Messaging Scams",
    severity: "medium" as const,
    summary: "Impersonators use familiar names, profile photos, and urgent requests.",
    howItWorks:
      "A fraudster pretends to be a friend, colleague, or family member and asks for a quick transfer or code.",
    warningSigns: ["New number", "Unusual urgency", "Request to keep it secret"],
    whatToDo: "Call the person on a known number before doing anything.",
    source: officialSource,
  },
  {
    id: "malicious-apk",
    name: "Malicious APK / App Scams",
    severity: "high" as const,
    summary: "Fraudulent APK files can spy on your device or capture banking data.",
    howItWorks:
      "A message asks you to enable unknown sources and install a file for a delivery, job, refund, or KYC.",
    warningSigns: ["APK download", "Unknown sources instruction", "Remote access request"],
    whatToDo: "Do not install it. Delete the file and run a security check if already installed.",
    source: officialSource,
  },
  {
    id: "rto-challan",
    name: "Fake RTO / e-Challan Scams",
    severity: "high" as const,
    summary: "Fake traffic notices use payment links or APKs to steal money and data.",
    howItWorks:
      "The message claims an unpaid challan and sends a lookalike link or app with a very short deadline.",
    warningSigns: ["Immediate fine threat", "Payment link in SMS", "APK attachment"],
    whatToDo: "Check challans only on the official Parivahan or state transport website.",
    source: officialSource,
  },
  {
    id: "courier-customs",
    name: "Courier / Customs Scams",
    severity: "high" as const,
    summary: "A fake courier agent claims a parcel has illegal contents or a customs fee.",
    howItWorks:
      "The caller escalates from a parcel issue to police impersonation and asks for a payment or video call.",
    warningSigns: ["Unexpected parcel", "Customs penalty", "Transfer to release package"],
    whatToDo: "Do not share ID details or pay. Contact the courier from its official app.",
    source: officialSource,
  },
  {
    id: "customer-support",
    name: "Fake Customer Support Scams",
    severity: "high" as const,
    summary: "Fake helplines and social profiles ask for remote access or payment details.",
    howItWorks:
      "A search result or social account pretends to be support and asks you to install a remote-control app.",
    warningSigns: ["Unverified helpline", "Remote access app", "Request for OTP or card data"],
    whatToDo: "Use only support details inside the official app or printed card.",
    source: officialSource,
  },
  {
    id: "upi-payment",
    name: "UPI / Payment Scams",
    severity: "high" as const,
    summary: "Scammers trick users into approving a collect request or scanning a QR to receive money.",
    howItWorks:
      "They say a QR code or PIN is needed to receive a refund, then the action actually sends money.",
    warningSigns: ["UPI PIN to receive money", "Unexpected collect request", "QR code from a stranger"],
    whatToDo: "Never enter a UPI PIN to receive money. Decline unknown requests.",
    source: officialSource,
  },
  {
    id: "refund-cashback",
    name: "Fake Refund / Cashback Scams",
    severity: "high" as const,
    summary: "A fake refund agent asks for a code, payment, or screen sharing.",
    howItWorks:
      "The sender claims a refund is pending and uses a link or remote app to access your payment account.",
    warningSigns: ["Unexpected refund", "Screen-sharing request", "Small verification payment"],
    whatToDo: "Check the order only inside the official merchant app and ignore unsolicited calls.",
    source: officialSource,
  },
  {
    id: "ai-impersonation",
    name: "AI-generated Impersonation / Deepfake Scams",
    severity: "high" as const,
    summary: "AI voice or video makes an impersonation feel unusually convincing.",
    howItWorks:
      "A scammer clones a familiar voice or face and asks for urgent money, access, or confidential information.",
    warningSigns: ["Urgent unusual request", "Cannot verify independently", "Pressure not to call back"],
    whatToDo: "Use a known contact method and a family or team verification phrase before acting.",
    source: officialSource,
  },
];

router.get("/scam-trends", (_req, res) => {
  const data: ScamTrendsResponse = {
    trends,
    sourceLabel: officialSource,
    updatedAt: new Date().toISOString(),
  };
  res.json(data);
});

export default router;