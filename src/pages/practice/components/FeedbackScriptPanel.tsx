import { useState } from "react";
import type { FeedbackIssue } from "../types";

type FeedbackScriptPanelProps = {
  title: string;
  script: string;
  issues: FeedbackIssue[];
};

type TooltipState = {
  issues: FeedbackIssue[];
  x: number;
  y: number;
};

function getLineIssues(line: string, issues: FeedbackIssue[]) {
  return issues.filter((item) => item.excerpt && line.includes(item.excerpt));
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
    setTooltip({
      issues: nextIssues,
      ...getTooltipPosition(event),
    });
  };

  return (
    <section className="feedback-script-panel">
      <div className="feedback-script-panel__header">
        <span>{title}</span>
        <span className="feedback-script-panel__hint">
          노란색 문장에 커서를 올려 상세 피드백을 확인하세요
        </span>
      </div>

      <div className="feedback-script-panel__body">
        {scriptLines.map((line, index) => {
          const lineIssues = getLineIssues(line, issues);

          return (
            <p key={`${line}-${index}`} className="feedback-script-panel__paragraph">
              {line && lineIssues.length > 0 ? (
                <span
                  className="feedback-script-panel__highlight-anchor"
                  onMouseEnter={(event) => showTooltip(event, lineIssues)}
                  onMouseMove={(event) => showTooltip(event, lineIssues)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <mark className="feedback-script-panel__highlight">{line}</mark>
                </span>
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
