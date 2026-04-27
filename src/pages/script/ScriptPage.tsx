import { useMemo, useState } from "react";
import "./styles/script.css";

type AudienceAge = "어린이" | "청소년" | "노년" | "성인" | "";
type AudienceLevel = "잘 모름" | "보통" | "잘 앎" | "";
type Purpose = "발표" | "면접" | "강의" | "토론" | "피드백 연습" | "";

interface ScriptItem {
  id: number;
  title: string;
  content: string;
  duration: string;
  audienceAge: AudienceAge;
  audienceLevel: AudienceLevel;
  purpose: Purpose;
  topic: string;
  keywords: string;
}

const AGE_OPTIONS: Exclude<AudienceAge, "">[] = ["어린이", "청소년", "노년", "성인"];
const LEVEL_OPTIONS: Exclude<AudienceLevel, "">[] = ["잘 모름", "보통", "잘 앎"];
const PURPOSE_OPTIONS: Exclude<Purpose, "">[] = ["발표", "면접", "강의", "토론", "피드백 연습"];

const GUIDE_PLACEHOLDER = `발표 대본을 작성해요.

대본을 못 쓰겠다면 우측의 대본 작성 가이드를 통해 발표 대본을 생성할 수 있어요.

또는, 우측의 가이드를 통해 기존 대본을 업데이트할 수 있어요.

대본을 다 작성했다면,
우측 하단의 발표 연습 시작하기 버튼으로 발표 연습을 시작할 수 있어요 .`;

const createEmptyScript = (): ScriptItem => ({
  id: Date.now(),
  title: "",
  content: "",
  duration: "",
  audienceAge: "",
  audienceLevel: "",
  purpose: "",
  topic: "",
  keywords: "",
});

