import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { FeedbackTrendSeries } from "../mapFeedbackResponse";

// 백엔드가 주는 5개 지표 모두 토글로 노출 (속도/피치/성량/멈춤/발음)
const TOGGLE_KEYS: FeedbackTrendSeries["key"][] = [
  "speed",
  "hz",
  "db",
  "pause",
  "zcr",
];

const MINT = "#35c6a7";

type Props = {
  series: FeedbackTrendSeries[];
};

export default function FeedbackTrendChart({ series }: Props) {
  // 토글 가능한 시리즈만 추림
  const toggleable = series.filter((s) => TOGGLE_KEYS.includes(s.key));

  const [activeKey, setActiveKey] = useState<FeedbackTrendSeries["key"]>(
    toggleable[0]?.key ?? "speed"
  );

  const active = toggleable.find((s) => s.key === activeKey) ?? toggleable[0];

  // 데이터 없을 때
  if (!active || active.points.length === 0) {
    return (
      <div className="feedback-trend-chart">
        <div className="feedback-trend-chart__toggles">
          {toggleable.map((s) => (
            <button
              key={s.key}
              type="button"
              aria-pressed={s.key === activeKey}
              className={`feedback-trend-chart__toggle ${
                s.key === activeKey
                  ? "feedback-trend-chart__toggle--active"
                  : ""
              }`}
              onClick={() => setActiveKey(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="feedback-trend-chart__empty">
          지난 발표 데이터가 연결되면 변화 추이가 표시됩니다.
        </div>
      </div>
    );
  }

  const chartData = active.points.map((p) => ({
    label: p.sessionLabel,
    value: p.value,
  }));

  return (
    <div className="feedback-trend-chart">
      <div className="feedback-trend-chart__toggles">
        {toggleable.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={s.key === activeKey}
            className={`feedback-trend-chart__toggle ${
              s.key === activeKey ? "feedback-trend-chart__toggle--active" : ""
            }`}
            onClick={() => setActiveKey(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="feedback-trend-chart__canvas">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 8, left: 20 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#e2e8f0"
              strokeDasharray="4 6"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#94a3b8", fontSize: 13 }}
              dy={8}
            />
            <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip
              cursor={{ stroke: MINT, strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                fontSize: 13,
              }}
              formatter={(value) => [
                `${value} ${active.unit}`,
                active.label,
              ]}
              labelStyle={{ color: "#64748b" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={MINT}
              strokeWidth={3}
              dot={{ r: 5, fill: MINT, strokeWidth: 0 }}
              activeDot={{ r: 7, fill: MINT, strokeWidth: 0 }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}