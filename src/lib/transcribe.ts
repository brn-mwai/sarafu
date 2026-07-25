const WHISPER_ENDPOINT =
  'https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3';

export interface Transcription {
  text: string;
  ok: boolean;
  reason?: string;
}

export async function transcribeVoice(audio: Buffer): Promise<Transcription> {
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    return {
      ok: false,
      text: '',
      reason: 'Voice notes are not wired up yet. Type it instead and I will record it.',
    };
  }

  const res = await fetch(WHISPER_ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${hfToken}`,
      'content-type': 'audio/ogg',
    },
    body: new Uint8Array(audio),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    if (res.status === 503) {
      return {
        ok: false,
        text: '',
        reason: 'The voice model is warming up. Send that again in about twenty seconds.',
      };
    }
    return {
      ok: false,
      text: '',
      reason: `Could not read that voice note (${res.status}). ${detail.slice(0, 120)}`,
    };
  }

  const body = await res.json().catch(() => null);
  const text: string = body?.text ?? '';

  if (!text.trim()) {
    return { ok: false, text: '', reason: 'That voice note came through empty. Try again.' };
  }

  return { ok: true, text: text.trim() };
}
