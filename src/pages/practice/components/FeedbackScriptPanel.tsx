import type { FeedbackIssue, FeedbackMetricId } from "../types";

type FeedbackScriptPanelProps = {
  title: string;
  script: string;
  activeMetricId: FeedbackMetricId | null;
  issues: FeedbackIssue[];
};

type RenderedLine = {
  before: string;
  highlight: string;
  after: string;
  issue: FeedbackIssue | null;
};

function getLineHighlight(
  line: string,
  activeMetricId: FeedbackMetricId | null,
  issues: FeedbackIssue[],
): RenderedLine {
  if (!activeMetricId) {
    return { before: line, highlight: "", after: "", issue: null };
  }

  const activeIssues = issues.filter((issue) => issue.metricId === activeMetricId);
  const issue = activeIssues.find((item) => line.includes(item.excerpt));

  if (!issue) {
    return { before: line, highlight: "", after: "", issue: null };
  }

  const startIndex = line.indexOf(issue.excerpt);

  return {
    before: line.slice(0, startIndex),
    highlight: issue.excerpt,
    after: line.slice(startIndex + issue.excerpt.length),
    issue,
  };
}

export default function FeedbackScriptPanel({
  title,
  script,
  activeMetricId,
  issues,
}: FeedbackScriptPanelProps) {
  return (
    <section className="feedback-script-panel">
      <div className="feedback-script-panel__header">
        <span>{title}</span>
        <span className="feedback-script-panel__hint">
          우측 카드를 클릭하여 상세 피드백을 확인하세요
        </span>
      </div>

      <div className="feedback-script-panel__body">
        {script.split("\n").map((line, index) => {
          const renderedLine = getLineHighlight(line, activeMetricId, issues);

          return (
            <p key={`${line}-${index}`} className="feedback-script-panel__paragraph">
              {line ? (
                <>
                  {renderedLine.before}
                  {renderedLine.highlight && renderedLine.issue && (
                    <span className="feedback-script-panel__highlight-anchor">
                      <mark className="feedback-script-panel__highlight">
                        {renderedLine.highlight}
                      </mark>
                      <span className="feedback-script-popover" role="status">
                        <strong>{renderedLine.issue.title}</strong>
                        <span>{renderedLine.issue.description}</span>
                      </span>
                    </span>
                  )}
                  {renderedLine.after}
                </>
              ) : (
                "\u00A0"
              )}
            </p>
          );
        })}
      </div>
    </section>
  );
}
