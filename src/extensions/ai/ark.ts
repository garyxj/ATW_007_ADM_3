import { AIConfigs, AIGenerateParams, AIMediaType, AIProvider, AITaskResult, AITaskStatus, AIImage } from '.';

export interface ArkConfigs extends AIConfigs {
  apiKey: string;
}

export class ArkProvider implements AIProvider {
  readonly name = 'ark-seedream';
  configs: ArkConfigs;
  private baseUrl = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

  constructor(configs: ArkConfigs) {
    this.configs = configs;
  }

  async generate({ params }: { params: AIGenerateParams }): Promise<AITaskResult> {
    if (params.mediaType !== AIMediaType.IMAGE) {
      throw new Error(`mediaType not supported: ${params.mediaType}`);
    }
    // lower the minimum pixel area to reduce payload size and speed up upstream processing
    const minPixels = 1048576; // ~1024x1024
    const parse = (s: string) => {
      const m = s.match(/^(\d+)x(\d+)$/);
      if (!m) return undefined;
      const w = Number(m[1]);
      const h = Number(m[2]);
      if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return undefined;
      return { w, h };
    };
    const format = (w: number, h: number) => `${Math.max(1, Math.round(w))}x${Math.max(1, Math.round(h))}`;
    const normalize = (s: string) => {
      const p = parse(s);
      if (!p) return '1920x1920';
      const area = p.w * p.h;
      if (area >= minPixels) return format(p.w, p.h);
      const scale = Math.sqrt(minPixels / area);
      return format(p.w * scale, p.h * scale);
    };
    // default smaller size to further reduce payload/latency; env can override
    const requestedSize = params.options?.size || process.env.ARK_IMAGE_SIZE || '1536x1536';
    const defaultSize = normalize(requestedSize);
    const timeoutMs = Number(process.env.ARK_REQUEST_TIMEOUT_MS || 40000);

    const call = async (size: string) => {
      const body = {
        model: params.model || 'doubao-seedream-4-5-251128',
        prompt: params.prompt,
        image: params.options?.imageBase64,
        size,
        watermark: false,
      };
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        console.log('[ArkProvider] request', {
          size,
          promptLength: (params.prompt || '').length,
          timeoutMs,
        });
        const resp = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.configs.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timer);
        const text = await resp.text();
        console.log('[ArkProvider] response', { status: resp.status, ok: resp.ok });
        return { resp, text };
      } catch (err: any) {
        clearTimeout(timer);
        if (err?.name === 'AbortError') {
          throw new Error(`Ark request aborted (timeout ${timeoutMs}ms). 考虑减小图片尺寸或提升 ARK_REQUEST_TIMEOUT_MS。`);
        }
        throw err;
      }
    };

    const first = await call(defaultSize);
    let text = first.text;
    if (!first.resp.ok) {
      const status = first.resp.status;
      // fallback to a still-reasonable size, smaller than default to avoid repeated timeouts
      const fallbackSize = normalize('1280x1280');
      if (status >= 500 || status === 504) {
        const second = await call(fallbackSize);
        text = second.text;
        if (!second.resp.ok) {
          let err: any;
          try { err = JSON.parse(text); } catch { err = { message: text }; }
          throw new Error(err?.message || err?.error?.message || `Failed: ${second.resp.status}`);
        }
      } else {
        let err: any;
        try { err = JSON.parse(text); } catch { err = { message: text }; }
        throw new Error(err?.message || err?.error?.message || `Failed: ${status}`);
      }
    }

    const data = JSON.parse(text);
    let images: AIImage[] | undefined;
    let imageUrl: string | undefined;
    if (data?.data && data?.data[0]?.url) {
      const url: string = data.data[0].url;
      imageUrl = url;
      images = [{ imageUrl: url, createTime: new Date() }];
    }

    return {
      taskStatus: imageUrl ? AITaskStatus.SUCCESS : AITaskStatus.FAILED,
      taskId: `seedream-${Date.now()}`,
      taskInfo: { images },
      taskResult: data,
    };
  }
}
