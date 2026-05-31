import { useEffect, useState } from "react";
import type { FeedbackIssue } from "../types";

type FeedbackScriptPanelProps = {
  title: string;
  script: string;
  issues: FeedbackIssue[];
  /** 분석 결과 대기 중 표시할 안내 문구로 교체할지 여부 */
  isAwaitingAnalysis?: boolean;
};

type TooltipState = {
  issues: FeedbackIssue[];
  x: number;
  y: number;
};

function normalizeFeedbackText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getLineIssues(line: string, issues: FeedbackIssue[]) {
  const normalizedLine = normalizeFeedbackText(line);

  return issues.filter((item) => {
    if (!item.excerpt) return false;

    const normalizedExcerpt = normalizeFeedbackText(item.excerpt);

    return (
      normalizedLine.includes(normalizedExcerpt) ||
      normalizedExcerpt.includes(normalizedLine)
    );
  });
}

function getTooltipPosition(event: React.MouseEvent<HTMLElement>) {
  return {
    x: Math.min(event.clientX + 18, window.innerWidth - 440),
    y: Math.min(event.clientY + 18, window.innerHeight - 220),
  };
}

export default function FeedbackScriptPanel({
  title,
  script,
  issues,
  isAwaitingAnalysis = false,
}: FeedbackScriptPanelProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const scriptLines = script
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const showTooltip = (
    event: React.MouseEvent<HTMLElement>,
    nextIssues: FeedbackIssue[],
  ) => {
    event.stopPropagation();
    setTooltip({
      issues: nextIssues,
      ...getTooltipPosition(event),
    });
  };

  useEffect(() => {
    if (!tooltip) return;

    const hideTooltip = () => setTooltip(null);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hideTooltip();
    };

    window.addEventListener("pointerdown", hideTooltip);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", hideTooltip);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [tooltip]);

  return (
    <section className="feedback-script-panel">
      <div className="feedback-script-panel__header">
        <span>{title}</span>
        <span className="feedback-script-panel__hint">
          {isAwaitingAnalysis
            ? "분석이 끝나면 우측에 결과가 표시돼요"
            : "노란색 문장을 클릭해 상세 피드백을 확인하세요"}

        </span>
      </div>

      <div className="feedback-script-panel__body">
        {scriptLines.map((line, index) => {
          const lineIssues = getLineIssues(line, issues);

          return (
            <p key={`${line}-${index}`} className="feedback-script-panel__paragraph">
              {line && lineIssues.length > 0 ? (
                <button
                  type="button"
                  className="feedback-script-panel__highlight-anchor"
                  onClick={(event) => showTooltip(event, lineIssues)}
                  aria-label="상세 피드백 보기"
                >
                  <mark className="feedback-script-panel__highlight">{line}</mark>
                </button>
              ) : (
                line
              )}
            </p>
          );
        })}
      </div>

      {tooltip && (
        <div
          className="feedback-script-popover is-visible"
          role="status"
          style={{ left: tooltip.x, top: tooltip.y }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {tooltip.issues.map((issue, issueIndex) => (
            <span
              key={`${issue.metricId}-${issue.title}-${issueIndex}`}
              className="feedback-script-popover__item"
            >
              <strong>{issue.title}</strong>
              <span>{issue.description}</span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}