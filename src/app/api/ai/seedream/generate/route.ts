import { NextResponse } from 'next/server';
import { ArkProvider } from '@/extensions/ai/ark';
import { AIMediaType } from '@/extensions/ai';

// Ensure serverless runtime (not edge) and allow longer execution window on platforms like Vercel
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { imageBase64, prompt } = await req.json();

    const approxKb = imageBase64 ? Math.round((imageBase64.length * 3) / 4 / 1024) : 0;
    const maxKb = Number(process.env.ARK_MAX_IMAGE_KB || 6000);

    console.log('[seedream] incoming request', {
      promptLength: prompt?.length ?? 0,
      imageSize: imageBase64 ? imageBase64.length : 0,
      approxKb,
      maxKb,
    });

    if (!imageBase64 || !prompt) {
      return NextResponse.json({ error: 'Missing required fields: imageBase64 and prompt' }, { status: 400 });
    }

    if (approxKb > maxKb) {
      return NextResponse.json(
        { error: `Image too large (~${approxKb}KB). Please upload a smaller image.` },
        { status: 400 }
      );
    }

    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured. Please set ARK_API_KEY.' }, { status: 500 });
    }

    const provider = new ArkProvider({ apiKey });
    const result = await provider.generate({
      params: {
        mediaType: AIMediaType.IMAGE,
        prompt,
        options: { imageBase64, size: process.env.ARK_IMAGE_SIZE || '1920x1920' },
      },
    }).catch((err) => {
      console.error('[seedream] provider.generate error', err);
      const msg = err?.message || 'Server error';
      const forward: any = new Error(msg);
      if (err?.status) forward.status = err.status;
      throw forward;
    });

    const rawUrl = result.taskInfo?.images?.[0]?.imageUrl;
    if (!rawUrl) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    try {
      const imageResp = await fetch(rawUrl);
      if (!imageResp.ok) {
        return NextResponse.json({ status: 'SUCCEEDED', imageUrl: rawUrl });
      }
      const buf = await imageResp.arrayBuffer();
      const base64 = Buffer.from(buf).toString('base64');
      const contentType = imageResp.headers.get('content-type') || 'image/png';
      const dataUrl = `data:${contentType};base64,${base64}`;
      return NextResponse.json({ status: 'SUCCEEDED', imageUrl: dataUrl });
    } catch (err) {
      console.error('[seedream] image fetch failed, fallback to raw url', err);
      return NextResponse.json({ status: 'SUCCEEDED', imageUrl: rawUrl });
    }
  } catch (e: any) {
    console.error('[seedream] route error', e);
    const msg = e?.message || 'Server error';
    const status =
      e?.status ||
      (msg?.toLowerCase?.().includes('timeout') || msg?.toLowerCase?.().includes('abort')
        ? 504
        : msg?.toLowerCase?.().includes('invalid api key')
          ? 401
          : 500);
    return NextResponse.json({ error: msg }, { status });
  }
}
