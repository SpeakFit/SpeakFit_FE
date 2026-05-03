import { useCallback, useEffect, useRef, useState } from "react";
import { getStoredAccessToken } from "../../../api/authStorage";
import type { WordRes } from "../../../api/practice";
import type { RealtimeHighlight, WordRealtimeFeedback } from "../types";

type RealtimeStatus = "idle" | "connecting" | "connected" | "error";

type RealtimeMessage = {
  highlight: RealtimeHighlight | null;
  transcript: string;
  error?: string;
  isAnalysisComplete: boolean;
};

type RealtimeScriptWord = {
  scriptWordId: number;
  scriptSentenceId: number;
  sentenceIndex: number;
  globalWordIndex: number;
  sentenceWordIndex: number;
  text: string;
  normalizedText: string;
  startCharIndex: number;
  endCharIndex: number;
};

type UsePracticeRealtimeResult = {
  status: RealtimeStatus;
  errorMessage: string | null;
  highlight: RealtimeHighlight | null;
  lastReadIndex: number;
  wordFeedbackByIndex: Record<number, WordRealtimeFeedback>;
  transcript: string;
  isAnalysisComplete: boolean;
  connect: (practiceId: number, scriptWords: RealtimeScriptWord[], wsUrl?: string) => Promise<void>;
  sendAudioChunk: (chunk: ArrayBuffer) => void;
  sendControl: (type: "pause" | "resume" | "stop") => void;
  disconnect: () => void;
};

const WS_READY_OPEN = 1;

function getRealtimeWsUrl(practiceId: number) {
  const configuredUrl = import.meta.env.VITE_PRACTICE_WS_URL as string | undefined;
  const aiBaseUrl = import.meta.env.VITE_AI_BASE_URL as string | undefined;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const realtimeBaseUrl = configuredUrl ?? aiBaseUrl ?? apiBaseUrl;

  if (!realtimeBaseUrl) return null;

  const url = new URL(realtimeBaseUrl);
  const token = getStoredAccessToken();

  url.protocol = url.protocol.replace(/^http/, "ws");
  const basePath = url.pathname.replace(/\/$/, "");

  if (/\/ws\/practice\/[^/]+$/.test(basePath)) {
    url.pathname = basePath.replace(
      /\/ws\/practice\/[^/]+$/,
      `/ws/practice/${practiceId}`,
    );
  } else if (basePath.endsWith("/ws/practice")) {
    url.pathname = `${basePath}/${practiceId}`;
  } else {
    url.pathname = `${basePath}/ws/practice/${practiceId}`.replace(/^\/\//, "/");
  }

  if (token) url.searchParams.set("token", token);

  return url.toString();
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function parseWordResults(value: unknown): WordRealtimeFeedback[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const source = item as Record<string, unknown>;
    const globalWordIndex = asNumber(source.globalWordIndex);
    const matchScore = asNumber(source.matchScore);

    if (globalWordIndex === undefined || matchScore === undefined) {
      return [];
    }

    return [
      {
        globalWordIndex,
        expectedWord: asString(source.expectedWord) ?? "",
        spokenWord: asString(source.spokenWord) ?? "",
        matchScore,
        isCorrect: source.isCorrect === true,
      },
    ];
  });
}
function isAnalysisCompletePayload(payload: Record<string, unknown>) {
  const status = asString(payload.status)?.toUpperCase();
  const type = asString(payload.type)?.toUpperCase();
  const event = asString(payload.event)?.toUpperCase();
  const message = asString(payload.message);

  return (
    status === "ANALYZED" ||
    status === "COMPLETED" ||
    type === "ANALYSIS_COMPLETE" ||
    type === "ANALYSIS_COMPLETED" ||
    event === "ANALYSIS_COMPLETE" ||
    event === "ANALYSIS_COMPLETED" ||
    message?.includes("분석완료") ||
    message?.includes("분석 완료") ||
    false
  );
}

function parseRealtimeMessage(eventData: MessageEvent["data"]): RealtimeMessage {
  if (typeof eventData !== "string") {
    return { highlight: null, transcript: "", isAnalysisComplete: false };
  }

  try {
    const payload = JSON.parse(eventData) as Record<string, unknown>;
    const isComplete = isAnalysisCompletePayload(payload);
    
    if (payload.type === "highlight") {
      const wordResults = parseWordResults(payload.wordResults);

      return {
        highlight: {
          wordIndex: asNumber(payload.currentGlobalWordIndex),
          text: asString(payload.matchedWord),
          isCorrect: wordResults[wordResults.length - 1]?.isCorrect ?? true,
          wordResults,
        },
        transcript: asString(payload.transcript) ?? "",
        isAnalysisComplete: isComplete,
      };
    }

    if (
      payload.type === "sttError" ||
      payload.type === "sttDisabled" ||
      payload.type === "restartRequired"
    ) {
      return {
        highlight: null,
        transcript: "",
        error: asString(payload.message) ?? "STT 서버 오류가 발생했습니다.",
        isAnalysisComplete: isComplete,
      };
    }

    return { 
      highlight: null, 
      transcript: asString(payload.transcript) ?? "",
      isAnalysisComplete: isComplete
    };
  } catch {
    const isComplete = eventData.includes("분석완료") || eventData.includes("분석 완료");
    return {
      highlight: null,
      transcript: typeof eventData === "string" ? eventData : "",
      isAnalysisComplete: isComplete,
    };
  }
}

