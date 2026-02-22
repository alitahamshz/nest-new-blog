import 'dotenv/config';
import { AppDataSource } from '../../data-source';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { SellerOffer } from '../entities/seller-offer.entity';
import { Seller } from '../entities/seller.entity';

// ─── داده‌های ۲۰ محصول تستی ─────────────────────────────────────────────────

const PRODUCTS: Array<{
  name: string;
  slug: string;
  description: string;
  sku: string;
  categorySlug: string;
  price: number;
  discountPrice: number;
  discountPercent: number;
  stock: number;
}> = [
  // ─── کالای دیجیتال ───
  {
    name: 'هدفون بلوتوث Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5-headphone',
    description: 'هدفون بی‌سیم با حذف نویز پیشرفته، باتری ۳۰ ساعته و کیفیت صدای Hi-Res Audio.',
    sku: 'SONY-WH-XM5',
    categorySlug: 'digital-products',
    price: 12500000,
    discountPrice: 10900000,
    discountPercent: 13,
    stock: 15,
  },
  {
    name: 'ماوس بی‌سیم Logitech MX Master 3',
    slug: 'logitech-mx-master-3-mouse',
    description: 'ماوس حرفه‌ای بی‌سیم با اسکرول مگنتی و سنسور Darkfield 4000 DPI برای سطوح شیشه‌ای.',
    sku: 'LOG-MX-M3',
    categorySlug: 'digital-products',
    price: 4800000,
    discountPrice: 4200000,
    discountPercent: 13,
    stock: 22,
  },
  {
    name: 'وب‌کم Logitech C920 HD Pro',
    slug: 'logitech-c920-webcam',
    description: 'وب‌کم ۱۰۸۰p با میکروفون دوگانه و کیفیت تصویر فوق‌العاده برای استریم و ویدئوکنفرانس.',
    sku: 'LOG-C920-HD',
    categorySlug: 'digital-products',
    price: 3200000,
    discountPrice: 2750000,
    discountPercent: 14,
    stock: 18,
  },
  {
    name: 'اس‌اس‌دی اکسترنال Samsung T7 500GB',
    slug: 'samsung-t7-ssd-500gb',
    description: 'حافظه اکسترنال قابل‌حمل با سرعت خواندن ۱۰۵۰ MB/s و رابط USB 3.2.',
    sku: 'SAM-T7-500',
    categorySlug: 'digital-products',
    price: 2900000,
    discountPrice: 2600000,
    discountPercent: 10,
    stock: 30,
  },
  {
    name: 'مانیتور LG 27 اینچ 4K UltraFine',
    slug: 'lg-27-4k-ultrafine-monitor',
    description: 'مانیتور ۲۷ اینچی با رزولوشن ۴K، پنل IPS و پوشش رنگی ۹۹٪ sRGB برای طراحان.',
    sku: 'LG-27-4K',
    categorySlug: 'digital-products',
    price: 28000000,
    discountPrice: 25500000,
    discountPercent: 9,
    stock: 8,
  },

  // ─── کیبورد ───
  {
    name: 'کیبورد مکانیکی Keychron K2 Pro',
    slug: 'keychron-k2-pro-keyboard',
    description: 'کیبورد مکانیکی ۷۵٪ با سوئیچ Gateron و پشتیبانی از Mac/Windows و بلوتوث ۵.۱.',
    sku: 'KEY-K2-PRO',
    categorySlug: 'keyborad',
    price: 5600000,
    discountPrice: 4900000,
    discountPercent: 13,
    stock: 12,
  },
  {
    name: 'کیبورد مکانیکی HyperX Alloy FPS Pro',
    slug: 'hyperx-alloy-fps-pro-keyboard',
    description: 'کیبورد مکانیکی Tenkeyless با سوئیچ Cherry MX Red و نور RGB.',
    sku: 'HX-ALLOY-FPS',
    categorySlug: 'keyborad',
    price: 4100000,
    discountPrice: 3700000,
    discountPercent: 10,
    stock: 20,
  },
  {
    name: 'کیبورد Corsair K65 RGB Mini',
    slug: 'corsair-k65-rgb-mini-keyboard',
    description: 'کیبورد فشرده ۶۰٪ با نور RGB و سوئیچ Cherry MX Speed Silver برای گیمرها.',
    sku: 'COR-K65-MINI',
    categorySlug: 'keyborad',
    price: 4750000,
    discountPrice: 0,
    discountPercent: 0,
    stock: 14,
  },

  // ─── کیبورد گیمینگ ───
  {
    name: 'کیبورد گیمینگ Razer BlackWidow V4 Pro',
    slug: 'razer-blackwidow-v4-pro',
    description: 'کیبورد گیمینگ با سوئیچ Razer Yellow، رول‌باز RGB Chroma و صفحه‌کلید ماکرو.',
    sku: 'RZR-BWV4-PRO',
    categorySlug: 'gaming-keyboard',
    price: 9800000,
    discountPrice: 8500000,
    discountPercent: 13,
    stock: 6,
  },
  {
    name: 'کیبورد گیمینگ SteelSeries Apex Pro',
    slug: 'steelseries-apex-pro-keyboard',
    description: 'اولین کیبورد با سوئیچ‌های قابل تنظیم OmniPoint 2.0 با واکنش ۰.۱ میلی‌ثانیه.',
    sku: 'SS-APEX-PRO',
    categorySlug: 'gaming-keyboard',
    price: 11500000,
    discountPrice: 10200000,
    discountPercent: 11,
    stock: 5,
  },
  {
    name: 'کیبورد گیمینگ ASUS ROG Strix Scope RX',
    slug: 'asus-rog-strix-scope-rx',
    description: 'کیبورد گیمینگ با سوئیچ اپتیکال ROG RX Red و طراحی ضدآب IPX4.',
    sku: 'ASUS-ROG-RX',
    categorySlug: 'gaming-keyboard',
    price: 7200000,
    discountPrice: 6400000,
    discountPercent: 11,
    stock: 10,
  },

  // ─── کیبورد بیسیم ───
  {
    name: 'کیبورد بیسیم Apple Magic Keyboard',
    slug: 'apple-magic-keyboard-farsi',
    description: 'کیبورد بی‌سیم اپل با چیدمان فارسی/انگلیسی و شارژ Lightning و Touch ID.',
    sku: 'APL-MAGIC-KB',
    categorySlug: 'wireless-keyboard',
    price: 8900000,
    discountPrice: 7800000,
    discountPercent: 12,
    stock: 9,
  },
  {
    name: 'کیبورد بیسیم Logitech MX Keys Mini',
    slug: 'logitech-mx-keys-mini',
    description: 'کیبورد فشرده بی‌سیم با روشنایی تطبیقی، Easy-Switch برای سه دستگاه و باتری ۱۰ روزه.',
    sku: 'LOG-MX-MINI',
    categorySlug: 'wireless-keyboard',
    price: 5200000,
    discountPrice: 4600000,
    discountPercent: 12,
    stock: 16,
  },
  {
    name: 'کیبورد بیسیم Microsoft Ergonomic',
    slug: 'microsoft-wireless-ergonomic-keyboard',
    description: 'کیبورد ارگونومیک بی‌سیم با طراحی منحنی برای کاهش فشار مچ دست و باتری ۳۶ ماهه.',
    sku: 'MS-ERGO-KB',
    categorySlug: 'wireless-keyboard',
    price: 3400000,
    discountPrice: 3000000,
    discountPercent: 12,
    stock: 25,
  },

  // ─── کتاب و هنر ───
  {
    name: 'کتاب «هنر ظریف بی‌خیالی» مارک مانسون',
    slug: 'book-subtle-art-not-giving',
    description: 'ترجمه فارسی پرفروش‌ترین کتاب خودیاری جهان درباره زندگی‌ بهتر با معیارهای صادقانه.',
    sku: 'BK-SBT-ART',
    categorySlug: 'book-art',
    price: 185000,
    discountPrice: 0,
    discountPercent: 0,
    stock: 50,
  },
  {
    name: 'جعبه رنگ روغن Maries ۱۲ رنگ',
    slug: 'maries-oil-paint-12-colors',
    description: 'ست رنگ روغن حرفه‌ای ۱۲ رنگ برند Marie\'s با کیفیت آرتیستی و پیگمنت غنی.',
    sku: 'ART-MARIES-12',
    categorySlug: 'book-art',
    price: 420000,
    discountPrice: 380000,
    discountPercent: 10,
    stock: 35,
  },
  {
    name: 'دفتر اسکچ Moleskine A4 - ۱۰۰ برگ',
    slug: 'moleskine-sketchbook-a4',
    description: 'دفتر طراحی A4 برند Moleskine با کاغذ ۱۶۵ گرمی مناسب مداد، ذغال، مارکر و آبرنگ.',
    sku: 'ART-MOL-A4',
    categorySlug: 'book-art',
    price: 560000,
    discountPrice: 0,
    discountPercent: 0,
    stock: 40,
  },

  // ─── آلات موسیقی / گیتار ───
  {
    name: 'گیتار آکوستیک Yamaha F310',
    slug: 'yamaha-f310-acoustic-guitar',
    description: 'گیتار آکوستیک مناسب مبتدیان با بدنه Spruce و دسته Nato - بهترین گزینه شروع نوازندگی.',
    sku: 'YAM-F310',
    categorySlug: 'guitar',
    price: 4200000,
    discountPrice: 3800000,
    discountPercent: 10,
    stock: 7,
  },
  {
    name: 'گیتار الکتریک Fender Stratocaster Player',
    slug: 'fender-stratocaster-player-electric',
    description: 'گیتار الکتریک سری Player با بدنه آلدر، پیکاپ Single-Coil و فینگربورد پائولو Ferro.',
    sku: 'FEN-STRAT-PLY',
    categorySlug: 'guitar',
    price: 32000000,
    discountPrice: 28500000,
    discountPercent: 11,
    stock: 3,
  },
  {
    name: 'کیف گیتار Semi-Hard ضدضربه',
    slug: 'guitar-semi-hard-case',
    description: 'کیف نیمه سخت برای گیتار آکوستیک و کلاسیک با لایه داخلی محافظ و یراق‌آلات فلزی.',
    sku: 'GIT-CASE-SH',
    categorySlug: 'guitar',
    price: 850000,
    discountPrice: 720000,
    discountPercent: 15,
    stock: 20,
  },
  {
    name: 'تیونر کروماتیک Korg CA-50',
    slug: 'korg-ca-50-chromatic-tuner',
    description: 'تیونر دیجیتال کروماتیک برند Korg با نمایشگر LCD و سنسور صدای دقیق برای همه سازها.',
    sku: 'KORG-CA50',
    categorySlug: 'music-instruments',
    price: 480000,
    discountPrice: 420000,
    discountPercent: 13,
    stock: 45,
  },
];

