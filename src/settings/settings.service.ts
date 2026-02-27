import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Setting, SettingGroup } from '../entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { BulkUpdateSettingsDto } from './dto/bulk-update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
  ) {}

  /* ───── Public ───── */

  /** دریافت تمام تنظیمات عمومی (بدون نیاز به احراز هویت) */
  async findPublic(): Promise<Setting[]> {
    return await this.settingsRepository.find({
      where: { isPublic: true },
      order: { group: 'ASC', order: 'ASC' },
    });
  }

  /** دریافت تنظیمات عمومی بر اساس گروه */
  async findPublicByGroup(group: SettingGroup): Promise<Setting[]> {
    return await this.settingsRepository.find({
      where: { isPublic: true, group },
      order: { order: 'ASC' },
    });
  }

  /** دریافت مقدار یک تنظیم عمومی با کلید */
  async findPublicByKey(key: string): Promise<Setting> {
    const setting = await this.settingsRepository.findOne({
      where: { key, isPublic: true },
    });
    if (!setting) {
      throw new NotFoundException(`تنظیم با کلید "${key}" یافت نشد`);
    }
    return setting;
  }

  /* ───── Admin ───── */

  /** دریافت تمام تنظیمات */
  async findAll(group?: SettingGroup): Promise<Setting[]> {
    const where = group ? { group } : {};
    return await this.settingsRepository.find({
      where,
      order: { group: 'ASC', order: 'ASC' },
    });
  }

  /** دریافت یک تنظیم با آیدی */
  async findOne(id: number): Promise<Setting> {
    const setting = await this.settingsRepository.findOne({ where: { id } });
    if (!setting) {
      throw new NotFoundException(`تنظیم با شناسه ${id} یافت نشد`);
    }
    return setting;
  }

  /** دریافت مقدار یک تنظیم با کلید */
  async findByKey(key: string): Promise<Setting> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`تنظیم با کلید "${key}" یافت نشد`);
    }
    return setting;
  }

  /** ایجاد تنظیم جدید */
  async create(dto: CreateSettingDto): Promise<Setting> {
    const exists = await this.settingsRepository.findOne({
      where: { key: dto.key },
    });
    if (exists) {
      throw new ConflictException(`تنظیم با کلید "${dto.key}" قبلاً وجود دارد`);
    }
    const setting = this.settingsRepository.create(dto);
    return await this.settingsRepository.save(setting);
  }

  /** بروزرسانی یک تنظیم */
  async update(id: number, dto: UpdateSettingDto): Promise<Setting> {
    const setting = await this.findOne(id);
    Object.assign(setting, dto);
    return await this.settingsRepository.save(setting);
  }

  /** بروزرسانی مقدار یک تنظیم با کلید */
  async updateByKey(key: string, value: string): Promise<Setting> {
    const setting = await this.findByKey(key);
    setting.value = value;
    return await this.settingsRepository.save(setting);
  }

  /** بروزرسانی گروهی تنظیمات */
  async bulkUpdate(dto: BulkUpdateSettingsDto): Promise<Setting[]> {
    const keys = dto.settings.map((s) => s.key);
    const settings = await this.settingsRepository.find({
      where: { key: In(keys) },
    });

    const settingMap = new Map(settings.map((s) => [s.key, s]));
    const updatedSettings: Setting[] = [];

    for (const item of dto.settings) {
      const setting = settingMap.get(item.key);
      if (setting) {
        setting.value = item.value;
        updatedSettings.push(setting);
      }
    }

    return await this.settingsRepository.save(updatedSettings);
  }

  /** حذف یک تنظیم */
  async remove(id: number): Promise<void> {
    const setting = await this.findOne(id);
    await this.settingsRepository.remove(setting);
  }

  /* ───── Helper (for internal use by other services) ───── */

  /** دریافت مقدار خام تنظیم — بدون throw */
  async getValue(key: string): Promise<string | null> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    return setting?.value ?? null;
  }

  /** دریافت مقدار بولین تنظیم */
  async getBooleanValue(key: string): Promise<boolean> {
    const value = await this.getValue(key);
    return value === 'true';
  }

  /** دریافت مقدار عددی تنظیم */
  async getNumberValue(key: string): Promise<number | null> {
    const value = await this.getValue(key);
    return value !== null ? Number(value) : null;
  }

  /** دریافت مقدار JSON تنظیم */
  async getJsonValue<T = any>(key: string): Promise<T | null> {
    const value = await this.getValue(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
}
