import { useEffect, useMemo, useRef, type ChangeEvent } from "react";

type PresentationDeckPanelProps = {
  file: File | null;
  objectUrl: string | null;
  s3Url: string;
  currentPage: number;
  totalPages: number;
  onFileChange: (file: File | null) => void;
  onS3UrlChange: (value: string) => void;
  onCurrentPageChange: (page: number) => void;
  onTotalPagesChange: (pages: number) => void;
};

function getDeckType(file: File | null) {
  if (!file) return null;

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (extension === "ppt" || extension === "pptx") return "ppt";

  return null;
}

export default function PresentationDeckPanel({
  file,
  objectUrl,
  s3Url,
  currentPage,
  totalPages,
  onFileChange,
  onS3UrlChange,
  onCurrentPageChange,
  onTotalPagesChange,
}: PresentationDeckPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const deckType = getDeckType(file);
  const canMovePrev = currentPage > 1;
  const canMoveNext = currentPage < totalPages;
  const previewUrl = useMemo(() => {
    if (!objectUrl || deckType !== "pdf") return null;

    return `${objectUrl}#page=${currentPage}&toolbar=0&navpanes=0`;
  }, [currentPage, deckType, objectUrl]);

  useEffect(() => {
    if (currentPage <= totalPages) return;
    onCurrentPageChange(totalPages);
  }, [currentPage, onCurrentPageChange, totalPages]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    onFileChange(nextFile);
    onCurrentPageChange(1);
    onTotalPagesChange(1);
  };

  return (
    <section className="presentation-deck">
      <div className="presentation-deck__header">
        <span className="presentation-deck__title">
          {file?.name ?? "프레젠테이션 파일"}
        </span>
        <span className="presentation-deck__meta">
          {file ? `${Math.max(1, totalPages)} 페이지` : "PDF, PPT, PPTX"}
        </span>
      </div>

      <div className="presentation-deck__body">
        {!file && (
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

        {file && deckType === "pdf" && previewUrl && (
          <iframe
            key={previewUrl}
            className="presentation-deck__preview"
            src={previewUrl}
            title={file.name}
          />
        )}

        {file && deckType === "ppt" && (
          <div className="presentation-deck__ppt-preview">
            <strong>{file.name}</strong>
            <span>PPT 파일이 업로드되었습니다.</span>
            <button
              className="presentation-deck__secondary"
              type="button"
              onClick={() => window.open(objectUrl ?? undefined, "_blank")}
            >
              파일 확인하기
            </button>
          </div>
        )}
      </div>

      <div className="presentation-deck__config">
        <label className="presentation-deck__field">
          <span>S3 저장소 URL</span>
          <input
            type="url"
            placeholder="https://..."
            value={s3Url}
            onChange={(event) => onS3UrlChange(event.target.value)}
          />
        </label>

        <label className="presentation-deck__field presentation-deck__field--pages">
          <span>전체 페이지</span>
          <input
            type="number"
            min={1}
            value={totalPages}
            onChange={(event) => {
              const pages = Math.max(1, Number(event.target.value) || 1);
              onTotalPagesChange(pages);
            }}
          />
        </label>
      </div>

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
        <span>슬라이드 {currentPage} / {Math.max(1, totalPages)}</span>
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
