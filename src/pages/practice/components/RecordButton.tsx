type RecordButtonProps = {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
};

export default function RecordButton({
  isRecording,
  onStart,
  onStop,
  disabled = false,
}: RecordButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    if (isRecording) {
      onStop();
      return;
    }
    onStart();
  };

  return (
    <div className="record-button-wrap">
      <button
        className={`record-button ${isRecording ? "is-recording" : ""}`}
        type="button"
        onClick={handleClick}
        disabled={disabled}
      >
        🎤
      </button>
      <span className="record-button__label">
        {isRecording ? "녹음 종료" : "녹음 시작"}
      </span>
    </div>
  );
}