// ─── اجرای seed ─────────────────────────────────────────────────────────────

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const productRepo = AppDataSource.getRepository(Product);
  const categoryRepo = AppDataSource.getRepository(ProductCategory);
  const offerRepo = AppDataSource.getRepository(SellerOffer);
  const sellerRepo = AppDataSource.getRepository(Seller);

  // دریافت فروشنده اول
  const seller = await sellerRepo.findOne({ where: { id: 1 } });
  if (!seller) {
    console.error('❌ Seller with id=1 not found!');
    process.exit(1);
  }
  console.log(`👤 Using seller: ${seller.businessName}`);

  // cache دسته‌بندی‌ها
  const allCategories = await categoryRepo.find();
  const catMap = new Map(allCategories.map((c) => [c.slug, c]));

  let created = 0;
  let skipped = 0;

  for (const pd of PRODUCTS) {
    // skip اگر قبلاً ثبت شده
    const exists = await productRepo.findOne({ where: { slug: pd.slug } });
    if (exists) {
      console.log(`⏭  Skipped (exists): ${pd.name}`);
      skipped++;
      continue;
    }

    const category = catMap.get(pd.categorySlug);
    if (!category) {
      console.warn(`⚠️  Category not found: ${pd.categorySlug} → skipping ${pd.name}`);
      skipped++;
      continue;
    }

    // ساخت محصول
    const product = productRepo.create({
      name: pd.name,
      slug: pd.slug,
      description: pd.description,
      sku: pd.sku,
      hasVariant: false,
      isActive: true,
      category,
    });
    const savedProduct = await productRepo.save(product);

    // ساخت offer فروشنده
    const offerData: Partial<SellerOffer> = {
      seller,
      product: savedProduct,
      price: pd.price,
      discountPrice: pd.discountPrice > 0 ? pd.discountPrice : pd.price,
      discountPercent: pd.discountPercent,
      stock: pd.stock,
      minOrder: 1,
      maxOrder: pd.stock,
      hasWarranty: false,
      isDefault: true,
    };
    const offer = offerRepo.create(offerData as SellerOffer);
    await offerRepo.save(offer);

    console.log(`✅ Created: ${pd.name}  |  قیمت: ${pd.price.toLocaleString('fa-IR')} تومان  |  موجودی: ${pd.stock}`);
    created++;
  }

  console.log(`\n🎉 Done! Created: ${created}  |  Skipped: ${skipped}`);
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e.message);
  process.exit(1);
});
