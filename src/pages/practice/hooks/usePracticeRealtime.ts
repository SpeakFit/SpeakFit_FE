import { useCallback, useEffect, useRef, useState } from "react";
import { getStoredAccessToken } from "../../../api/authStorage";
import type { RealtimeHighlight } from "../types";

type RealtimeStatus = "idle" | "connecting" | "connected" | "error";

type RealtimeMessage = {
  highlight: RealtimeHighlight | null;
  transcript: string;
};

type UsePracticeRealtimeResult = {
  status: RealtimeStatus;
  errorMessage: string | null;
  highlight: RealtimeHighlight | null;
  transcript: string;
  connect: (practiceId: number, script: string) => void;
  sendAudioChunk: (chunk: Blob) => void;
  sendControl: (type: "pause" | "resume" | "stop") => void;
  disconnect: () => void;
};

const WS_READY_OPEN = 1;

function getRealtimeWsUrl(practiceId: number) {
  const configuredUrl = import.meta.env.VITE_PRACTICE_WS_URL as string | undefined;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const fallbackUrl = apiBaseUrl?.replace(/^http/, "ws");
  const baseUrl = configuredUrl ?? fallbackUrl;

  if (!baseUrl) return null;

  const url = new URL(baseUrl);
  const token = getStoredAccessToken();

  url.searchParams.set("practiceId", String(practiceId));
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

function parseRealtimeMessage(eventData: MessageEvent["data"]): RealtimeMessage {
  if (typeof eventData !== "string") {
    return { highlight: null, transcript: "" };
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
    };
  } catch {
    return {
      highlight: { text: eventData },
      transcript: eventData,
    };
  }
}

export default function usePracticeRealtime(): UsePracticeRealtimeResult {
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<RealtimeHighlight | null>(null);
  const [transcript, setTranscript] = useState("");
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
    (practiceId: number, script: string) => {
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

      const socket = new WebSocket(wsUrl);
      socket.binaryType = "arraybuffer";
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus("connected");
        socket.send(JSON.stringify({ type: "start", practiceId, script }));
      };

      socket.onmessage = (event) => {
        const message = parseRealtimeMessage(event.data);
        setTranscript(message.transcript);
        setHighlight(message.highlight);
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
    connect,
    sendAudioChunk,
    sendControl,
    disconnect,
  };
}
