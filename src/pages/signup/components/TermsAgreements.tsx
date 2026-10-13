import { useState } from "react";
import { getTermDetail } from "../../../api/terms";
import TermModal from "./TermModal";

// 가입 요청(terms)과 동일하게 termId 1(서비스 이용약관), 2(개인정보 처리방침)를 사용한다.
const SERVICE_TERM_ID = 1;
const PRIVACY_TERM_ID = 2;

type TermsAgreementsProps = {
  serviceChecked: boolean;
  privacyChecked: boolean;
  onChangeService: (checked: boolean) => void;
  onChangePrivacy: (checked: boolean) => void;
};

type TermContent = {
  title: string;
  content: string;
};

export default function TermsAgreements({
  serviceChecked,
  privacyChecked,
  onChangeService,
  onChangePrivacy,
}: TermsAgreementsProps) {
  const [openTermId, setOpenTermId] = useState<number | null>(null);
  const [terms, setTerms] = useState<Record<number, TermContent>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTerm = async (termId: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const detail = await getTermDetail(termId);
      setTerms((prev) => ({
        ...prev,
        [termId]: { title: detail.title, content: detail.content },
      }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "약관 내용을 불러오지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (termId: number) => {
    setOpenTermId(termId);

    if (!terms[termId]) {
      void loadTerm(termId);
    }
  };

  const openedTerm = openTermId === null ? null : terms[openTermId];
  const fallbackTitle =
    openTermId === SERVICE_TERM_ID ? "서비스 이용 약관" : "개인정보 수집 및 이용";

  return (
    <div className="sf-terms">
      <div className="sf-term-item">
        <label className="sf-term-label">
          <input
            className="sf-checkbox"
            type="checkbox"
            checked={serviceChecked}
            onChange={(e) => onChangeService(e.target.checked)}
            required
          />
          서비스 이용 약관 동의(필수)
        </label>
        <button
          type="button"
          className="sf-term-more"
          onClick={() => handleOpen(SERVICE_TERM_ID)}
        >
          더보기
        </button>
      </div>

      <div className="sf-term-item">
        <label className="sf-term-label">
          <input
            className="sf-checkbox"
            type="checkbox"
            checked={privacyChecked}
            onChange={(e) => onChangePrivacy(e.target.checked)}
            required
          />
          개인정보 수집 및 이용 동의(필수)
        </label>
        <button
          type="button"
          className="sf-term-more"
          onClick={() => handleOpen(PRIVACY_TERM_ID)}
        >
          더보기
        </button>
      </div>

      {openTermId !== null && (
        <TermModal
          title={openedTerm?.title ?? fallbackTitle}
          content={openedTerm?.content ?? null}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={() => void loadTerm(openTermId)}
          onClose={() => setOpenTermId(null)}
        />
      )}
    </div>
  );
}
