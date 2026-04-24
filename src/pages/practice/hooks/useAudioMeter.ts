import { useCallback, useEffect, useRef, useState } from "react";

type RecorderStatus = "idle" | "recording" | "paused";

type UseAudioMeterResult = {
  status: RecorderStatus;
  isRecording: boolean;
  volumeLevel: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  recordingError: string | null;
  startRecording: () => Promise<boolean>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<Blob | null>;
};

export default function useAudioMeter(): UseAudioMeterResult {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const mimeTypeRef = useRef<string>("");

  const stopMeterLoop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setVolumeLevel(0);
  }, []);

  const startMeterLoop = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.fftSize);

    const update = () => {
      analyser.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i += 1) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }

      const rms = Math.sqrt(sum / dataArray.length);

      // 0~100 정도로 보이게 단순 스케일링
      const level = Math.min(100, Math.round(rms * 180));
      setVolumeLevel(level);

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);
  }, []);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const cleanupAudioNodes = useCallback(async () => {
    stopMeterLoop();

    sourceNodeRef.current?.disconnect();
    analyserRef.current?.disconnect();

    sourceNodeRef.current = null;
    analyserRef.current = null;

    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopMeterLoop]);

  const startRecording = useCallback(async () => {
    if (status !== "idle") return false;

    setRecordingError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeTypeCandidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];

      const supportedMimeType =
        mimeTypeCandidates.find((type) => MediaRecorder.isTypeSupported(type)) ??
        "";

      mimeTypeRef.current = supportedMimeType;

      const mediaRecorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setAudioBlob(null);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;

      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceNodeRef.current = sourceNode;

      setStatus("recording");
      startMeterLoop();
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "마이크 권한을 확인한 뒤 다시 시도해주세요.";

      setStatus("idle");
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      mimeTypeRef.current = "";
      setAudioBlob(null);

      cleanupStream();
      await cleanupAudioNodes();

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      setRecordingError(message);
      return false;
    }
  }, [audioUrl, cleanupAudioNodes, cleanupStream, startMeterLoop, status]);

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || status !== "recording") return;

    if (recorder.state === "recording") {
      recorder.pause();
      setStatus("paused");
      stopMeterLoop();
    }
  }, [status, stopMeterLoop]);

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || status !== "paused") return;

    if (recorder.state === "paused") {
      recorder.resume();
      setStatus("recording");
      startMeterLoop();
    }
  }, [startMeterLoop, status]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder || (status !== "recording" && status !== "paused")) {
        resolve(null);
        return;
      }

      recorder.onstop = async () => {
        const finalBlob = new Blob(audioChunksRef.current, {
          type: mimeTypeRef.current || "audio/webm",
        });

        const url = URL.createObjectURL(finalBlob);

        setAudioBlob(finalBlob);
        setAudioUrl(url);
        setStatus("idle");

        mediaRecorderRef.current = null;
        audioChunksRef.current = [];

        cleanupStream();
        await cleanupAudioNodes();

        resolve(finalBlob);
      };

      recorder.stop();
    });
  }, [cleanupAudioNodes, cleanupStream, status]);

  useEffect(() => {
    return () => {
      cleanupStream();
      cleanupAudioNodes();

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, cleanupAudioNodes, cleanupStream]);

  return {
    status,
    isRecording: status === "recording",
    volumeLevel,
    audioBlob,
    audioUrl,
    recordingError,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
}
