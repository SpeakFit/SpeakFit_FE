type ScriptPanelProps = {
  title: string;
  script: string;
  isRecording: boolean;
  statusText: string;
  time: string;
  isReadingMarksEnabled: boolean;
  onToggleReadingMarks: (enabled: boolean) => void;
};

export default function ScriptPanel({
  title,
  script,
  isRecording,
  statusText,
  time,
  isReadingMarksEnabled,
  onToggleReadingMarks,
}: ScriptPanelProps) {
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
            {line || "\u00A0"}
          </p>
        ))}
      </div>

      <div className="script-panel__footer">
        <div className="script-panel__legend">
          <span className="script-panel__legend-item">/ 짧은 멈춤(0.3~0.5초)</span>
          <span className="script-panel__legend-item">// 긴 멈춤(1초 이상)</span>
          <span className="script-panel__legend-item is-accent">강조</span>
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
