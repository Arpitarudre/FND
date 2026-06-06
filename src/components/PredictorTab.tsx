import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  CornerDownRight,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

import { PredictCompareResponse, GeminiCheckResponse } from "../types";

export default function PredictorTab() {
  const BASE_URL = "https://fake-news-detection-tcc2.onrender.com";

  const SAMPLES = [
    {
      title: "U.S. Budget Legislation (Real)",
      text:
        "WASHINGTON (Reuters) - The United States Senate on Thursday approved a major bipartisan budget agreement."
    },
    {
      title: "Mars Space Conspiracy (Fake)",
      text:
        "SHOCKING DISCOVERY ALERT! Secret leaked photos reveal hidden alien bases on Mars!"
    }
  ];

  const [inputText, setInputText] = useState(SAMPLES[0].text);
  const [inferenceMode, setInferenceMode] = useState<"local" | "gemini">("local");
  const [running, setRunning] = useState(false);
  const [localResult, setLocalResult] = useState<PredictCompareResponse | null>(null);
  const [geminiResult, setGeminiResult] = useState<GeminiCheckResponse | null>(null);
  const [showError, setShowError] = useState<string | null>(null);

  const triggerAnalysis = async () => {
    if (!inputText.trim()) return;

    setRunning(true);
    setShowError(null);

    try {
      if (inferenceMode === "local") {
        setGeminiResult(null);

        const res = await fetch(`${BASE_URL}/predict-compare`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Server error");

        setLocalResult(data);
      } else {
        setLocalResult(null);

        const res = await fetch("/api/gemini-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Gemini error");

        setGeminiResult(data);
      }
    } catch (err: any) {
      setShowError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Brain size={18} /> Predictor Console
      </h2>

      <textarea
        className="w-full border p-2 rounded"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <button
        onClick={triggerAnalysis}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Run Prediction
      </button>

      {running && <p>Running model...</p>}

      {showError && <p className="text-red-500">{showError}</p>}

      {localResult && (
        <div>
          <h3>Result: {localResult.lr.label}</h3>
        </div>
      )}
    </div>
  );
}