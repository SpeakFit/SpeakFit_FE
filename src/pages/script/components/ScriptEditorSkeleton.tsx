import "../styles/script.css";

const ScriptEditorSkeleton = () => {
  return (
    <div
      className="script-editor-skeleton"
      role="status"
      aria-live="polite"
      aria-label="AI가 스크립트를 작성하고 있어요"
    >
      <div className="script-editor-skeleton__lines">
        <span className="script-editor-skeleton__bar" style={{ width: "38%" }} />
        <span className="script-editor-skeleton__bar" style={{ width: "92%" }} />
        <span className="script-editor-skeleton__bar" style={{ width: "78%" }} />
        <span className="script-editor-skeleton__bar" style={{ width: "85%" }} />
        <span className="script-editor-skeleton__bar" style={{ width: "60%" }} />

        <span
          className="script-editor-skeleton__bar"
          style={{ width: "30%", marginTop: 14 }}
        />
        <span className="script-editor-skeleton__bar" style={{ width: "88%" }} />
        <span className="script-editor-skeleton__bar" style={{ width: "94%" }} />
        <span className="script-editor-skeleton__bar" style={{ width: "70%" }} />
      </div>

      <div className="script-editor-skeleton__status">
        <span className="script-editor-skeleton__dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
        AI가 스크립트를 작성하고 있어요
      </div>
    </div>
  );
};

export default ScriptEditorSkeleton;