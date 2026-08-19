import React from 'react';
import BorderGlow from './BorderGlow';

const SUGGESTIONS = [
  "Search web for latest AI news",
  "Send an email to support@example.com",
  "Calculate 15% tip on $184.50",
  "Where is my order ORD123?"
];

const CHIP_GLOW_CONFIGS = [
  { glowColor: '210 90 60', colors: ['#38bdf8', '#3b82f6', '#10b981'] },
  { glowColor: '150 90 50', colors: ['#10b981', '#34d399', '#a855f7'] },
  { glowColor: '35 90 55', colors: ['#f59e0b', '#fb923c', '#ef4444'] },
  { glowColor: '280 80 60', colors: ['#a855f7', '#c084fc', '#38bdf8'] },
];

export default function EmptyState({ onSelectPrompt }) {
  return (
    <div className="hero-landing">
      {/* Foreground Content */}
      <div className="hero-foreground">
        {/* Main Headline */}
        <div className="hero-headline-section">
          <h1 className="hero-main-title font-display">
            Resolve any query with AI.
          </h1>
          <p className="hero-subtitle">
            Autonomous customer support powered by RAG knowledge retrieval,
            multi-tool orchestration, and intelligent human escalation.
          </p>
        </div>

        {/* Suggestion Chips with BorderGlow */}
        <div className="hero-chips-grid">
          {SUGGESTIONS.map((prompt, idx) => (
            <BorderGlow
              key={idx}
              borderRadius={5}
              edgeSensitivity={30}
              glowRadius={24}
              glowIntensity={1.1}
              glowColor={CHIP_GLOW_CONFIGS[idx].glowColor}
              colors={CHIP_GLOW_CONFIGS[idx].colors}
              className="suggestion-chip-glow"
            >
              <button
                className="suggestion-chip-inner"
                onClick={() => onSelectPrompt(prompt)}
              >
                {prompt}
              </button>
            </BorderGlow>
          ))}
        </div>

      </div>
    </div>
  );
}
