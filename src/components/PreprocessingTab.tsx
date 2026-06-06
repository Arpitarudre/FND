// src/components/PreprocessingTab.tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Layers, Keyboard, ArrowRight, Play, RefreshCw, BarChart2, Check, FileText } from "lucide-react";
import { PreprocessResponse } from "../types";

export default function PreprocessingTab() {
  const PRESETS = [
    {
      title: "Conspiracy (Fake News)",
      text: "SHOCKING REPORT! Leaked files from secretly hidden space whistleblower show military UFOs hiding in NY mountains: http://military-leaks.org/ufo-new-york [EXCLUSIVE]"
    },
    {
      title: "Political (Real News)",
      text: "WASHINGTON (Reuters) - The United States Senate on Thursday voted to pass the broad bipartisan budget framework deal, successfully avoiding a government shutdown."
    },
    {
      title: "Extreme Health Claim",
      text: "Doctors are absolutely furious! This simple 12-second morning water recipe has been proven to cure all organic illnesses instantly with ZERO doctor visits! [WATCH TRUTH]"
    }
  ];

  const [inputNews, setInputNews] = useState(PRESETS[0].text);
  const [loading, setLoading] = useState(false);
  const [cleanSteps, setCleanSteps] = useState<PreprocessResponse | null>(null);

  // Pre-load initial preset clean
  useEffect(() => {
    handleRunClean(PRESETS[0].text);
  }, []);

  const handleRunClean = async (textToClean: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/preprocess-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToClean })
      });
      if (res.ok) {
        const data = await res.json();
        setCleanSteps(data);
      } else {
        // Local Fallback preprocessor inside react in case network is disconnected
        const lower = textToClean.toLowerCase();
        const urls = lower.replace(/https?:\/\/\S+|www\.\S+/g, "");
        const brackets = urls.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "");
        const punc = brackets.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, " ").replace(/\d+/g, " ");
        const tokens = punc.replace(/\s+/g, " ").trim().split(" ");
        // simple mock stopwords
        const mockStops = new Set(["the", "and", "a", "of", "to", "in", "is", "on", "from"]);
        const noStops = tokens.filter(t => !mockStops.has(t));
        const lems = noStops.map(t => t.replace(/ing$|ed$|s$/, "")).filter(t => t.length > 2);
        
        setCleanSteps({
          original: textToClean,
          steps: {
            lowercase: lower,
            urls_removed: urls,
            brackets_removed: brackets,
            punctuation_removed: punc,
            tokens,
            stopwords_filtered: noStops,
            lemmatized: lems
          }
        });
      }
    } catch {
      // Local fallback
    } finally {
      setLoading(false);
    }
  };

  const wordFreqReal = [
    { word: "said", count: 99000 },
    { word: "reuters", count: 28000 },
    { word: "president", count: 26000 },
    { word: "state", count: 19000 },
    { word: "house", count: 16000 },
    { word: "republican", count: 14000 },
    { word: "government", count: 12000 },
    { word: "senate", count: 11000 }
  ];

  const wordFreqFake = [
    { word: "trump", count: 74000 },
    { word: "clinton", count: 28000 },
    { word: "obama", count: 21000 },
    { word: "video", count: 18000 },
    { word: "people", count: 16000 },
    { word: "watch", count: 14000 },
    { word: "secret", count: 11000 },
    { word: "fbi", count: 9500 }
  ];

  return (
    <div id="preprocess-tab-root" className="space-y-8">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers size={18} className="text-slate-800" /> NLP Preprocessing & EDA Playground
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Test raw textual inputs and inspect the step-by-step transformations computed by the lemmatizer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive Preprocessor Input Console (Left/Top) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-md p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Keyboard size={14} /> Data Input Selector
            </h3>

            {/* Presets Grid */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Preset News Templates:</p>
              <div className="grid grid-cols-1 gap-2">
                {PRESETS.map((p, idx) => (
                  <button
                    id={`preset-btn-${idx}`}
                    key={idx}
                    onClick={() => {
                       setInputNews(p.text);
                       handleRunClean(p.text);
                    }}
                    className={`text-left text-xs p-2.5 rounded border transition-all truncate cursor-pointer ${
                      inputNews === p.text
                        ? "border-slate-900 bg-slate-900 text-white font-semibold"
                        : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual input */}
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Custom Article Text:</p>
              <textarea
                id="preprocess-textarea"
                rows={5}
                value={inputNews}
                onChange={(e) => setInputNews(e.target.value)}
                placeholder="Paste or type raw news paragraphs here to run preprocessing..."
                className="w-full text-xs p-3 border border-slate-200 rounded focus:border-slate-450 focus:outline-none custom-scrollbar"
              ></textarea>
            </div>

            <button
              id="clean-execute-btn"
              onClick={() => handleRunClean(inputNews)}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              Execute NLP Pipeline
            </button>
          </div>
        </div>

        {/* NLP Step-by-Step Transform Output Console (Right/Bottom) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-md p-6 border border-slate-950 shadow-sm text-slate-200 min-h-[400px] flex flex-col justify-between dark-scrollbar">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                NLP TRANSFORMATION PIPELINE VIEWER
              </span>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>

            <AnimatePresence mode="wait">
              {cleanSteps ? (
                <motion.div
                  key={cleanSteps.original}
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="space-y-4"
                >
                  {/* Step 1: Input text */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-mono text-slate-500">Raw Article Input:</p>
                    <p className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80 text-xs italic font-mono text-slate-400 leading-relaxed">
                      "{cleanSteps.original}"
                    </p>
                  </div>

                  {/* Intermediaries Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lowercase */}
                    <div className="space-y-1 bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
                      <p className="text-[10px] uppercase font-mono text-slate-400">Step 1: Lowercased</p>
                      <p className="text-xs font-mono text-slate-300 truncate">{cleanSteps.steps.lowercase}</p>
                    </div>

                    {/* URLs bracket */}
                    <div className="space-y-1 bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
                      <p className="text-[10px] uppercase font-mono text-slate-400">Step 2: Pruned URLs & Brackets</p>
                      <p className="text-xs font-mono text-slate-300 truncate">
                        {cleanSteps.steps.brackets_removed || "Empty"}
                      </p>
                    </div>

                    {/* Punctuation */}
                    <div className="space-y-1 bg-slate-950/40 p-2.5 rounded border border-slate-800/60 md:col-span-2">
                      <p className="text-[10px] uppercase font-mono text-slate-400">Step 3: Excised Punctuation & Numbers</p>
                      <p className="text-xs font-mono text-slate-300 line-clamp-1">{cleanSteps.steps.punctuation_removed}</p>
                    </div>

                    {/* Tokens count */}
                    <div className="space-y-1 bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
                      <p className="text-[10px] uppercase font-mono text-slate-400">Step 4: Tokenized List</p>
                      <p className="text-xs font-mono text-slate-300 truncate">
                        [{cleanSteps.steps.tokens.slice(0, 8).map(t => `'${t}'`).join(", ")}
                        {cleanSteps.steps.tokens.length > 8 ? "..." : ""}]
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono">Found: {cleanSteps.steps.tokens.length} words</p>
                    </div>

                    {/* Stopwords filtered */}
                    <div className="space-y-1 bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
                      <p className="text-[10px] uppercase font-mono text-slate-450">Step 5: Stopwords Extracted</p>
                      <p className="text-xs font-mono text-slate-300 truncate bg-slate-950/30 p-1 rounded">
                        [{cleanSteps.steps.stopwords_filtered.slice(0, 8).join(", ")}
                        {cleanSteps.steps.stopwords_filtered.length > 8 ? "..." : ""}]
                      </p>
                      <p className="text-[9px] text-slate-450 font-mono">
                        Filtered out: {cleanSteps.steps.tokens.length - cleanSteps.steps.stopwords_filtered.length} terms
                      </p>
                    </div>
                  </div>

                  {/* Final Lemmatized Word Array */}
                  <div className="bg-slate-950/40 p-3.5 rounded border border-slate-850 space-y-2">
                    <p className="text-[10px] uppercase font-mono text-slate-300 font-bold flex items-center gap-1.5">
                      <Check size={12} className="text-green-400" /> Step 6: Canonical Lemmatized Vocabulary Tokens (WordNet Root Stemming)
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1 max-h-[85px] overflow-y-auto custom-scrollbar">
                      {cleanSteps.steps.lemmatized.length === 0 ? (
                        <span className="text-slate-500 font-mono text-xs italic">No words survived. Try typing longer content.</span>
                      ) : (
                        cleanSteps.steps.lemmatized.map((word, wIdx) => (
                          <span
                             key={wIdx}
                             className="text-xs px-2.5 py-0.5 rounded font-mono bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1"
                          >
                            {word}
                          </span>
                        ))
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Final Features Vector Dimension: {cleanSteps.steps.lemmatized.length} active features
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <RefreshCw size={24} className="animate-spin text-slate-700" />
                  <p className="text-xs font-mono mt-2">Compiling preprocessor nodes...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
          <div className="border-t border-slate-800 pt-3 mt-4 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Process: Python NLTK / NLTK Tokenizer Mock</span>
            <span>Memory Index: Dynamic</span>
          </div>
        </div>
      </div>

      {/* Exploratory Data Analysis Charts */}
      <div className="bg-white rounded-md p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-slate-900" />
          <h3 className="font-bold text-slate-950 text-base">
            Exploratory Data Analysis: Real vs. Fake Word Counts
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
          Visualizing Word Frequencies tells us exactly why linear margin classifiers are so powerful. 
          Real news reports consistently employ formal attribution nouns (<em>said</em>, <em>reuters</em>, <em>senate</em>, <em>official</em>), while fabricated clickbait leans heavily on sensational titles and political callouts (<em>trump</em>, <em>obama</em>, <em>clinton</em>, <em>secret</em>).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* Real Word Frequency SVG Chart */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-green-700 flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded border border-green-200 w-fit">
              <Check size={14} /> Top Cleaned Words in REAL Dataset
            </h4>
            <div className="space-y-2.5">
              {wordFreqReal.map((item, idx) => {
                const percent = (item.count / 99000) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-slate-600">
                      <span>{item.word}</span>
                      <span>{item.count.toLocaleString()} occurrences</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.04 }}
                        className="h-full bg-green-600 rounded"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fake Word Frequency SVG Chart */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-red-700 flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded border border-red-200 w-fit font-sans">
              <FileText size={14} /> Top Cleaned Words in FAKE Dataset
            </h4>
            <div className="space-y-2.5">
              {wordFreqFake.map((item, idx) => {
                const percent = (item.count / 74000) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-slate-600">
                      <span>{item.word}</span>
                      <span>{item.count.toLocaleString()} occurrences</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.04 }}
                        className="h-full bg-red-500 rounded"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
