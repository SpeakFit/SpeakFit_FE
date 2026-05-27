import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type { PptSlideResponse } from "../../../api/scripts";

type PresentationDeckPanelProps = {
  fileName: string | null;
  sourcePptUrl?: string;
  slides: PptSlideResponse[];
  currentPage: number;
  totalPages: number;
  isUploading: boolean;
  uploadMessage?: string | null;
  onFileChange: (file: File | null) => void;
  onCurrentPageChange: (page: number) => void;
};

const CONVERSION_STEPS = [
  "파일을 업로드하고 있습니다...",
  "슬라이드를 분석하고 있습니다...",
  "이미지로 변환하고 있습니다...",
  "슬라이드를 생성하고 있습니다...",
  "마무리하고 있습니다...",
];

export default function PresentationDeckPanel({
  fileName,
  sourcePptUrl,
  slides,
  currentPage,
  totalPages,
  isUploading,
  uploadMessage,
  onFileChange,
  onCurrentPageChange,
}: PresentationDeckPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const normalizedTotalPages = Math.max(1, totalPages);
  const canMovePrev = currentPage > 1;
  const canMoveNext = currentPage < normalizedTotalPages;

  const [conversionStep, setConversionStep] = useState(0);
  const [stepVisible, setStepVisible] = useState(true);

  const currentSlide = useMemo(() => {
    return (
      slides.find((slide) => slide.page === currentPage) ??
      slides[currentPage - 1] ??
      null
    );
  }, [currentPage, slides]);

  useEffect(() => {
    if (currentPage <= normalizedTotalPages) return;
    onCurrentPageChange(normalizedTotalPages);
  }, [currentPage, normalizedTotalPages, onCurrentPageChange]);

  // 변환 단계 메시지 순환 (2.8초마다 페이드 전환)
  useEffect(() => {
    if (!isUploading) {
      setConversionStep(0);
      setStepVisible(true);
      return;
    }

    const interval = setInterval(() => {
      // 페이드 아웃 후 텍스트 변경, 다시 페이드 인
      setStepVisible(false);
      setTimeout(() => {
        setConversionStep((prev) => (prev + 1) % CONVERSION_STEPS.length);
        setStepVisible(true);
      }, 300);
    }, 2800);

    return () => clearInterval(interval);
  }, [isUploading]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    onFileChange(nextFile);
    event.target.value = "";
  };

  return (
    <section className="presentation-deck">
      <div className="presentation-deck__header">
        <span className="presentation-deck__title">
          {fileName ?? "프레젠테이션 파일"}
        </span>
        <span className="presentation-deck__meta">
          {fileName ? `${normalizedTotalPages} 페이지` : "PPT, PPTX, PDF"}
        </span>
      </div>

      <div className="presentation-deck__body">
        {!fileName && (
          <div className="presentation-deck__empty">
            <button
              className="presentation-deck__upload"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              ppt 업로드하기
            </button>
            <p>PPT, PPTX, PDF 파일을 업로드할 수 있습니다.</p>
          </div>
        )}

        {fileName && isUploading && (
          <div className="presentation-deck__converting">
            {/* 슬라이드 아이콘 (펄스) */}
            <div className="presentation-deck__converting-icon" aria-hidden="true">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="56" height="56" rx="14" fill="#edfaf8"/>
                <rect x="12" y="14" width="32" height="28" rx="4" fill="#55c9b8" opacity="0.25"/>
                <rect x="12" y="14" width="32" height="28" rx="4" stroke="#33cbbd" strokeWidth="2"/>
                <rect x="18" y="20" width="20" height="2.5" rx="1.25" fill="#33cbbd"/>
                <rect x="18" y="25" width="14" height="2.5" rx="1.25" fill="#33cbbd" opacity="0.6"/>
                <rect x="18" y="30" width="17" height="2.5" rx="1.25" fill="#33cbbd" opacity="0.4"/>
                <circle cx="44" cy="42" r="8" fill="#33cbbd"/>
                <path d="M41 42l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="presentation-deck__converting-check"/>
              </svg>
            </div>

            {/* 파일명 */}
            <strong className="presentation-deck__converting-filename">{fileName}</strong>

            {/* Indeterminate 프로그레스 바 */}
            <div className="presentation-deck__converting-bar" role="progressbar" aria-label="변환 중">
              <div className="presentation-deck__converting-bar-fill" />
            </div>

            {/* 순환 상태 메시지 */}
            <span
              className="presentation-deck__converting-step"
              style={{ opacity: stepVisible ? 1 : 0 }}
            >
              {uploadMessage ?? CONVERSION_STEPS[conversionStep]}
            </span>

            {/* 점 세 개 로딩 */}
            <div className="presentation-deck__converting-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {fileName && !isUploading && currentSlide && (
          <img
            className="presentation-deck__slide-image"
            src={currentSlide.imageUrl}
            alt={`슬라이드 ${currentSlide.page}`}
          />
        )}

        {fileName && !isUploading && !currentSlide && (
          <div className="presentation-deck__ppt-preview">
            <strong>{fileName}</strong>
            <span>{uploadMessage ?? "변환된 슬라이드를 찾지 못했습니다."}</span>
            {sourcePptUrl && (
              <button
                className="presentation-deck__secondary"
                type="button"
                onClick={() => window.open(sourcePptUrl, "_blank")}
              >
                원본 확인하기
              </button>
            )}
          </div>
        )}
      </div>

      {sourcePptUrl && !isUploading && (
        <div className="presentation-deck__source">
          <span>S3 저장소</span>
          <a href={sourcePptUrl} target="_blank" rel="noreferrer">
            {sourcePptUrl}
          </a>
        </div>
      )}

      <div className="presentation-deck__footer">
        <button
          className="presentation-deck__nav"
          type="button"
          disabled={!canMovePrev || isUploading}
          onClick={() => onCurrentPageChange(currentPage - 1)}
          aria-label="이전 슬라이드"
        >
          ‹
        </button>
        <span>슬라이드 {currentPage} / {normalizedTotalPages}</span>
        <button
          className="presentation-deck__nav"
          type="button"
          disabled={!canMoveNext || isUploading}
          onClick={() => onCurrentPageChange(currentPage + 1)}
          aria-label="다음 슬라이드"
        >
          ›
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".ppt,.pptx,.pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
        hidden
        onChange={handleFileChange}
      />
    </section>
  );
}
