import { useMemo, useState } from "react";
import type { SpeechStyleId } from "../types";
import type { SpeechStyle } from "../../../api/practice";

type SpeechStyleOption = {
  id: SpeechStyleId;
  title: string;
  description: string;
  sampleAudioUrl?: string;
};

type PracticeStyleModalProps = {
  styles: SpeechStyle[];
  isLoading: boolean;
  errorMessage: string | null;
  onPreviewTts?: (styleId: SpeechStyleId) => void;
  onConfirm: (styleId: SpeechStyleId) => void;
};

export default function PracticeStyleModal({
  styles,
  isLoading,
  errorMessage,
  onPreviewTts,
  onConfirm,
}: PracticeStyleModalProps) {
  const speechStyleOptions: SpeechStyleOption[] = useMemo(
    () =>
      styles.map((style, index) => ({
        id: style.styleId,
        title: index === 0 ? "추천 스타일" : `스타일 ${index + 1}`,
        description: style.description,
        sampleAudioUrl: style.sampleAudioUrl,
      })),
    [styles],
  );
  const [selectedStyle, setSelectedStyle] = useState<SpeechStyleId | null>(
    null,
  );
  const recommendedOption = speechStyleOptions[0];
  const selectedStyleId =
    selectedStyle !== null &&
    speechStyleOptions.some((option) => option.id === selectedStyle)
      ? selectedStyle
      : null;

  const handlePreviewTts = (styleId: SpeechStyleId) => {
    onPreviewTts?.(styleId);
  };

  return (
    <div className="practice-modal-overlay">
      <div
        className="practice-modal practice-modal--style"
        role="dialog"
        aria-modal="true"
        aria-labelledby="practice-style-title"
      >
        <div className="practice-modal__header practice-modal__header--style">
          <p>입력하신 스피치 데이터를 바탕으로 추천하는 스타일이에요.</p>
          <h2 id="practice-style-title">
            {recommendedOption?.title ?? "스타일을 불러오는 중"}
          </h2>
        </div>

        <div className="practice-style-modal__body">
          <div className="practice-style-modal__intro">
            <h3>어떤 스타일로 연습하시겠어요?</h3>
            <p>스피커 아이콘을 누르면 가이드 TTS를 먼저 들어볼 수 있어요.</p>
          </div>

          {isLoading && (
            <p className="practice-style-modal__message">
              스타일을 불러오고 있습니다.
            </p>
          )}

          {errorMessage && (
            <p className="practice-style-modal__message is-error">
              {errorMessage}
            </p>
          )}

          {!isLoading && !errorMessage && (
            <div className="practice-style-grid">
              {speechStyleOptions.map((option, index) => {
                const isSelected = selectedStyleId === option.id;

                return (
                  <div
                    key={option.id}
                    className={`practice-style-card ${
                      isSelected ? "is-selected" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="practice-style-card__speaker"
                      aria-label={`${option.title} TTS 듣기`}
                      onClick={() => handlePreviewTts(option.id)}
                      disabled={!option.sampleAudioUrl}
                    >
                      <svg
                        viewBox="0 0 32 32"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M5 12.5h5l7-6v19l-7-6H5z" />
                        <path d="M21 11.5c2 2.4 2 6.6 0 9" />
                        <path d="M25 8c3.8 4.4 3.8 11.6 0 16" />
                      </svg>
                    </button>

                    {index === 0 && (
                      <span className="practice-style-card__badge">추천</span>
                    )}

                    <button
                      type="button"
                      className="practice-style-card__select"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedStyle(option.id)}
                    >
                      <strong>{option.title}</strong>
                      <span>{option.description}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="practice-style-modal__footer">
          <button
            type="button"
            className={`practice-modal__confirm ${
              selectedStyleId ? "is-enabled" : ""
            }`}
            onClick={() => selectedStyleId && onConfirm(selectedStyleId)}
            disabled={!selectedStyleId}
          >
            연습하러 가기
          </button>
        </div>
      </div>
    </div>
  );
}
