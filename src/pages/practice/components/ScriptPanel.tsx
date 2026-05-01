import { useMemo } from "react";
import type { RealtimeHighlight } from "../types";

type ScriptPanelProps = {
  title: string;
  script: string;
  isRecording: boolean;
  statusText: string;
  time: string;
  isReadingMarksEnabled: boolean;
  realtimeHighlight?: RealtimeHighlight | null;
  realtimeTranscript?: string;
  onToggleReadingMarks: (enabled: boolean) => void;
};

type HighlightRange = {
  lineIndex: number;
  startOffset: number;
  endOffset: number;
};

function getHighlightRanges(script: string, highlight?: RealtimeHighlight | null) {
  if (!highlight) return [];

  const lines = script.split("\n");

  if (
    highlight.lineIndex !== undefined &&
    highlight.startOffset !== undefined &&
    highlight.endOffset !== undefined
  ) {
    const line = lines[highlight.lineIndex];

    if (line !== undefined) {
      return [
        {
          lineIndex: highlight.lineIndex,
          startOffset: Math.max(0, highlight.startOffset),
          endOffset: Math.min(line.length, highlight.endOffset),
        },
      ].filter((range) => range.endOffset > range.startOffset);
    }
  }

  if (highlight.wordIndex !== undefined) {
    let currentWordIndex = 0;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      const words = line.matchAll(/\S+/g);

      for (const word of words) {
        const startOffset = word.index ?? 0;
        const endOffset = startOffset + word[0].length;

        if (currentWordIndex === highlight.wordIndex) {
          return [{ lineIndex, startOffset, endOffset }];
        }

        currentWordIndex += 1;
      }
    }
  }

  if (highlight.text) {
    const target = highlight.text.trim();
    if (!target) return [];

    const matchedRanges: HighlightRange[] = [];
    lines.forEach((line, lineIndex) => {
      const startOffset = line.indexOf(target);

      if (startOffset >= 0) {
        matchedRanges.push({
          lineIndex,
          startOffset,
          endOffset: startOffset + target.length,
        });
      }
    });

    return matchedRanges.slice(0, 1);
  }

  return [];
}

function renderLineWithHighlight(line: string, range?: HighlightRange) {
  if (!range) return line || "\u00A0";

  return (
    <>
      {line.slice(0, range.startOffset)}
      <mark className="script-panel__realtime-highlight">
        {line.slice(range.startOffset, range.endOffset)}
      </mark>
      {line.slice(range.endOffset) || ""}
    </>
  );
}

export default function ScriptPanel({
  title,
  script,
  isRecording,
  statusText,
  time,
  isReadingMarksEnabled,
  realtimeHighlight,
  realtimeTranscript,
  onToggleReadingMarks,
}: ScriptPanelProps) {
  const highlightRanges = useMemo(
    () => getHighlightRanges(script, realtimeHighlight),
    [script, realtimeHighlight],
  );

  return (
    <section className="script-panel">
      <div className="script-panel__header">
        <span className="script-panel__title">{title}</span>

        <div className="script-panel__status">
          <span className={`script-panel__rec-dot ${isRecording ? "is-on" : ""}`} />
          <span className="script-panel__status-text">{statusText}</span>
          <span className="script-panel__time">{time}</span>
        </div>
      </div>

      <div className="script-panel__body">
        {script.split("\n").map((line, index) => (
          <p key={`${line}-${index}`} className="script-panel__paragraph">
            {renderLineWithHighlight(
              line,
              highlightRanges.find((range) => range.lineIndex === index),
            )}
          </p>
        ))}
      </div>

      <div className="script-panel__footer">
        <div className="script-panel__legend">
          <span className="script-panel__legend-item">/ 짧은 멈춤(0.3~0.5초)</span>
          <span className="script-panel__legend-item">// 긴 멈춤(1초 이상)</span>
          <span className="script-panel__legend-item is-accent">강조</span>
          {realtimeTranscript && (
            <span className="script-panel__legend-item is-live">
              {realtimeTranscript}
            </span>
          )}
        </div>

        <div className="script-panel__toggle">
          <span className="script-panel__toggle-label">낭독기호</span>
          <div
            className="script-panel__toggle-pill"
            role="group"
            aria-label="낭독기호 표시 토글"
          >
            <button
              type="button"
              className={`script-panel__toggle-option ${
                isReadingMarksEnabled ? "is-on" : ""
              }`}
              onClick={() => onToggleReadingMarks(true)}
              aria-pressed={isReadingMarksEnabled}
            >
              ON
            </button>
            <button
              type="button"
              className={`script-panel__toggle-option ${
                !isReadingMarksEnabled ? "is-on" : ""
              }`}
              onClick={() => onToggleReadingMarks(false)}
              aria-pressed={!isReadingMarksEnabled}
            >
              OFF
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
