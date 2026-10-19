import {
  getAttachmentType,
  isCloudinaryRawAudioUrl,
  isVoiceMessageCaption,
  resolveVoicePlaybackUrl,
} from '../src/utils/chatAttachmentUtils.js';

const sampleUrl =
  'https://res.cloudinary.com/dlanp22f4/raw/upload/v1783454339/chat_media/lppexwj8xp8rqscj7ewm.webm';

let failed = 0;

function check(label, condition) {
  if (!condition) {
    failed += 1;
    console.error(`FAIL ${label}`);
    return;
  }
  console.log(`PASS ${label}`);
}

check('voice caption detected', isVoiceMessageCaption('🎤 Voice message') === true);
check('raw cloudinary url detected', isCloudinaryRawAudioUrl(sampleUrl) === true);
check(
  'attachment type is audio',
  getAttachmentType(sampleUrl) === 'audio'
);

const resolved = await resolveVoicePlaybackUrl(sampleUrl);
check('blob playback url created', resolved.startsWith('blob:'));
if (resolved.startsWith('blob:')) {
  URL.revokeObjectURL(resolved);
}

process.exit(failed > 0 ? 1 : 0);
