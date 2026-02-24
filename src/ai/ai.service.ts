import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GeneratePostDto, PostTone } from './dto/generate-post.dto';

const TONE_MAP: Record<PostTone, string> = {
  [PostTone.FORMAL]: 'رسمی و حرفه‌ای',
  [PostTone.INFORMAL]: 'صمیمی و محاوره‌ای',
  [PostTone.EDUCATIONAL]: 'آموزشی و ساده',
  [PostTone.PERSUASIVE]: 'ترغیبی و بازاریابی',
};

@Injectable()
export class AiService {
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: this.config.get<string>('GITHUB_TOKEN'),
    });
  }

  async generatePost(dto: GeneratePostDto): Promise<{
    title: string;
    seo_title: string;
    meta_description: string;
    excerpt: string;
    content: string;
  }> {
    const tone = dto.tone ?? PostTone.EDUCATIONAL;
    const keywords = dto.keywords?.length ? dto.keywords.join('، ') : '';
    const extra = dto.extraContext
      ? `\nاطلاعات اضافه: ${dto.extraContext}`
      : '';

    const systemPrompt = `تو یک نویسنده متخصص محتوا فارسی برای وبلاگ آرایشی و بهداشتی هستی.
محتوا را به فارسی روان و استاندارد بنویس.
خروجی را فقط به صورت JSON با فیلدهای زیر برگردان (بدون هیچ توضیح اضافه‌ای):
{
  "title": "عنوان جذاب مقاله",
  "seo_title": "عنوان بهینه‌شده برای سئو",
  "meta_description": "توضیح متا 140-160 کاراکتر",
  "excerpt": "خلاصه 2-3 جمله‌ای مقاله",
  "content": "محتوای کامل مقاله به فرمت HTML با تگ‌های h2، h3، p، ul، li"
}`;

    const userPrompt = `موضوع مقاله: ${dto.topic}
لحن نوشتار: ${TONE_MAP[tone]}${keywords ? `\nکلیدواژه‌ها: ${keywords}` : ''}${extra}

یک مقاله کامل و جامع بنویس که شامل:
- مقدمه جذاب
- بدنه با حداقل 4 بخش مجزا (هر بخش با تیتر h2)
- نکات عملی و کاربردی
- جمع‌بندی
باشد. طول محتوا حداقل 1200 کلمه.`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const raw = response.choices[0]?.message?.content ?? '{}';

      let parsed: {
        title?: string;
        seo_title?: string;
        meta_description?: string;
        excerpt?: string;
        content?: string;
      };

      try {
        parsed = JSON.parse(raw) as typeof parsed;
      } catch {
        throw new InternalServerErrorException(
          'خروجی هوش مصنوعی قابل پردازش نیست',
        );
      }

      return {
        title: parsed.title ?? dto.topic,
        seo_title: parsed.seo_title ?? dto.topic,
        meta_description: parsed.meta_description ?? '',
        excerpt: parsed.excerpt ?? '',
        content: parsed.content ?? '',
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'خطا در اتصال به سرویس هوش مصنوعی';
      throw new InternalServerErrorException(message);
    }
  }
}