export default function usePracticeRealtime(): UsePracticeRealtimeResult {
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<RealtimeHighlight | null>(null);
  const [lastReadIndex, setLastReadIndex] = useState<number>(-1);
  const [wordFeedbackByIndex, setWordFeedbackByIndex] = useState<Record<number, WordRealtimeFeedback>>({});
  const [transcript, setTranscript] = useState("");
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const sendControl = useCallback((type: "pause" | "resume" | "stop") => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WS_READY_OPEN) return;

    socket.send(JSON.stringify({ type }));
  }, []);

  const disconnect = useCallback(() => {
    const socket = socketRef.current;

    if (socket && socket.readyState === WS_READY_OPEN) {
      socket.send(JSON.stringify({ type: "stop" }));
      socket.close();
    }

    socketRef.current = null;
    setStatus("idle");
    setHighlight(null);
    setLastReadIndex(-1);
    setWordFeedbackByIndex({});
    setIsAnalysisComplete(false);
  }, []);

  const connect = useCallback(
    (practiceId: number, scriptWords: RealtimeScriptWord[], wsUrl?: string) => {
      return new Promise<void>((resolve, reject) => {
        disconnect();

        const finalWsUrl = wsUrl ?? getRealtimeWsUrl(practiceId);

        if (!finalWsUrl) {
          const err = "실시간 분석 서버 주소가 설정되지 않았습니다.";
          setStatus("error");
          setErrorMessage(err);
          reject(new Error(err));
          return;
        }

        setStatus("connecting");
        setErrorMessage(null);
        setHighlight(null);
        setLastReadIndex(-1);
        setWordFeedbackByIndex({});
        setTranscript("");
        setIsAnalysisComplete(false);

        let isReadyReceived = false;
        const socket = new WebSocket(finalWsUrl);
        socket.binaryType = "arraybuffer";
        socketRef.current = socket;

        const timeoutId = setTimeout(() => {
          if (!isReadyReceived) {
            socket.close();
            const err = "분석 서버 연결 준비 시간이 초과되었습니다.";
            setStatus("error");
            setErrorMessage(err);
            reject(new Error(err));
          }
        }, 5000);

        socket.onopen = () => {
          socket.send(
            JSON.stringify({
              type: "init",
              practiceId,
              scriptWords: scriptWords,
              audioEncoding: "LINEAR16",
              sampleRateHertz: 16000,
            }),
          );
        };

        socket.onmessage = (event) => {
          if (typeof event.data === "string") {
            try {
              const payload = JSON.parse(event.data);
              
              if (payload.type === "ready" || payload.type === "connected") {
                isReadyReceived = true;
                clearTimeout(timeoutId);
                setStatus("connected");
                resolve();
                return;
              }
              
              if (
                payload.type === "sttError" ||
                payload.type === "sttDisabled" ||
                payload.type === "restartRequired"
              ) {
                if (!isReadyReceived) {
                  clearTimeout(timeoutId);
                  reject(new Error(payload.message || "STT 설정에 실패했습니다."));
                }
                setStatus("error");
                setErrorMessage(payload.message || "STT 서버 오류");
                socket.close();
                return;
              }
            } catch {
              // JSON이 아니면 아래 일반 메시지 파서로 처리합니다.
            }
          }

          const message = parseRealtimeMessage(event.data);

          if (message.error) {
            setStatus("error");
            setErrorMessage(message.error);
            return;
          }

          if (message.transcript) setTranscript(message.transcript);
          if (message.isAnalysisComplete) setIsAnalysisComplete(true);
          
          if (message.highlight && message.highlight.wordIndex !== undefined) {
            setHighlight(message.highlight);
            setLastReadIndex((prev) =>
              Math.max(prev, message.highlight!.wordIndex!),
            );
            if (message.highlight.wordResults?.length) {
              setWordFeedbackByIndex((prev) => {
                const next = { ...prev };
                message.highlight!.wordResults!.forEach((wordResult) => {
                  next[wordResult.globalWordIndex] = wordResult;
                });
                return next;
              });
            }
          }
        };

        socket.onerror = () => {
          if (!isReadyReceived) {
            clearTimeout(timeoutId);
            reject(new Error("WebSocket Connection Failed"));
          }
          setStatus("error");
          setErrorMessage("실시간 분석 서버에 연결하지 못했습니다.");
        };

        socket.onclose = () => {
          clearTimeout(timeoutId);
          if (socketRef.current === socket) {
            socketRef.current = null;
            setStatus((prev) => (prev === "error" ? "error" : "idle"));
          }
        };
      });
    },
    [disconnect],
  );

  const sendAudioChunk = useCallback((chunk: ArrayBuffer) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WS_READY_OPEN || chunk.byteLength === 0) {
      return;
    }

    socket.send(chunk);
  }, []);

  useEffect(() => disconnect, [disconnect]);

  return {
    status,
    errorMessage,
    highlight,
    lastReadIndex,
    wordFeedbackByIndex,
    transcript,
    isAnalysisComplete,
    connect,
    sendAudioChunk,
    sendControl,
    disconnect,
  };
}
