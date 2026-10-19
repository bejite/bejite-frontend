import { VOICE_WAVEFORM_BARS, placeholderWaveformLevels } from '../../utils/voiceWaveform';

function VoiceWaveform({
  levels,
  progress = 0,
  isOwnMessage = false,
  barCount = VOICE_WAVEFORM_BARS,
  className = '',
}) {
  const bars = levels?.length ? levels : placeholderWaveformLevels(barCount);
  const playedBars = Math.floor(progress * bars.length);

  return (
    <div
      className={`flex h-8 flex-1 min-w-0 items-center gap-[2px] ${className}`}
      aria-hidden="true"
    >
      {bars.map((level, index) => {
        const height = Math.max(18, Math.min(100, level * 100));
        const isPlayed = index < playedBars;

        return (
          <span
            key={index}
            className={`w-[3px] shrink-0 rounded-full transition-[height,background-color] duration-75 ${
              isOwnMessage
                ? isPlayed
                  ? 'bg-white'
                  : 'bg-white/35'
                : isPlayed
                  ? 'bg-[#1A3E32]'
                  : 'bg-[#1A3E32]/30'
            }`}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}

export default VoiceWaveform;
