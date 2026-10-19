import { inferAudioMimeFromUrl } from './chatAttachmentUtils';

export const VOICE_WAVEFORM_BARS = 40;

const peaksCache = new Map();

export function formatVoiceDuration(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export async function createLiveAnalyser(stream) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('Web Audio is not supported in this browser');
  }

  const audioContext = new AudioCtx();
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  const analysisStream =
    typeof stream?.clone === 'function' ? stream.clone() : stream;
  const source = audioContext.createMediaStreamSource(analysisStream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);

  return { audioContext, analyser, analysisStream };
}

export function getLiveWaveformLevels(analyser, barCount = VOICE_WAVEFORM_BARS) {
  if (!analyser) {
    return Array.from({ length: barCount }, () => 0.12);
  }

  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  const step = Math.max(1, Math.floor(data.length / barCount));
  const levels = [];

  for (let i = 0; i < barCount; i += 1) {
    let sum = 0;
    const start = i * step;
    for (let j = 0; j < step; j += 1) {
      sum += data[start + j] || 0;
    }
    const normalized = sum / step / 255;
    levels.push(Math.max(0.12, Math.min(1, normalized * 1.6)));
  }

  return levels;
}

function peaksFromAudioBuffer(audioBuffer, barCount) {
  const channel = audioBuffer.getChannelData(0);
  if (!channel?.length) {
    return Array.from({ length: barCount }, () => 0.2);
  }

  const blockSize = Math.max(1, Math.floor(channel.length / barCount));
  const peaks = [];

  for (let i = 0; i < barCount; i += 1) {
    const start = i * blockSize;
    let max = 0;
    for (let j = 0; j < blockSize; j += 1) {
      max = Math.max(max, Math.abs(channel[start + j] || 0));
    }
    peaks.push(max);
  }

  const peakMax = Math.max(...peaks, 0.01);
  return peaks.map((peak) => Math.max(0.12, peak / peakMax));
}

export async function generateWaveformPeaksFromBlob(blob, barCount = VOICE_WAVEFORM_BARS) {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioCtx();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    return peaksFromAudioBuffer(audioBuffer, barCount);
  } finally {
    await audioContext.close().catch(() => {});
  }
}

export async function generateWaveformPeaksFromUrl(url, barCount = VOICE_WAVEFORM_BARS) {
  if (!url) {
    return Array.from({ length: barCount }, () => 0.2);
  }

  const cacheKey = `${url}:${barCount}`;
  if (peaksCache.has(cacheKey)) {
    return peaksCache.get(cacheKey);
  }

  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) {
    throw new Error('Failed to load audio');
  }

  const arrayBuffer = await response.arrayBuffer();
  const mime = inferAudioMimeFromUrl(url);
  const blob = new Blob([arrayBuffer], { type: mime });
  const peaks = await generateWaveformPeaksFromBlob(blob, barCount);
  peaksCache.set(cacheKey, peaks);
  return peaks;
}

export function placeholderWaveformLevels(barCount = VOICE_WAVEFORM_BARS) {
  return Array.from({ length: barCount }, (_, index) => {
    const wave = Math.sin((index / barCount) * Math.PI * 3) * 0.35 + 0.45;
    return Math.max(0.15, Math.min(1, wave));
  });
}
