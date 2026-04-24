type ScriptPanelProps = {
  title: string;
  script: string;
  isRecording: boolean;
  statusText: string;
  time: string;
};

export default function ScriptPanel({
  title,
  script,
  isRecording,
  statusText,
  time,
}: ScriptPanelProps) {
  return (
    <section className="script-panel">
      <div className="script-panel__header">
        <span>{title}</span>

        <div className="script-panel__status">
          <span className="script-panel__time">{time}</span>
          <span className={`script-panel__rec-dot ${isRecording ? "is-on" : ""}`} />
          <span className="script-panel__status-text">{statusText}</span>
        </div>
      </div>

      <div className="script-panel__body">
        {script.split("\n").map((line, index) => (
          <p key={`${line}-${index}`} className="script-panel__paragraph">
            {line || "\u00A0"}
          </p>
        ))}
      </div>
    </section>
  );
}
