import { useCallback, useEffect, useRef, useState } from "react";
import { getStoredAccessToken } from "../../../api/authStorage";
import type { RealtimeHighlight } from "../types";

type RealtimeStatus = "idle" | "connecting" | "connected" | "error";

type RealtimeMessage = {
  highlight: RealtimeHighlight | null;
  transcript: string;
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
  transcript: string;
  isAnalysisComplete: boolean;
  connect: (practiceId: number, scriptWords: RealtimeScriptWord[]) => void;
  sendAudioChunk: (chunk: Blob) => void;
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
    const source =
      (payload.highlight as Record<string, unknown> | undefined) ?? payload;

    return {
      highlight: {
        wordIndex:
          asNumber(source.wordIndex) ??
          asNumber(source.currentWordIndex) ??
          asNumber(source.current_word_index) ??
          asNumber(source.index),
        lineIndex: asNumber(source.lineIndex) ?? asNumber(source.line_index),
        startOffset:
          asNumber(source.startOffset) ??
          asNumber(source.start_offset) ??
          asNumber(source.start),
        endOffset:
          asNumber(source.endOffset) ??
          asNumber(source.end_offset) ??
          asNumber(source.end),
        text:
          asString(source.text) ??
          asString(source.word) ??
          asString(source.currentWord) ??
          asString(source.current_word) ??
          asString(payload.transcript),
      },
      transcript:
        asString(payload.transcript) ??
        asString(payload.text) ??
        asString(payload.partial) ??
        "",
      isAnalysisComplete: isAnalysisCompletePayload(payload),
    };
  } catch {
    return {
      highlight: { text: eventData },
      transcript: eventData,
      isAnalysisComplete:
        eventData.includes("분석완료") || eventData.includes("분석 완료"),
    };
  }
}

export default function usePracticeRealtime(): UsePracticeRealtimeResult {
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<RealtimeHighlight | null>(null);
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
  }, []);

  const connect = useCallback(
    (practiceId: number, scriptWords: RealtimeScriptWord[]) => {
      disconnect();

      const wsUrl = getRealtimeWsUrl(practiceId);
      if (!wsUrl) {
        setStatus("error");
        setErrorMessage("실시간 분석 서버 주소가 설정되지 않았습니다.");
        return;
      }

      setStatus("connecting");
      setErrorMessage(null);
      setHighlight(null);
      setTranscript("");
      setIsAnalysisComplete(false);

      const socket = new WebSocket(wsUrl);
      socket.binaryType = "arraybuffer";
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus("connected");
        socket.send(JSON.stringify({ type: "init", practiceId, scriptWords }));
      };

      socket.onmessage = (event) => {
        const message = parseRealtimeMessage(event.data);
        setTranscript(message.transcript);
        setHighlight(message.highlight);
        if (message.isAnalysisComplete) {
          setIsAnalysisComplete(true);
        }
      };

      socket.onerror = () => {
        setStatus("error");
        setErrorMessage("실시간 분석 서버와 연결하지 못했습니다.");
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
          setStatus((prev) => (prev === "error" ? "error" : "idle"));
        }
      };
    },
    [disconnect],
  );

  const sendAudioChunk = useCallback((chunk: Blob) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WS_READY_OPEN) return;

    socket.send(chunk);
  }, []);

  useEffect(() => disconnect, [disconnect]);

  return {
    status,
    errorMessage,
    highlight,
    transcript,
    isAnalysisComplete,
    connect,
    sendAudioChunk,
    sendControl,
    disconnect,
  };
}
