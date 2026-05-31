/**
 * 발표 스타일 2x2 매트릭스.
 *
 * 4분면:
 *   좌상 = 전달력 있는 스타일 (높은 피치 / 느린 속도)
 *   우상 = 열정적인 스타일   (높은 피치 / 빠른 속도)
 *   좌하 = 신중한 스타일     (낮은 피치 / 느린 속도)
 *   우하 = 지적인 스타일     (낮은 피치 / 빠른 속도)
 *
 * 사용자 위치(녹색 점):
 *   백엔드 styleMatching.mostSimilarStyle 로 사분면을 확정하고,
 *   userAverageMetrics 의 WPM/Pitch 로 사분면 내 미세 위치를 정한다.
 *   (WPM/Pitch 의 절대 스케일이 군집 데이터와 달라, 사분면은 스타일명으로 확정)
 */

type Quadrant = { xMin: number; xMax: number; yMin: number; yMax: number };

// x: 0(느림) ~ 1(빠름) / y: 0(톤 낮음) ~ 1(톤 높음)
const STYLE_QUADRANT: Record<string, Quadrant> = {
  전달력: { xMin: 0.0, xMax: 0.5, yMin: 0.5, yMax: 1.0 },
  열정적: { xMin: 0.5, xMax: 1.0, yMin: 0.5, yMax: 1.0 },
  신중한: { xMin: 0.0, xMax: 0.5, yMin: 0.0, yMax: 0.5 },
  지적인: { xMin: 0.5, xMax: 1.0, yMin: 0.0, yMax: 0.5 },
};

// README §3 대학 강의 군집 데이터 기준 축 범위
const WPM_MIN = 78;
const WPM_MAX = 108;
const PITCH_MIN = 125;
const PITCH_MAX = 277;

function normalizeStyleName(name: string | null): string | null {
  if (!name) return null;
  if (name.includes("전달력")) return "전달력";
  if (name.includes("열정")) return "열정적";
  if (name.includes("신중")) return "신중한";
  if (name.includes("지적")) return "지적인";
  return null;
}

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

function norm(v: number | null, min: number, max: number): number {
  if (v === null) return 0.5;
  return clamp01((v - min) / (max - min));
}

/** 사분면 + WPM/Pitch 로 0~1 좌표 산출 (없으면 null) */
function computePoint(
  styleName: string | null,
  wpm: number | null,
  pitch: number | null
): { x: number; y: number } | null {
  const style = normalizeStyleName(styleName);
  if (!style) return null;
  const q = STYLE_QUADRANT[style];

  const tx = norm(wpm, WPM_MIN, WPM_MAX);
  const ty = norm(pitch, PITCH_MIN, PITCH_MAX);

  // 사분면 경계에 붙지 않도록 안쪽 여백
  const pad = 0.18;
  const x = q.xMin + (q.xMax - q.xMin) * (pad + tx * (1 - 2 * pad));
  const y = q.yMin + (q.yMax - q.yMin) * (pad + ty * (1 - 2 * pad));
  return { x, y };
}

type Props = {
  styleName: string | null;
  wpm: number | null;
  pitch: number | null;
};

// SVG viewBox 크기
const W = 520;
const H = 420;
const PAD = 40; // 축 라벨 공간

export default function FeedbackStyleMatrix({ styleName, wpm, pitch }: Props) {
  const point = computePoint(styleName, wpm, pitch);

  const plotW = W - PAD * 2;
  const plotH = H - PAD * 2;
  const midX = PAD + plotW / 2;
  const midY = PAD + plotH / 2;

  // 0~1 좌표를 SVG 좌표로 (y는 위가 0이므로 반전)
  const toSvgX = (x: number) => PAD + x * plotW;
  const toSvgY = (y: number) => PAD + (1 - y) * plotH;

  return (
    <div className="feedback-matrix">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="feedback-matrix__svg"
        role="img"
        aria-label="발표 스타일 매트릭스"
      >
        {/* 4분면 배경 */}
        <rect x={PAD} y={PAD} width={plotW / 2} height={plotH / 2} fill="#dce8f5" rx="4" />
        <rect x={midX} y={PAD} width={plotW / 2} height={plotH / 2} fill="#f8ddd7" rx="4" />
        <rect x={PAD} y={midY} width={plotW / 2} height={plotH / 2} fill="#d4ebe4" rx="4" />
        <rect x={midX} y={midY} width={plotW / 2} height={plotH / 2} fill="#dcf0d2" rx="4" />

        {/* 사분면 라벨 */}
        <text x={PAD + plotW / 4} y={PAD + 28} className="feedback-matrix__quad-title" textAnchor="middle">전달력 있는 스타일</text>
        <text x={PAD + plotW / 4} y={PAD + 46} className="feedback-matrix__quad-sub" textAnchor="middle">(High Pitch, Slow WPM)</text>

        <text x={midX + plotW / 4} y={PAD + 28} className="feedback-matrix__quad-title" textAnchor="middle">열정적인 스타일</text>
        <text x={midX + plotW / 4} y={PAD + 46} className="feedback-matrix__quad-sub" textAnchor="middle">(High Pitch, Fast WPM)</text>

        <text x={PAD + plotW / 4} y={midY + 28} className="feedback-matrix__quad-title" textAnchor="middle">신중한 스타일</text>
        <text x={PAD + plotW / 4} y={midY + 46} className="feedback-matrix__quad-sub" textAnchor="middle">(Low Pitch, Slow WPM)</text>

        <text x={midX + plotW / 4} y={midY + 28} className="feedback-matrix__quad-title" textAnchor="middle">지적인 스타일</text>
        <text x={midX + plotW / 4} y={midY + 46} className="feedback-matrix__quad-sub" textAnchor="middle">(Low Pitch, Fast WPM)</text>

        {/* 중앙 십자축 */}
        <line x1={midX} y1={PAD} x2={midX} y2={PAD + plotH} stroke="#ffffff" strokeWidth="1.5" />
        <line x1={PAD} y1={midY} x2={PAD + plotW} y2={midY} stroke="#ffffff" strokeWidth="1.5" />

        {/* 축 라벨 */}
        <text x={midX} y={20} className="feedback-matrix__axis" textAnchor="middle">목소리 톤 (Pitch: High)</text>
        <text x={midX} y={H - 10} className="feedback-matrix__axis" textAnchor="middle">Low</text>
        <text x={PAD - 8} y={midY - 6} className="feedback-matrix__axis" textAnchor="end">Slow</text>
        <text x={W - PAD + 8} y={midY - 6} className="feedback-matrix__axis" textAnchor="start">말하기 속도 (WPM: Fast)</text>

        {/* 사용자 위치 점 */}
        {point && (
          <g>
            <circle
              cx={toSvgX(point.x)}
              cy={toSvgY(point.y)}
              r="22"
              fill="#35c6a7"
              opacity="0.18"
            />
            <circle
              cx={toSvgX(point.x)}
              cy={toSvgY(point.y)}
              r="9"
              fill="#1f9e82"
            />
          </g>
        )}
      </svg>

      {!point && (
        <p className="feedback-matrix__empty">
          발표 스타일 분석 결과가 연결되면 위치가 표시됩니다.
        </p>
      )}
    </div>
  );
}