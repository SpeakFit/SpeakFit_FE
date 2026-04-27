import { useState } from "react";
import type { SpeechStyleId } from "../types";

type SpeechStyleOption = {
  id: SpeechStyleId;
  title: string;
  description: string;
  badge?: string;
};

type PracticeStyleModalProps = {
  recommendedStyle?: SpeechStyleId;
  onPreviewTts?: (styleId: SpeechStyleId) => void;
  onConfirm: (styleId: SpeechStyleId) => void;
};

const speechStyleOptions: SpeechStyleOption[] = [
  {
    id: "passionate",
    title: "열정적인 스타일",
    description: "에너지가 느껴지는 전달",
    badge: "추천",
  },
  {
    id: "intellectual",
    title: "지적인 스타일",
    description: "효율적이고 전문적인 전달",
  },
  {
    id: "calm",
    title: "차분한 스타일",
    description: "안정적이고 신뢰감이 느껴지는 전달",
  },
  {
    id: "dynamic",
    title: "전달력 있는 스타일",
    description: "높낮이 변화와 강조",
  },
];

export default function PracticeStyleModal({
  recommendedStyle = "passionate",
  onPreviewTts,
  onConfirm,
}: PracticeStyleModalProps) {
  const [selectedStyle, setSelectedStyle] =
    useState<SpeechStyleId>(recommendedStyle);

  const handlePreviewTts = (styleId: SpeechStyleId) => {
    // TODO: 백엔드 TTS 연동 시 styleId를 기준으로 가이드 음성을 재생
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
          <h2 id="practice-style-title">열정적인 스타일</h2>
        </div>

        <div className="practice-style-modal__body">
          <div className="practice-style-modal__intro">
            <h3>어떤 스타일로 연습하시겠어요?</h3>
            <p>스피커 아이콘을 누르면 가이드 TTS를 먼저 들어볼 수 있어요.</p>
          </div>

          <div className="practice-style-grid">
            {speechStyleOptions.map((option) => {
              const isSelected = selectedStyle === option.id;

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

                  {option.badge && (
                    <span className="practice-style-card__badge">
                      {option.badge}
                    </span>
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
        </div>

        <div className="practice-style-modal__footer">
          <button
            type="button"
            className="practice-modal__confirm is-enabled"
            onClick={() => onConfirm(selectedStyle)}
          >
            연습하러 가기
          </button>
        </div>
      </div>
    </div>
  );
}
