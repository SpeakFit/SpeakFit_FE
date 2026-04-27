import micIcon from "../../../assets/mic-icon.png";

type RecordButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export default function RecordButton({
  onClick,
  disabled = false,
}: RecordButtonProps) {
  return (
    <div className="record-button-wrap">
      <button
        className="record-button"
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        <img src={micIcon} alt="record" className="record-button__icon" />
      </button>
    </div>
  );
}
