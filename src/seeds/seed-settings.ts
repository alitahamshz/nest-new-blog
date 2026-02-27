import 'dotenv/config';
import { AppDataSource } from '../../data-source';
import { Setting, SettingType, SettingGroup } from '../entities/setting.entity';

/**
 * تنظیمات پیش‌فرض سایت
 * هر بار اجرا فقط تنظیماتی که وجود ندارند اضافه می‌شوند
 */
const defaultSettings: Partial<Setting>[] = [
  /* ─── عمومی (General) ─── */
  {
    key: 'site.title',
    value: 'فروشگاه زیبایی',
    type: SettingType.STRING,
    group: SettingGroup.GENERAL,
    label: 'نام سایت',
    description: 'نام اصلی سایت که در عنوان صفحات نمایش داده می‌شود',
    order: 1,
    isPublic: true,
  },
  {
    key: 'site.description',
    value: 'فروشگاه آنلاین محصولات زیبایی و بهداشتی',
    type: SettingType.TEXT,
    group: SettingGroup.GENERAL,
    label: 'توضیحات سایت',
    description: 'توضیحات کوتاه درباره سایت',
    order: 2,
    isPublic: true,
  },
  {
    key: 'site.logo',
    value: '',
    type: SettingType.IMAGE,
    group: SettingGroup.GENERAL,
    label: 'لوگوی سایت',
    description: 'آدرس تصویر لوگوی سایت',
    order: 3,
    isPublic: true,
  },
  {
    key: 'site.favicon',
    value: '',
    type: SettingType.IMAGE,
    group: SettingGroup.GENERAL,
    label: 'فاوآیکون سایت',
    description: 'آیکون کوچک سایت در تب مرورگر',
    order: 4,
    isPublic: true,
  },
  {
    key: 'site.contact_phone',
    value: '',
    type: SettingType.STRING,
    group: SettingGroup.GENERAL,
    label: 'شماره تماس',
    description: 'شماره تماس پشتیبانی سایت',
    order: 5,
    isPublic: true,
  },
  {
    key: 'site.contact_email',
    value: '',
    type: SettingType.STRING,
    group: SettingGroup.GENERAL,
    label: 'ایمیل تماس',
    description: 'آدرس ایمیل پشتیبانی سایت',
    order: 6,
    isPublic: true,
  },

  /* ─── تم (Theme) ─── */
  {
    key: 'theme.color',
    value: 'blossom',
    type: SettingType.SELECT,
    group: SettingGroup.THEME,
    label: 'تم رنگی سایت',
    description: 'رنگ اصلی تم سایت',
    options: {
      choices: [
        { value: 'blossom', label: 'شکوفه‌ای (Blossom)' },
        { value: 'sage', label: 'سبز مریم‌گلی (Sage)' },
        { value: 'coral', label: 'مرجانی (Coral)' },
        { value: 'lavender', label: 'اسطوخودوس (Lavender)' },
        { value: 'mint', label: 'نعنایی (Mint)' },
        { value: 'ocean', label: 'اقیانوسی (Ocean)' },
      ],
    },
    order: 1,
    isPublic: true,
  },
  {
    key: 'theme.dark_mode',
    value: 'false',
    type: SettingType.BOOLEAN,
    group: SettingGroup.THEME,
    label: 'حالت تاریک',
    description: 'فعال یا غیرفعال کردن حالت تاریک پیش‌فرض',
    order: 2,
    isPublic: true,
  },
  {
    key: 'theme.font_family',
    value: 'YekanBakh',
    type: SettingType.SELECT,
    group: SettingGroup.THEME,
    label: 'فونت سایت',
    description: 'فونت اصلی متن‌های سایت',
    options: {
      choices: [
        { value: 'YekanBakh', label: 'یکان بخ' },
        { value: 'Vazirmatn', label: 'وزیر متن' },
        { value: 'IRANSans', label: 'ایران سنس' },
      ],
    },
    order: 3,
    isPublic: true,
  },

  /* ─── هوش مصنوعی (AI) ─── */
  {
    key: 'ai.github_token',
    value: '',
    type: SettingType.STRING,
    group: SettingGroup.AI,
    label: 'کلید API گیت‌هاب',
    description:
      'توکن دسترسی GitHub برای تولید مقاله با هوش مصنوعی — این مقدار در env بازنویسی می‌شود اگر خالی باشد',
    order: 1,
    isPublic: false,
  },
  {
    key: 'ai.model',
    value: 'gpt-4o-mini',
    type: SettingType.SELECT,
    group: SettingGroup.AI,
    label: 'مدل هوش مصنوعی',
    description: 'مدل مورد استفاده برای تولید محتوا',
    options: {
      choices: [
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
        { value: 'gpt-4.1', label: 'GPT-4.1' },
      ],
    },
    order: 2,
    isPublic: false,
  },
  {
    key: 'ai.auto_generate',
    value: 'false',
    type: SettingType.BOOLEAN,
    group: SettingGroup.AI,
    label: 'تولید خودکار مقاله',
    description: 'فعال‌سازی تولید خودکار مقاله در بازه‌های زمانی مشخص',
    order: 3,
    isPublic: false,
  },

  /* ─── صفحه اصلی فروشگاه (Shop Homepage) ─── */
  {
    key: 'shop.amazing_banners.enabled',
    value: 'true',
    type: SettingType.BOOLEAN,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'بنرهای تبلیغاتی',
    description: 'نمایش یا مخفی کردن بخش ۴ بنر تبلیغاتی کوچک',
    order: 0,
    isPublic: true,
  },
  {
    key: 'shop.flash_sale.enabled',
    value: 'true',
    type: SettingType.BOOLEAN,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'فروش فوق‌العاده',
    description: 'نمایش یا مخفی کردن بخش فروش فوق‌العاده',
    order: 1,
    isPublic: true,
  },
  {
    key: 'shop.flash_sale.title',
    value: 'فروش فوق‌العاده',
    type: SettingType.STRING,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'عنوان فروش فوق‌العاده',
    description: 'عنوان نمایشی بخش فروش فوق‌العاده',
    order: 2,
    isPublic: true,
  },
  {
    key: 'shop.flash_sale.end_date',
    value: '',
    type: SettingType.STRING,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'تاریخ پایان فروش فوق‌العاده',
    description: 'تاریخ و ساعت پایان (ISO format) برای تایمر شمارش معکوس',
    order: 3,
    isPublic: true,
  },
  {
    key: 'shop.flash_sale.category_id',
    value: '',
    type: SettingType.STRING,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'دسته‌بندی فروش فوق‌العاده',
    description: 'شناسه دسته‌بندی محصولات فروش فوق‌العاده (خالی = همه)',
    order: 4,
    isPublic: true,
  },
  {
    key: 'shop.flash_sale.product_ids',
    value: '[]',
    type: SettingType.JSON,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'محصولات فروش فوق‌العاده',
    description: 'محصولاتی که در بخش فروش فوق‌العاده نمایش داده می‌شوند (خالی = محصولات پیش‌فرض)',
    order: 5,
    isPublic: true,
  },
  {
    key: 'shop.best_sellers.enabled',
    value: 'true',
    type: SettingType.BOOLEAN,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'پرفروش‌ترین‌ها',
    description: 'نمایش یا مخفی کردن بخش پرفروش‌ترین‌ها',
    order: 5,
    isPublic: true,
  },
  {
    key: 'shop.best_sellers.title',
    value: 'پرفروش‌ترین‌ها',
    type: SettingType.STRING,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'عنوان پرفروش‌ترین‌ها',
    description: 'عنوان نمایشی بخش پرفروش‌ترین‌ها',
    order: 6,
    isPublic: true,
  },
  {
    key: 'shop.special_offers.enabled',
    value: 'true',
    type: SettingType.BOOLEAN,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'پیشنهاد ویژه',
    description: 'نمایش یا مخفی کردن بخش پیشنهاد ویژه',
    order: 7,
    isPublic: true,
  },
  {
    key: 'shop.special_offers.title',
    value: 'پیشنهاد ویژه',
    type: SettingType.STRING,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'عنوان پیشنهاد ویژه',
    description: 'عنوان نمایشی بخش پیشنهاد ویژه',
    order: 8,
    isPublic: true,
  },
  {
    key: 'shop.special_offers.product_ids',
    value: '[]',
    type: SettingType.JSON,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'محصولات پیشنهاد ویژه',
    description: 'محصولاتی که در بخش پیشنهاد ویژه نمایش داده می‌شوند (اگر خالی باشد بخش مخفی می‌شود)',
    order: 9,
    isPublic: true,
  },
  {
    key: 'shop.category_browse.enabled',
    value: 'true',
    type: SettingType.BOOLEAN,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'مرور دسته‌بندی‌ها',
    description: 'نمایش یا مخفی کردن بخش مرور دسته‌بندی‌ها',
    order: 7,
    isPublic: true,
  },
  {
    key: 'shop.category_browse.title',
    value: 'دسته‌بندی محصولات',
    type: SettingType.STRING,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'عنوان مرور دسته‌بندی‌ها',
    description: 'عنوان نمایشی بخش مرور دسته‌بندی‌ها',
    order: 8,
    isPublic: true,
  },
  {
    key: 'shop.featured_categories',
    value: '[]',
    type: SettingType.JSON,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'دسته‌بندی‌های ویژه',
    description:
      'لیست شناسه دسته‌بندی‌هایی که در بخش پیشنهاد ویژه نمایش داده شوند (JSON array مثل [1,2,3])',
    order: 9,
    isPublic: true,
  },
  {
    key: 'shop.brands.enabled',
    value: 'true',
    type: SettingType.BOOLEAN,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'برندها',
    description: 'نمایش یا مخفی کردن بخش برندها',
    order: 10,
    isPublic: true,
  },
  {
    key: 'shop.newsletter.enabled',
    value: 'true',
    type: SettingType.BOOLEAN,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'خبرنامه',
    description: 'نمایش یا مخفی کردن بخش عضویت در خبرنامه',
    order: 11,
    isPublic: true,
  },
  {
    key: 'shop.mixed_deals.enabled',
    value: 'true',
    type: SettingType.BOOLEAN,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'پیشنهادات ترکیبی',
    description: 'نمایش یا مخفی کردن بخش پیشنهادات ترکیبی',
    order: 12,
    isPublic: true,
  },
  {
    key: 'shop.trust_badges.enabled',
    value: 'true',
    type: SettingType.BOOLEAN,
    group: SettingGroup.SHOP_HOMEPAGE,
    label: 'نشان‌های اعتماد',
    description: 'نمایش یا مخفی کردن نشان‌های اعتماد (ارسال رایگان، ضمانت و ...)',
    order: 13,
    isPublic: true,
  },

  /* ─── صفحه اصلی بلاگ (Blog Homepage) ─── */
  {
    key: 'blog.featured_posts.enabled',
    value: 'true',
    type: SettingType.BOOLEAN,
    group: SettingGroup.BLOG_HOMEPAGE,
    label: 'مقالات ویژه',
    description: 'نمایش بخش مقالات ویژه در صفحه اصلی بلاگ',
    order: 1,
    isPublic: true,
  },
  {
    key: 'blog.category_sections.enabled',
    value: 'true',
    type: SettingType.BOOLEAN,
    group: SettingGroup.BLOG_HOMEPAGE,
    label: 'بخش‌های دسته‌بندی',
    description: 'نمایش مقالات بر اساس دسته‌بندی در صفحه اصلی',
    order: 2,
    isPublic: true,
  },
  {
    key: 'blog.sidebar.enabled',
    value: 'true',
    type: SettingType.BOOLEAN,
    group: SettingGroup.BLOG_HOMEPAGE,
    label: 'ساید‌بار',
    description: 'نمایش ساید‌بار شامل لیست دسته‌بندی‌ها و بنرها',
    order: 3,
    isPublic: true,
  },
  {
    key: 'blog.posts_per_page',
    value: '10',
    type: SettingType.NUMBER,
    group: SettingGroup.BLOG_HOMEPAGE,
    label: 'تعداد مقاله در هر صفحه',
    description: 'تعداد مقالات نمایشی در هر صفحه لیست مقالات',
    order: 4,
    isPublic: true,
  },

  /* ─── سئو (SEO) ─── */
  {
    key: 'seo.meta_title',
    value: '',
    type: SettingType.STRING,
    group: SettingGroup.SEO,
    label: 'عنوان متا پیش‌فرض',
    description: 'عنوان متای پیش‌فرض برای صفحاتی که عنوان اختصاصی ندارند',
    order: 1,
    isPublic: true,
  },
  {
    key: 'seo.meta_description',
    value: '',
    type: SettingType.TEXT,
    group: SettingGroup.SEO,
    label: 'توضیحات متا پیش‌فرض',
    description: 'توضیحات متای پیش‌فرض سایت',
    order: 2,
    isPublic: true,
  },
  {
    key: 'seo.google_analytics_id',
    value: '',
    type: SettingType.STRING,
    group: SettingGroup.SEO,
    label: 'شناسه Google Analytics',
    description: 'شناسه ردیابی گوگل آنالیتیکس (مثلاً G-XXXXXXXXXX)',
    order: 3,
    isPublic: true,
  },
  {
    key: 'seo.robots_txt',
    value: '',
    type: SettingType.TEXT,
    group: SettingGroup.SEO,
    label: 'محتوای robots.txt',
    description: 'محتوای سفارشی فایل robots.txt',
    order: 4,
    isPublic: false,
  },
];

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('DataSource initialized');

    const settingRepo = AppDataSource.getRepository(Setting);

    for (const settingData of defaultSettings) {
      const exists = await settingRepo.findOne({
        where: { key: settingData.key },
      });
      if (!exists) {
        const setting = settingRepo.create(settingData);
        await settingRepo.save(setting);
        console.log(`✅ Created setting: ${settingData.key}`);
      } else {
        console.log(`⏭️  Setting already exists: ${settingData.key}`);
      }
    }

    console.log('\n🎉 Settings seed completed!');
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
