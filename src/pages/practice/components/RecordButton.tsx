import micIcon from "../../../assets/mic-icon.png"
import recordingIcon from "../../../assets/recording-icon.png"

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
        <img
          src={isRecording ? recordingIcon : micIcon}
          alt="record"
          className="record-button__icon"
        />
      </button>
    </div>
  );
}