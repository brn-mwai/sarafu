const TELEGRAM_API = 'https://api.telegram.org';

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  return t;
}

export async function sendMessage(chatId: number | string, text: string) {
  await fetch(`${TELEGRAM_API}/bot${token()}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export async function sendChatAction(chatId: number | string, action: string) {
  await fetch(`${TELEGRAM_API}/bot${token()}/sendChatAction`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action }),
  });
}

export async function downloadFile(fileId: string): Promise<{ bytes: Buffer; path: string }> {
  const meta = await fetch(`${TELEGRAM_API}/bot${token()}/getFile?file_id=${fileId}`).then((r) =>
    r.json(),
  );
  if (!meta?.ok) throw new Error(`getFile failed: ${JSON.stringify(meta)}`);

  const path: string = meta.result.file_path;
  const res = await fetch(`${TELEGRAM_API}/file/bot${token()}/${path}`);
  if (!res.ok) throw new Error(`file download failed: ${res.status}`);

  return { bytes: Buffer.from(await res.arrayBuffer()), path };
}

export function mediaTypeFor(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'pdf') return 'application/pdf';
  return 'application/octet-stream';
}
