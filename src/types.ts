// src/types.ts
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PreprocessingSteps {
  lowercase: string;
  urls_removed: string;
  brackets_removed: string;
  punctuation_removed: string;
  tokens: string[];
  stopwords_filtered: string[];
  lemmatized: string[];
}

export interface PreprocessResponse {
  original: string;
  steps: PreprocessingSteps;
}

export interface ActiveTermLR {
  term: string;
  tfidf: number;
  weight: number;
  score: number;
}

export interface ActiveTermNB {
  term: string;
  count: number;
  logRealProp: number;
  logFakeProp: number;
}

export interface ActiveTermSVM {
  term: string;
  tfidf: number;
  weight: number;
  score: number;
}

export interface ModelPredictionResultLR {
  label: "Real" | "Fake";
  probability: number;
  confidence: number;
  activeTerms: ActiveTermLR[];
  decisionVal: number;
}

export interface ModelPredictionResultNB {
  label: "Real" | "Fake";
  probability: number;
  confidence: number;
  activeTerms: ActiveTermNB[];
  logReal: number;
  logFake: number;
}

export interface ModelPredictionResultSVM {
  label: "Real" | "Fake";
  probability: number;
  confidence: number;
  activeTerms: ActiveTermSVM[];
  decisionVal: number;
}

export interface PredictCompareResponse {
  empty: boolean;
  tokens?: string[];
  vocabCount?: number;
  lr: ModelPredictionResultLR;
  nb: ModelPredictionResultNB;
  svm: ModelPredictionResultSVM;
}

export interface CredibilityMarker {
  marker: string;
  credibility: "High" | "Medium" | "Low";
  description: string;
}

export interface GeminiCheckResponse {
  verdict: "Fake" | "Real" | "Skeptic/Partially True";
  confidence: number;
  stylistic_critique: string;
  credibility_markers: CredibilityMarker[];
  factual_context: string;
  error?: string;
}

export interface ModelStats {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  trainTime: number;
  testTime: number;
  confusionMatrix: number[][]; // [[TN, FP], [FN, TP]]
}
