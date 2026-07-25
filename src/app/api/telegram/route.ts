import { NextRequest, NextResponse } from 'next/server';
import { runAgent, type Attachment } from '@/lib/agent';
import { downloadFile, mediaTypeFor, sendMessage, sendChatAction } from '@/lib/telegram';
import { transcribeVoice } from '@/lib/transcribe';

export const maxDuration = 60;

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

interface Incoming {
  text: string;
  attachment?: Attachment;
  failure?: string;
}

async function readIncoming(message: any): Promise<Incoming> {
  const caption: string = message.caption ?? '';

  if (message.voice || message.audio) {
    const fileId = (message.voice ?? message.audio).file_id;
    const { bytes } = await downloadFile(fileId);
    const result = await transcribeVoice(bytes);
    if (!result.ok) return { text: '', failure: result.reason };
    return { text: result.text };
  }

  if (message.photo?.length) {
    const largest = message.photo[message.photo.length - 1];
    const { bytes, path } = await downloadFile(largest.file_id);
    if (bytes.length > MAX_ATTACHMENT_BYTES) {
      return { text: '', failure: 'That image is too large. Send a smaller photo.' };
    }
    return {
      text: caption || 'I sent you a photo. Read it and file it.',
      attachment: {
        kind: 'image',
        mediaType: mediaTypeFor(path) === 'application/octet-stream' ? 'image/jpeg' : mediaTypeFor(path),
        base64: bytes.toString('base64'),
        telegramFileId: largest.file_id,
      },
    };
  }

  if (message.document) {
    const { bytes, path } = await downloadFile(message.document.file_id);
    if (bytes.length > MAX_ATTACHMENT_BYTES) {
      return { text: '', failure: 'That file is too large. Send a smaller one.' };
    }
    const mediaType = mediaTypeFor(path);

    if (mediaType === 'application/pdf') {
      return {
        text: caption || 'I sent you a PDF. Read it and file it.',
        attachment: {
          kind: 'pdf',
          mediaType,
          base64: bytes.toString('base64'),
          telegramFileId: message.document.file_id,
        },
      };
    }

    if (mediaType.startsWith('image/')) {
      return {
        text: caption || 'I sent you a document. Read it and file it.',
        attachment: {
          kind: 'image',
          mediaType,
          base64: bytes.toString('base64'),
          telegramFileId: message.document.file_id,
        },
      };
    }

    if (bytes.length < 200_000) {
      return { text: `${caption}\n\n${bytes.toString('utf8').slice(0, 40_000)}`.trim() };
    }

    return { text: '', failure: 'I can read photos, PDFs and text. That file type I cannot.' };
  }

  return { text: message.text ?? '' };
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await req.json();
  const message = update?.message;
  const chatId = message?.chat?.id;
  if (!chatId) return NextResponse.json({ ok: true });

  await sendChatAction(chatId, 'typing');

  try {
    const incoming = await readIncoming(message);

    if (incoming.failure) {
      await sendMessage(chatId, incoming.failure);
      return NextResponse.json({ ok: true });
    }
    if (!incoming.text.trim() && !incoming.attachment) {
      return NextResponse.json({ ok: true });
    }

    const reply = await runAgent(String(chatId), incoming.text, incoming.attachment);
    await sendMessage(chatId, reply);
  } catch (err) {
    console.error('[sarafu] update failed', err);
    await sendMessage(chatId, 'Something broke on my side. Send that again in a moment.');
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ service: 'sarafu-telegram-webhook', ok: true });
}
