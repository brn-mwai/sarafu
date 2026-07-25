import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/agent';

export const maxDuration = 60;

const TELEGRAM_API = 'https://api.telegram.org';

async function sendMessage(chatId: number | string, text: string) {
  await fetch(`${TELEGRAM_API}/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
}

async function sendTyping(chatId: number | string) {
  await fetch(`${TELEGRAM_API}/bot${process.env.TELEGRAM_BOT_TOKEN}/sendChatAction`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  });
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await req.json();
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text: string | undefined = message?.text;

  if (!chatId || !text) return NextResponse.json({ ok: true });

  await sendTyping(chatId);

  try {
    const reply = await runAgent(String(chatId), text);
    await sendMessage(chatId, reply);
  } catch (err) {
    console.error('[sarafu] agent failed', err);
    await sendMessage(chatId, 'Something broke on my side. Send that again in a moment.');
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ service: 'sarafu-telegram-webhook', ok: true });
}
