import 'dotenv/config';
import { AppDataSource } from '../../data-source';
import { Setting } from '../entities/setting.entity';

async function run() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Setting);
  const r = await repo.delete({ key: 'shop.best_sellers.product_ids' });
  console.log('Deleted best_sellers.product_ids:', r.affected, 'row(s)');
  await AppDataSource.destroy();
}

run();
