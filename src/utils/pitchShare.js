export function getPitchShareUrl(pitchId) {
  return `${window.location.origin}/v/${encodeURIComponent(pitchId)}`;
}
