type ScriptPanelProps = {
  title: string;
  script: string;
  isRecording: boolean;
  time: string;
};

export default function ScriptPanel({
  title,
  script,
  isRecording,
  time,
}: ScriptPanelProps) {
  return (
    <section className="script-panel">
      <div className="script-panel__header">
        <span>{title}</span>

        <div className="script-panel__status">
          <span className={`script-panel__rec-dot ${isRecording ? "is-on" : ""}`} />
          <span>REC {time}</span>
          
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