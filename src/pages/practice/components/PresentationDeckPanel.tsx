import { useEffect, useMemo, useRef, type ChangeEvent } from "react";
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
          {fileName ? `${normalizedTotalPages} 페이지` : "PDF, PPT, PPTX"}
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
            <p>PDF, PPT, PPTX 파일을 업로드할 수 있습니다.</p>
          </div>
        )}

        {fileName && isUploading && (
          <div className="presentation-deck__ppt-preview">
            <strong>{fileName}</strong>
            <span>{uploadMessage ?? "프레젠테이션 파일을 변환하고 있습니다."}</span>
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

      {sourcePptUrl && (
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
          disabled={!canMovePrev}
          onClick={() => onCurrentPageChange(currentPage - 1)}
          aria-label="이전 슬라이드"
        >
          ‹
        </button>
        <span>슬라이드 {currentPage} / {normalizedTotalPages}</span>
        <button
          className="presentation-deck__nav"
          type="button"
          disabled={!canMoveNext}
          onClick={() => onCurrentPageChange(currentPage + 1)}
          aria-label="다음 슬라이드"
        >
          ›
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        hidden
        onChange={handleFileChange}
      />
    </section>
  );
}
