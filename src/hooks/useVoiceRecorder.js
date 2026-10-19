import fixWebmDuration from 'fix-webm-duration';
import { useCallback, useEffect, useRef, useState } from 'react';
import { simpleAudioMime } from '../utils/chatAttachmentUtils';
import {
  createLiveAnalyser,
  getLiveWaveformLevels,
} from '../utils/voiceWaveform';

/**
 * Records microphone audio via MediaRecorder.
 * stop() / toggle() while recording always finalizes and calls onRecorded(file).
 */
export function useVoiceRecorder({
  onRecorded,
  onRecordingChange,
  disabled = false,
} = {}) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const [liveLevels, setLiveLevels] = useState([]);
  const [recordElapsed, setRecordElapsed] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const recordStartRef = useRef(0);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const analysisStreamRef = useRef(null);
  const onRecordedRef = useRef(onRecorded);
  const onRecordingChangeRef = useRef(onRecordingChange);

  useEffect(() => {
    onRecordedRef.current = onRecorded;
  }, [onRecorded]);

  useEffect(() => {
    onRecordingChangeRef.current = onRecordingChange;
  }, [onRecordingChange]);

  const setRecordingState = useCallback((next) => {
    setRecording(next);
    onRecordingChangeRef.current?.(next);
    if (!next) {
      setLiveLevels([]);
      setRecordElapsed(0);
    }
  }, []);

  const cleanupAnalyser = useCallback(async () => {
    analyserRef.current = null;
    analysisStreamRef.current?.getTracks().forEach((track) => track.stop());
    analysisStreamRef.current = null;
    if (audioContextRef.current) {
      await audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    cleanupAnalyser();
  }, [cleanupAnalyser]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== 'recording') {
      return;
    }

    try {
      if (typeof recorder.requestData === 'function') {
        recorder.requestData();
      }
    } catch {
      // ignore flush errors
    }

    recorder.stop();
  }, []);

  const startRecording = useCallback(async () => {
    if (recording || disabled) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone is not supported in this browser.');
      return;
    }

    if (!window.isSecureContext) {
      setError('Microphone requires HTTPS or localhost.');
      return;
    }

    setError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      try {
        const { audioContext, analyser, analysisStream } =
          await createLiveAnalyser(stream);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        analysisStreamRef.current = analysisStream;
      } catch {
        await cleanupAnalyser();
      }

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setError('Recording failed. Please try again.');
        stopRecording();
      };

      recorder.onstop = () => {
        const chunks = chunksRef.current;
        chunksRef.current = [];
        cleanupStream();
        setRecordingState(false);

        if (!chunks.length) {
          setError('No audio captured. Record for at least one second.');
          return;
        }

        const mime = simpleAudioMime(recorder.mimeType);
        const ext = mime.includes('mp4') ? 'm4a' : 'webm';
        const blob = new Blob(chunks, { type: mime });

        if (!blob.size) {
          setError('No audio captured. Record for at least one second.');
          return;
        }

        const durationMs = Math.max(0, Date.now() - recordStartRef.current);

        (async () => {
          let finalBlob = blob;
          if (mime.includes('webm')) {
            finalBlob = await new Promise((resolve) => {
              fixWebmDuration(blob, durationMs, resolve, { logger: false });
            });
          }

          const file = new File([finalBlob], `voice-${Date.now()}.${ext}`, { type: mime });

          if (typeof onRecordedRef.current === 'function') {
            onRecordedRef.current(file);
          }
        })();
      };

      mediaRecorderRef.current = recorder;
      recordStartRef.current = Date.now();
      recorder.start(250);
      setRecordingState(true);
    } catch (err) {
      cleanupStream();
      setRecordingState(false);
      setError(
        err?.name === 'NotAllowedError'
          ? 'Microphone permission denied.'
          : 'Microphone access denied or unavailable.'
      );
    }
  }, [recording, disabled, cleanupStream, cleanupAnalyser, stopRecording, setRecordingState]);

  const toggleRecording = useCallback(() => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [recording, startRecording, stopRecording]);

  useEffect(() => {
    if (!recording) return undefined;

    let rafId;
    const tick = () => {
      if (analyserRef.current) {
        setLiveLevels(getLiveWaveformLevels(analyserRef.current));
      }
      setRecordElapsed((Date.now() - recordStartRef.current) / 1000);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [recording]);

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder?.state === 'recording') {
        try {
          if (typeof recorder.requestData === 'function') {
            recorder.requestData();
          }
          recorder.stop();
        } catch {
          // ignore unmount stop errors
        }
      } else {
        cleanupStream();
      }
    };
  }, [cleanupStream]);

  return {
    recording,
    error,
    setError,
    liveLevels,
    recordElapsed,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
