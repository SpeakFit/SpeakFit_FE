import { useMemo, type ReactNode } from "react";
import type { PracticeContentItem, StartPracticeSentence, StartPracticeWord } from "../../../api/practice";
import type { RealtimeHighlight, WordRealtimeFeedback } from "../types";

type ScriptPanelProps = {
  title: string;
  script: string;
  markedScript: string;
  sentences: StartPracticeSentence[];
  contentList: PracticeContentItem[];
  lastReadIndex: number;
  wordFeedbackByIndex: Record<number, WordRealtimeFeedback>;
  isRecording: boolean;
  statusText: string;
  time: string;
  isReadingMarksEnabled: boolean;
  realtimeHighlight?: RealtimeHighlight | null;
  realtimeTranscript?: string;
  onToggleReadingMarks: (enabled: boolean) => void;
};


type WordToken = {
  type: "word";
  text: string;
  index: number;
  isEmphasis: boolean;
  hasBreak: boolean;
};

type SpaceToken = {
  type: "space";
  text: string;
};

type ScriptToken = WordToken | SpaceToken;

type ParagraphItem = {
  type: "paragraph";
  tokens: ScriptToken[];
};

type LineItem = {
  type: "line";
  content: string;
  key: string;
};

type ContentItem = ParagraphItem | LineItem;

function renderMarkedLine(line: string) {
  const parts: ReactNode[] = [];
  const markPattern = /(\*\[[^\]]+\]\*|\*[^*\s][^*]*\*|\/\/|\/)/g;
  let lastIndex = 0;
  let matchIndex = 0;

  for (const match of line.matchAll(markPattern)) {
    const matchedText = match[0];
    const startIndex = match.index ?? 0;

    if (startIndex > lastIndex) {
      parts.push(line.slice(lastIndex, startIndex));
    }

    if (matchedText === "/" || matchedText === "//") {
      parts.push(
        <span
          key={`pause-${matchIndex}`}
          className="script-panel__reading-pause"
        >
          {matchedText}
        </span>,
      );
    } else {
      const emphasisText = matchedText.startsWith("*[")
        ? matchedText.slice(2, -2)
        : matchedText.slice(1, -1);

      parts.push(
        <span
          key={`emphasis-${matchIndex}`}
          className="script-panel__reading-emphasis"
        >
          {emphasisText}
        </span>,
      );
    }

    lastIndex = startIndex + matchedText.length;
    matchIndex += 1;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : line;
}

export default function ScriptPanel({
  title,
  script,
  markedScript,
  sentences,
  contentList,
  lastReadIndex,
  wordFeedbackByIndex,
  isRecording,
  statusText,
  time,
  isReadingMarksEnabled,
  realtimeHighlight,
  realtimeTranscript,
  onToggleReadingMarks,
}: ScriptPanelProps) {
  const content = useMemo<ContentItem[]>(() => {
    if (sentences.length === 0) {
      const displayScript = isReadingMarksEnabled ? markedScript : script;

      return displayScript.split("\n").map((line, i) => ({
        type: "line",
        content: line,
        key: `line-${i}`,
      }));
    }

    const result: ContentItem[] = [];
    let currentParagraphTokens: ScriptToken[] = [];
    let lastProcessedCharIdx = 0;

    const contentMap = new Map<number, PracticeContentItem>();
    contentList.forEach((item) => contentMap.set(item.index, item));

    sentences.forEach((sentence) => {
      const gap = script.slice(lastProcessedCharIdx, sentence.startCharIndex);
      if (gap.includes("\n")) {
        if (currentParagraphTokens.length > 0) {
          result.push({ type: "paragraph", tokens: currentParagraphTokens });
          currentParagraphTokens = [];
        }
      } else if (gap) {
        currentParagraphTokens.push({ type: "space", text: gap });
      }

      sentence.words.forEach((word: StartPracticeWord, wIdx: number) => {
        const prevEnd = wIdx === 0 ? sentence.startCharIndex : sentence.words[wIdx - 1].endCharIndex;
        const wordGap = script.slice(prevEnd, word.startCharIndex);
        if (wordGap) {
          currentParagraphTokens.push({ type: "space", text: wordGap });
        }

        const meta = contentMap.get(word.globalWordIndex);
        currentParagraphTokens.push({
          type: "word",
          text: word.text,
          index: word.globalWordIndex,
          isEmphasis: meta?.isEmphasis || false,
          hasBreak: meta?.hasBreak ?? false,
        });
      });

      lastProcessedCharIdx = sentence.endCharIndex;
    });

    if (currentParagraphTokens.length > 0) {
      result.push({ type: "paragraph", tokens: currentParagraphTokens });
    }

    return result;
  }, [sentences, script, markedScript, contentList, isReadingMarksEnabled]);

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
        {content.map((item, idx) => {
          if (item.type === "line") {
            return (
              <p key={item.key} className="script-panel__paragraph">
                {isReadingMarksEnabled ? renderMarkedLine(item.content) : item.content}
              </p>
            );
          }

          return (
            <p key={`p-${idx}`} className="script-panel__paragraph">
              {item.tokens.map((token, tIdx) => {
                if (token.type === "space") return token.text;
                
                const feedback = wordFeedbackByIndex[token.index];
                const isIncorrect = feedback?.isCorrect === false;
                const isRead = token.index <= lastReadIndex || feedback?.isCorrect === true;
                const isCurrent = realtimeHighlight?.wordIndex === token.index;
                
                const wordElement = (
                  <span
                    key={`w-${token.index}`}
                    className={`script-panel__word ${
                      isRead ? "script-panel__word--read" : ""
                    } ${isIncorrect ? "script-panel__word--incorrect" : ""} ${
                      isCurrent ? "script-panel__realtime-highlight" : ""
                    } ${
                      isCurrent && isIncorrect ? "script-panel__realtime-highlight--incorrect" : ""
                    } ${
                      isReadingMarksEnabled && token.isEmphasis ? "script-panel__reading-emphasis" : ""
                    }`}
                    title={
                      feedback
                        ? `인식: ${feedback.spokenWord || "-"} / 점수: ${Math.round(feedback.matchScore * 100)}%`
                        : undefined
                    }
                  >
                    {token.text}
                  </span>
                );

                return (
                  <span key={`group-${tIdx}`} style={{ display: "inline" }}>
                    {wordElement}
                    {isReadingMarksEnabled && token.hasBreak && (
                      <span className="script-panel__reading-pause"> /</span>
                    )}
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>

      <div className="script-panel__footer">
        <div className="script-panel__legend">
          <span className="script-panel__legend-item">/ 짧은 멈춤</span>
          <span className="script-panel__legend-item">// 긴 멈춤</span>
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
            aria-label="낭독기호 표시 전환"
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

