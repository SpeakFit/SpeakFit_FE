type ScriptPanelProps = {
  title: string;
  script: string;
  isRecording: boolean;
};

export default function ScriptPanel({
  title,
  script,
  isRecording,
}: ScriptPanelProps) {
  return (
    <section className="script-panel">
      <div className="script-panel__header">
        <span>{title}</span>

        <div className="script-panel__status">
          <span className={`script-panel__rec-dot ${isRecording ? "is-on" : ""}`} />
          <span>REC</span>
          
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