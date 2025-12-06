import { NextResponse } from 'next/server';
import { ArkProvider } from '@/extensions/ai/ark';
import { AIMediaType } from '@/extensions/ai';

export async function POST(req: Request) {
  try {
    const { imageBase64, prompt } = await req.json();
    if (!imageBase64 || !prompt) {
      return NextResponse.json({ error: 'Missing required fields: imageBase64 and prompt' }, { status: 400 });
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
        options: { imageBase64, size: process.env.ARK_IMAGE_SIZE || '1024x1024' },
      },
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
    } catch {
      return NextResponse.json({ status: 'SUCCEEDED', imageUrl: rawUrl });
    }
  } catch (e: any) {
    const msg = e?.message || 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
