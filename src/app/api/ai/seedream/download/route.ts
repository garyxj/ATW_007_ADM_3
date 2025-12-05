import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }
    const resp = await fetch(imageUrl);
    if (!resp.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }
    const buf = await resp.arrayBuffer();
    const base64 = Buffer.from(buf).toString('base64');
    const contentType = resp.headers.get('content-type') || 'image/jpeg';
    return NextResponse.json({ dataUrl: `data:${contentType};base64,${base64}` });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to proxy image download' }, { status: 500 });
  }
}

