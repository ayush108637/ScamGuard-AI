import { RiskLevel, ScanResult } from "@/src/types";

const linkRules = [
  { words: ["bit.ly", "tinyurl", "t.co", "goo.gl", "is.gd", "cutt.ly", "shorturl"], points: 2, reason: "URL shortener hides the final destination." },
  { words: ["@", "xn--"], points: 2, reason: "The address uses a deceptive URL pattern." },
  { words: ["verify", "verification", "kyc", "suspend", "blocked", "update-account", "login-now"], points: 2, reason: "The link uses urgent account or verification language." },
  { words: ["prize", "reward", "lottery", "cashback", "bonus", "free-gift"], points: 2, reason: "The link mentions a reward or prize claim." },
  { words: ["pay", "payment", "upi", "refund", "claim-now", "fee"], points: 1, reason: "The link references payment or a refund." },
];

const messageRules = [
  { words: ["otp", "one time password", "verification code"], type: "OTP theft", points: 3, reason: "Requests or references an OTP." },
  { words: ["upi pin", "atm pin", "pin number", "cvv", "password"], type: "Credential theft", points: 3, reason: "Requests a secret PIN, password, or banking credential." },
  { words: ["kyc", "account will be blocked", "account suspended", "pan update"], type: "Fake KYC / account suspension", points: 3, reason: "Uses an account suspension or KYC warning." },
  { words: ["prize", "lottery", "winner", "reward"], type: "Fake prize / lottery", points: 2, reason: "Promises a prize, lottery win, or reward." },
  { words: ["job offer", "work from home", "registration fee", "hiring"], type: "Fake job", points: 2, reason: "Looks like an unsolicited job offer." },
  { words: ["guaranteed return", "double your money", "crypto profit", "investment"], type: "Investment scam", points: 3, reason: "Promises investment gains or guaranteed returns." },
  { words: ["urgent payment", "send money", "transfer now", "pay immediately"], type: "Urgent payment", points: 3, reason: "Pressures the reader to send money immediately." },
  { words: ["digital arrest", "arrested", "police case", "cbi", "court notice"], type: "Impersonation / digital arrest", points: 3, reason: "Uses police, court, or arrest threats." },
  { words: ["courier", "customs", "parcel", "challan", "rto"], type: "Courier / RTO scam", points: 2, reason: "Matches a parcel, customs, RTO, or challan scam pattern." },
  { words: ["cashback", "refund", "customer support", "helpline"], type: "Fake support / refund", points: 2, reason: "Matches a fake support, refund, or cashback pattern." },
  { words: [".apk", "install this app", "download apk", "unknown sources"], type: "Malicious APK", points: 3, reason: "Requests a suspicious app download or install." },
  { words: ["qr code", "scan to receive", "collect request"], type: "UPI / payment scam", points: 3, reason: "Uses a QR or collect request to disguise a payment." },
];

function riskFromScore(score: number): RiskLevel {
  if (score >= 5) return "HIGH";
  if (score >= 2) return "MEDIUM";
  return "LOW";
}

export function analyzeLink(input: string): ScanResult {
  const normalized = input.trim().toLowerCase();
  let score = 0;
  const reasons: string[] = [];
  linkRules.forEach((rule) => {
    if (rule.words.some((word) => normalized.includes(word))) {
      score += rule.points;
      reasons.push(rule.reason);
    }
  });
  if (!normalized.includes(".") && !normalized.startsWith("http")) {
    score += 2;
    reasons.push("This does not look like a complete website address.");
  }
  if (normalized.includes("http://")) {
    score += 1;
    reasons.push("The link is not using encrypted HTTPS.");
  }
  return {
    risk: riskFromScore(score),
    title: riskFromScore(score) === "LOW" ? "No obvious red flags found" : "This link needs caution",
    scamType: score >= 5 ? "Multiple suspicious indicators" : score >= 2 ? "Potentially suspicious link" : "No specific scam pattern detected",
    reasons: reasons.length ? reasons : ["No local-rule indicators matched this address."],
    action: "Do not enter OTP/PIN/password. Verify the website from an official source before opening or signing in.",
    input: input.trim(),
  };
}

export function analyzeMessage(input: string): ScanResult {
  const normalized = input.trim().toLowerCase();
  let score = 0;
  const reasons: string[] = [];
  const types: string[] = [];
  messageRules.forEach((rule) => {
    if (rule.words.some((word) => normalized.includes(word))) {
      score += rule.points;
      reasons.push(rule.reason);
      if (!types.includes(rule.type)) types.push(rule.type);
    }
  });
  if (["urgent", "immediately", "now", "within 24 hours", "secret"].some((word) => normalized.includes(word))) {
    score += 1;
    reasons.push("Creates urgency or pressure to act without checking.");
  }
  const risk = riskFromScore(score);
  return {
    risk,
    title: risk === "LOW" ? "No obvious scam pattern found" : "Treat this message as suspicious",
    scamType: types.length ? types.join(" · ") : "No specific scam pattern detected",
    reasons: reasons.length ? reasons : ["No local-rule indicators matched this message."],
    action: risk === "HIGH" ? "Do not reply, click links, install apps, or send money. Block and report the sender; call 1930 if money was lost." : "Pause and verify using a trusted phone number or official app before taking action.",
    input: input.trim(),
  };
}