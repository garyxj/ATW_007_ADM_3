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
    const defaultSize = params.options?.size || process.env.ARK_IMAGE_SIZE || '1024x1024';
    const timeoutMs = Number(process.env.ARK_REQUEST_TIMEOUT_MS || 20000);

    async function call(size: string) {
      const body = {
        model: params.model || 'doubao-seedream-4-5-251128',
        prompt: params.prompt,
        image: params.options?.imageBase64,
        size,
        watermark: false,
      };
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
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
      return { resp, text };
    }

    const first = await call.call(this, defaultSize);
    let text = first.text;
    if (!first.resp.ok) {
      const status = first.resp.status;
      const fallbackSize = defaultSize === '1024x1024' ? '768x768' : defaultSize;
      if (status >= 500 || status === 504) {
        const second = await call.call(this, fallbackSize);
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
