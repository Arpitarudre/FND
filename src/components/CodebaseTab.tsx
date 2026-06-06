// src/components/CodebaseTab.tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Terminal, Copy, Check, FileText, Download, Folder, FolderOpen, Play, Server, GitBranch } from "lucide-react";

interface CodeFile {
  name: string;
  path: string;
  description: string;
  code: string;
}

export default function CodebaseTab() {
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const FILE_ENTRIES: CodeFile[] = [
    {
      name: "preprocess.py",
      path: "project/preprocess.py",
      description: "NLTK-based text cleaning and WordNet lemmatization routine module.",
      code: `# preprocess.py
"""
Fake News Detection: Natural Language Processing Preprocessing Module
Author: ML Engineer
Description: Provides clean, modular functions to preprocess raw news articles
             using NLTK (lowercasing, punctuation/number removal, stopword removal, lemmatization).
"""

import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Download requisite NLTK corpora
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

# Initialize Lemmatizer
lemmatizer = WordNetLemmatizer()

# Define English Stopwords
stop_words = set(stopwords.words('english'))

def clean_text(text):
    """
    Cleans and preprocesses the input text for the NLP models.
    """
    if not isinstance(text, str):
        return ""
    
    # 1. Convert to lowercase
    text = text.lower()
    
    # 2. Remove URL links
    text = re.sub(r'https?://\\S+|www\\.\\S+', '', text)
    
    # 3. Remove text inside brackets/parentheses
    text = re.sub(r'\\[.*?\\]', '', text)
    text = re.sub(r'\\(.*?\\)', '', text)
    
    # 4. Remove XML/HTML tags
    text = re.sub(r'<.*?>+', '', text)
    
    # 5. Remove numbers and punctuation
    text = re.sub(r'[%s]' % re.escape(string.punctuation), ' ', text)
    text = re.sub(r'\\w*\\d\\w*', '', text) # Remove words containing digits
    
    # 6. Remove extra whitespaces
    text = re.sub(r'\\s+', ' ', text).strip()
    
    # 7. Tokenize
    tokens = word_tokenize(text)
    
    # 8. Filter stopwords and apply Lemmatization
    cleaned_tokens = []
    for word in tokens:
        if word not in stop_words and len(word) > 2:
            # WordNet lemmatizes nouns by default.
            lemma = lemmatizer.lemmatize(word, pos='v') # Lemmatize as verb
            lemma = lemmatizer.lemmatize(lemma, pos='n') # Lemmatize as noun
            cleaned_tokens.append(lemma)
            
    # 9. Return as single processed string
    return " ".join(cleaned_tokens)
`
    },
    {
      name: "train.py",
      path: "project/train.py",
      description: "TF-IDF extraction, split pipeline implementation and train comparisons.",
      code: `# train.py
"""
Fake News Detection: Machine Learning Model Training and Evaluation Pipeline
Author: ML Engineer
"""

import os
import time
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix

# Import our custom text cleaner
from preprocess import clean_text

def train_and_evaluate():
    print("=============================================================")
    print(" Fake News Detection Training Pipeline initialized ")
    print("=============================================================")
    
    # Check if True.csv and Fake.csv are in dataset/
    true_path = 'dataset/True.csv'
    fake_path = 'dataset/Fake.csv'
    
    df_true = pd.read_csv(true_path)
    df_fake = pd.read_csv(fake_path)
    
    # Assign labels (1 = Real/True News, 0 = Fake News)
    df_true['label'] = 1
    df_fake['label'] = 0
    
    # Merge datasets
    df = pd.concat([df_true, df_fake], ignore_index=True)
    df['full_text'] = df['title'] + " " + df['text']
    df = df.dropna(subset=['full_text'])
    
    # Preprocessing
    df['cleaned_text'] = df['full_text'].apply(clean_text)
    df = df[df['cleaned_text'] != ""]
    
    X = df['cleaned_text']
    y = df['label']
    
    # 80% Train, 20% Test stratified split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Fit TF-IDF Vectorizer (Top 5000 features limit)
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # Train Models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Multinomial Naive Bayes": MultinomialNB(),
        "Linear SVM": LinearSVC(random_state=42, max_iter=2000)
    }
    
    for model_name, clf in models.items():
        clf.fit(X_train_vec, y_train)
        preds = clf.predict(X_test_vec)
        print(f"\\n--- Model: {model_name} ---")
        print(classification_report(y_test, preds))
        print("Confusion Matrix:")
        print(confusion_matrix(y_test, preds))

    # Pickle best model (e.g. Linear SVM or LR) and vectorizer
    os.makedirs('saved_models', exist_ok=True)
    with open('saved_models/model.pkl', 'wb') as f:
        pickle.dump(models["Linear SVM"], f)
    with open('saved_models/vectorizer.pkl', 'wb') as f:
        pickle.dump(vectorizer, f)
    print("\\n[✓] Optimal pipeline saved to 'saved_models/' directory.")

if __name__ == "__main__":
    train_and_evaluate()
`
    },
    {
      name: "app.py",
      path: "project/app.py",
      description: "FastAPI REST API deployment router featuring model endpoint predictive logic.",
      code: `# app.py
"""
Fake News Detection: FastAPI Production Deployment Server API
Author: ML Engineer
"""

import os
import pickle
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from preprocess import clean_text

class NewsItem(BaseModel):
    news: str

app = FastAPI(title="Fake News NLP Pipeline Vetting API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "saved_models/model.pkl"
VECTORIZER_PATH = "saved_models/vectorizer.pkl"

@app.post("/predict")
def predict_news(item: NewsItem):
    if not item.news or len(item.news.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text string is blank")
        
    try:
        # Load pickled binaries
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        with open(VECTORIZER_PATH, "rb") as f:
            vectorizer = pickle.load(f)
            
        # Prep & predict
        cleaned = clean_text(item.news)
        vec = vectorizer.transform([cleaned])
        
        pred_class = model.predict(vec)[0]
        prediction_label = "Real" if pred_class == 1 else "Fake"
        
        return {
            "prediction": prediction_label,
            "cleaned_query": cleaned,
            "method": type(model).__name__
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
`
    },
    {
      name: "requirements.txt",
      path: "project/requirements.txt",
      description: "Backend dependencies required for compilation and deployment on Heroku/Render.",
      code: `fastapi>=0.100.0
uvicorn>=0.22.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.2.0
nltk>=3.8.0
pydantic>=2.0.0
gunicorn>=20.1.0
matplotlib>=3.7.0
seaborn>=0.12.0
`
    },
    {
      name: "Procfile",
      path: "project/Procfile",
      description: "Deployment process scheduler file mapping uvicorn servers to dynamic ports.",
      code: `web: uvicorn app:app --host 0.0.0.0 --port $PORT`
    }
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(FILE_ENTRIES[selectedFileIdx].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFileLocally = () => {
    const file = FILE_ENTRIES[selectedFileIdx];
    const blob = new Blob([file.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="codebase-tab-root" className="space-y-8">
      {/* Visual top */}
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
          <Terminal size={22} className="text-blue-500" /> Exportable Python Project Workspace
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Explore and inspect commented source directories matching the required full-stack Python dataset distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Project directory tree controller (Left/Top) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
              <FolderOpen size={16} /> Fake-News-Detector/
            </h3>

            {/* Tree listing */}
            <div className="space-y-1.5 font-mono text-xs text-slate-700">
              
              {/* dataset/ directory */}
              <div className="space-y-1 pl-1">
                <span className="flex items-center gap-1.5 text-slate-500 py-0.5">
                  <Folder size={14} className="text-blue-500" /> dataset/
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 pl-4 py-0.5 italic">
                  <FileText size={12} /> True.csv <span className="text-[10px] text-slate-300">(Kaggle Source)</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 pl-4 py-0.5 italic">
                  <FileText size={12} /> Fake.csv <span className="text-[10px] text-slate-300">(Kaggle Source)</span>
                </span>
              </div>

              {/* notebooks/ directory */}
              <div className="space-y-1 pl-1">
                <span className="flex items-center gap-1.5 text-slate-500 py-0.5">
                  <Folder size={14} className="text-purple-500" /> notebooks/
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 pl-4 py-0.5 italic">
                  <FileText size={12} /> fake_news_detection.ipynb
                </span>
              </div>

              {/* saved_models/ directory */}
              <div className="space-y-1 pl-1">
                <span className="flex items-center gap-1.5 text-slate-500 py-0.5">
                  <Folder size={14} className="text-amber-500" /> saved_models/
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 pl-4 py-0.5 italic">
                  <FileText size={12} /> model.pkl
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 pl-4 py-0.5 italic">
                  <FileText size={12} /> vectorizer.pkl
                </span>
              </div>

              {/* Editable Root files */}
              <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
                {FILE_ENTRIES.map((f, idx) => (
                  <button
                    id={`explorer-f-${idx}`}
                    key={idx}
                    onClick={() => setSelectedFileIdx(idx)}
                    className={`w-full text-left py-1 text-xs font-mono rounded flex items-center gap-2 px-2 hover:bg-slate-50 cursor-pointer ${
                      selectedFileIdx === idx
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    <FileText size={14} className={selectedFileIdx === idx ? "text-blue-500" : "text-slate-400"} />
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Code Reader (Right/Bottom) */}
        <div className="lg:col-span-8 flex flex-col h-[520px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg select-text dark-scrollbar">
          
          {/* Header */}
          <div className="bg-slate-950 px-5 py-3 flex items-center justify-between border-b border-slate-850">
            <div>
              <span className="text-[10px] uppercase text-blue-400 font-bold font-mono tracking-wider">
                {FILE_ENTRIES[selectedFileIdx].path}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-normal">
                {FILE_ENTRIES[selectedFileIdx].description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Copy btn */}
              <button
                id="copy-code-btn"
                onClick={handleCopyCode}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Copy code block to clipboard"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
              {/* Download btn */}
              <button
                id="download-code-btn"
                onClick={downloadFileLocally}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Download file natively"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* Reading Console */}
          <pre className="p-5 flex-1 overflow-auto font-mono text-[11px] text-slate-300 leading-relaxed bg-slate-900 custom-scrollbar select-text">
            <code>{FILE_ENTRIES[selectedFileIdx].code}</code>
          </pre>
        </div>
      </div>

      {/* Deploying Guides & Quickstarts links */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
          <Play size={16} className="text-blue-500 animate-pulse" /> Google Colab & Production Deployments Quickstart
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="space-y-2 bg-white rounded-lg p-4 border border-slate-150">
            <span className="font-bold flex items-center gap-1 text-slate-800 font-sans">
              <Server size={14} className="text-purple-500" /> 1. Google Colab Run
            </span>
            <p className="leading-relaxed">
              Open Google Colab, import the <strong>fake_news_detection.ipynb</strong> file from notebooks, drag-and-drop True.csv and Fake.csv, and click Run All. Pickled metrics output automatically.
            </p>
          </div>

          <div className="space-y-2 bg-white rounded-lg p-4 border border-slate-150">
            <span className="font-bold flex items-center gap-1 text-slate-800 font-sans">
              <GitBranch size={14} className="text-blue-500" /> 2. Local Host Run
            </span>
            <p className="leading-relaxed">
              Clone this subdirectory and execute <code>pip install -r requirements.txt</code>. Train inputs with <code>python train.py</code>, then launch FastAPI with <code>uvicorn app:app --reload</code>.
            </p>
          </div>

          <div className="space-y-2 bg-white rounded-lg p-4 border border-slate-150">
            <span className="font-bold flex items-center gap-1 text-slate-800 font-sans">
              <Check size={14} className="text-emerald-500 font-bold" /> 3. Render cloud deploy
            </span>
            <p className="leading-relaxed">
              Import project repositories to Render under Python web services. Direct build steps to <code>pip install -r requirements.txt && python train.py</code>, and launch with <code>uvicorn app:app --host 0.0.0.0 --port $PORT</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
