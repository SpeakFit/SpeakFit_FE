type TermsAgreementsProps = {
  serviceChecked: boolean;
  privacyChecked: boolean;
  onChangeService: (checked: boolean) => void;
  onChangePrivacy: (checked: boolean) => void;
};

export default function TermsAgreements({
  serviceChecked,
  privacyChecked,
  onChangeService,
  onChangePrivacy,
}: TermsAgreementsProps) {
  return (
    <div className="sf-terms">
      <label className="sf-term-item">
        <input
          className="sf-checkbox"
          type="checkbox"
          checked={serviceChecked}
          onChange={(e) => onChangeService(e.target.checked)}
          required
        />
        서비스 이용 약관 동의(필수)
      </label>

      <label className="sf-term-item">
        <input
          className="sf-checkbox"
          type="checkbox"
          checked={privacyChecked}
          onChange={(e) => onChangePrivacy(e.target.checked)}
          required
        />
        개인정보 수집 및 이용 동의(필수)
      </label>
    </div>
  );
}