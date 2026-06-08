import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const text = req.body?.text;

  if (!text) {
    return res.status(400).json({
      error: "Text empty",
    });
  }

  const lowercase = text.toLowerCase();

  const cleaned = lowercase
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();

  const tokens = cleaned.split(/\s+/).filter(Boolean);

  const wordCount = tokens.length;

  return res.status(200).json({
    original: text,
    lowercase,
    cleaned,
    tokens,
    wordCount,
  });
}