const ScriptPage = () => {
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  const selectedScript = useMemo(
    () => scripts.find((item) => item.id === selectedId) ?? null,
    [scripts, selectedId]
  );

  const hasScripts = scripts.length > 0;
  const hasSelectedScript = !!selectedScript;
  const hasContent = !!selectedScript?.content.trim();

  const isActionEnabled = !!(
    selectedScript &&
    selectedScript.title.trim() &&
    selectedScript.duration.trim() &&
    selectedScript.audienceAge &&
    selectedScript.audienceLevel &&
    selectedScript.purpose &&
    selectedScript.topic.trim() &&
    selectedScript.keywords.trim()
  );

  const handleAddScript = () => {
    const newItem = createEmptyScript();
    setScripts((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
    setCheckedIds([]);
  };

  const handleSelectScript = (id: number) => {
    setSelectedId(id);
  };

  const handleToggleCheck = (id: number) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleDeleteChecked = () => {
    if (checkedIds.length === 0) return;

    const nextScripts = scripts.filter((item) => !checkedIds.includes(item.id));
    setScripts(nextScripts);
    setCheckedIds([]);

    if (nextScripts.length === 0) {
      setSelectedId(null);
      return;
    }

    if (selectedId && checkedIds.includes(selectedId)) {
      setSelectedId(nextScripts[0].id);
    }
  };

  const updateSelectedScript = <K extends keyof ScriptItem>(key: K, value: ScriptItem[K]) => {
    if (!selectedScript) return;

    setScripts((prev) =>
      prev.map((item) =>
        item.id === selectedScript.id
          ? {
              ...item,
              [key]: value,
            }
          : item
      )
    );
  };

  const handleGenerateOrOptimize = () => {
    if (!selectedScript || !isActionEnabled) return;

    console.log("generate/optimize request", selectedScript); // 백엔드 연결 후 api 호출
  };

  const handleStartPractice = () => {
    if (!selectedScript) return;

    console.log("start practice", selectedScript); // 발표 연습 시작 로직 연결 예정
  };

  return (
    <main className="script-page">
      <div className="script-page__frame">
        <section className="script-page__header">
          <h1 className="script-page__title">발표 대본 리스트</h1>

          <div className="script-page__tab-wrap">
            <button type="button" className="script-page__tab script-page__tab--active">
              스피치 모드
            </button>

            <button
              type="button"
              className="script-page__tab script-page__tab--disabled"
              disabled
            >
              프리젠테이션모드
            </button>
          </div>
        </section>

        <section
          className={`script-page__content ${
            hasSelectedScript
              ? "script-page__content--three-columns"
              : "script-page__content--two-columns"
          }`}
        >
          <div className="script-list-panel">
            <div className="script-list-panel__box">
              <div className="script-list-panel__header">
                <span className="script-list-panel__title">발표 주제</span>

                <div className="script-list-panel__header-actions">
                  <button type="button" className="script-list-panel__sort-btn">
                    정렬 <span className="script-list-panel__sort-icon">↓</span>
                  </button>

                  <button
                    type="button"
                    className="script-list-panel__icon-btn"
                    onClick={handleAddScript}
                    aria-label="대본 추가"
                  >
                    ＋
                  </button>
                </div>
              </div>

              <div className="script-list-panel__body">
                {!hasScripts ? (
                  <div className="script-list-panel__empty">
                    <p>
                      상단 우측의 아이콘을 통해
                      <br />
                      대본을 추가해요.
                    </p>
                  </div>
                ) : (
                  <>
                    {scripts.map((item) => {
                      const isSelected = item.id === selectedId;

                      return (
                        <div
                          key={item.id}
                          className={`script-list-item ${
                            isSelected ? "script-list-item--selected" : ""
                          }`}
                          onClick={() => handleSelectScript(item.id)}
                        >
                          <label
                            className="script-list-item__left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={checkedIds.includes(item.id)}
                              onChange={() => handleToggleCheck(item.id)}
                            />
                            <span>{item.title.trim() || "발표 주제를 작성하세요."}</span>
                          </label>

                          <div className="script-list-item__actions">
                            <button type="button" className="script-list-item__action-btn">
                              ↕
                            </button>
                            <button type="button" className="script-list-item__action-btn">
                              »
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="script-list-panel__dashed-line" />
                  </>
                )}
              </div>
            </div>
          </div>

          <section className="script-editor-panel">
            {!hasSelectedScript ? (
              <div className="script-editor-panel__empty">
                <p>등록된 발표 대본이 없어요.</p>
                <p>대본을 추가해서 발표 연습을 시작해요.</p>
              </div>
            ) : (
              <>
                <div className="script-editor-panel__header">
                  {selectedScript.title.trim() || "발표 주제를 작성하세요."}
                </div>

                <textarea
                  className="script-editor-panel__textarea"
                  value={selectedScript.content}
                  onChange={(e) => updateSelectedScript("content", e.target.value)}
                  placeholder={GUIDE_PLACEHOLDER}
                />
              </>
            )}
          </section>

          {hasSelectedScript && (
            <aside className="script-generator-panel">
              <div className="script-generator-panel__header">
                <div className="script-generator-panel__title-wrap">
                  <span className="script-generator-panel__title-icon">✎</span>
                  <h2 className="script-generator-panel__title">
                    {hasContent ? "발표 스크립트 최적화" : "발표 스크립트 생성"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="script-generator-panel__submit-btn"
                  disabled={!isActionEnabled}
                  onClick={handleGenerateOrOptimize}
                >
                  {hasContent ? "스크립트 최적화" : "스크립트 생성"}
                </button>
              </div>

              <div className="script-generator-panel__form">
                <div className="script-field">
                  <label className="script-field__label">발표 주제</label>
                  <input
                    className="script-field__input"
                    type="text"
                    placeholder="ex) 캡스톤 프로젝트 발표"
                    value={selectedScript.title}
                    onChange={(e) => updateSelectedScript("title", e.target.value)}
                  />
                </div>

                <div className="script-field">
                  <label className="script-field__label">발표 시간</label>
                  <div className="script-field__time-wrap">
                    <input
                      className="script-field__input script-field__input--time"
                      type="text"
                      value={selectedScript.duration}
                      onChange={(e) => updateSelectedScript("duration", e.target.value)}
                    />
                    <span className="script-field__time-unit">분</span>
                  </div>
                </div>

                <div className="script-field">
                  <label className="script-field__label">청중</label>

                  <p className="script-field__sub-label">청중 나이대</p>
                  <div className="script-chip-group">
                    {AGE_OPTIONS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`script-chip ${
                          selectedScript.audienceAge === item ? "script-chip--active" : ""
                        }`}
                        onClick={() => updateSelectedScript("audienceAge", item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <p className="script-field__sub-label">청중 이해도</p>
                  <div className="script-chip-group">
                    {LEVEL_OPTIONS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`script-chip ${
                          selectedScript.audienceLevel === item ? "script-chip--active" : ""
                        }`}
                        onClick={() => updateSelectedScript("audienceLevel", item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="script-field">
                  <label className="script-field__label">스피치 유형</label>
                  <div className="script-chip-group">
                    {PURPOSE_OPTIONS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`script-chip ${
                          selectedScript.purpose === item ? "script-chip--active" : ""
                        }`}
                        onClick={() => updateSelectedScript("purpose", item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="script-field">
                  <label className="script-field__label">발표 목적</label>
                  <input
                    className="script-field__input"
                    type="text"
                    value={selectedScript.topic}
                    onChange={(e) => updateSelectedScript("topic", e.target.value)}
                  />
                </div>

                <div className="script-field">
                  <label className="script-field__label">강조 키워드</label>
                  <input
                    className="script-field__input"
                    type="text"
                    value={selectedScript.keywords}
                    onChange={(e) => updateSelectedScript("keywords", e.target.value)}
                  />
                </div>
              </div>
            </aside>
          )}
        </section>

        <div
          className={`script-page__actions ${
            hasSelectedScript ? "script-page__actions--three-columns" : "script-page__actions--two-columns"
          }`}
        >
          <div className="script-page__actions-cell script-page__actions-cell--left">
            <button
              type="button"
              className="script-list-panel__delete-btn"
              disabled={checkedIds.length === 0}
              onClick={handleDeleteChecked}
            >
              삭제하기
            </button>
          </div>

          <div className="script-page__actions-cell script-page__actions-cell--center" />

          <div className="script-page__actions-cell script-page__actions-cell--right">
            {hasSelectedScript && (
              <button
                type="button"
                className="script-page__start-btn"
                onClick={handleStartPractice}
              >
                발표 연습 시작하기
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ScriptPage;
