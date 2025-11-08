import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Seller } from '../src/entities/seller.entity';
import { ProductCategory } from '../src/entities/product-category.entity';
import { Product } from '../src/entities/product.entity';
import { SellerOffer } from '../src/entities/seller-offer.entity';
import { Order } from '../src/entities/order.entity';
import { PaymentMethod } from '../src/entities/order.enums';

describe('Oversell protection (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  // entities we'll create
  let buyer: User;
  let sellerUser: User;
  let seller: Seller;
  let category: ProductCategory;
  let product: Product;
  let offer: SellerOffer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);

    // create minimal data
    const userRepo = dataSource.getRepository(User);
    const sellerRepo = dataSource.getRepository(Seller);
    const categoryRepo = dataSource.getRepository(ProductCategory);
    const productRepo = dataSource.getRepository(Product);
    const offerRepo = dataSource.getRepository(SellerOffer);

    const buyerEntity = new User();
    buyerEntity.email = 'buyer-oversell@test';
    buyerEntity.password = 'hashed';
    buyerEntity.name = 'Buyer';
    buyer = await userRepo.save(buyerEntity);

    const sellerUserEntity = new User();
    sellerUserEntity.email = 'seller-oversell@test';
    sellerUserEntity.password = 'hashed';
    sellerUserEntity.name = 'SellerUser';
    sellerUser = await userRepo.save(sellerUserEntity);

    const sellerEntity = new Seller();
    sellerEntity.user = sellerUser;
    sellerEntity.businessName = 'Test Seller';
    seller = await sellerRepo.save(sellerEntity);

    const categoryEntity = new ProductCategory();
    categoryEntity.name = 'Test Cat';
    categoryEntity.slug = 'test-cat';
    category = await categoryRepo.save(categoryEntity);

    const productEntity = new Product();
    productEntity.name = 'Test Product';
    productEntity.slug = 'test-product';
    productEntity.category = category;
    product = await productRepo.save(productEntity);

    const offerEntity = new SellerOffer();
    offerEntity.product = product;
    offerEntity.seller = seller;
    offerEntity.price = 1000;
    offerEntity.discountPrice = 1000;
    offerEntity.stock = 1;
    offerEntity.isActive = true;
    offer = await offerRepo.save(offerEntity);
  });

  afterAll(async () => {
    // cleanup created entities
    try {
      const orderRepo = dataSource.getRepository(Order);
      const offerRepo = dataSource.getRepository(SellerOffer);
      const productRepo = dataSource.getRepository(Product);
      const categoryRepo = dataSource.getRepository(ProductCategory);
      const sellerRepo = dataSource.getRepository(Seller);
      const userRepo = dataSource.getRepository(User);

      if (buyer && buyer.id) {
        await orderRepo.delete({ user: { id: buyer.id } as any });
      }

      if (offer && offer.id) {
        await offerRepo.delete(offer.id);
      }

      if (product && product.id) {
        await productRepo.delete(product.id);
      }

      if (category && category.id) {
        await categoryRepo.delete(category.id);
      }

      if (seller && seller.id) {
        await sellerRepo.delete(seller.id);
      }

      if (sellerUser && sellerUser.id) {
        await userRepo.delete(sellerUser.id);
      }

      if (buyer && buyer.id) {
        await userRepo.delete(buyer.id);
      }
    } catch {
      // ignore cleanup errors
    }

    await app.close();
  });

  it('should allow only one of two concurrent purchases when stock=1', async () => {
    const server = app.getHttpServer();

    const payload = {
      userId: buyer.id,
      paymentMethod: PaymentMethod.ONLINE,
      items: [{ offerId: offer.id, quantity: 1 }],
    };

    // send two concurrent requests
    const [res1, res2] = await Promise.all([
      request(server).post('/orders').send(payload),
      request(server).post('/orders').send(payload),
    ]);

    // exactly one should be success (201) and the other should fail (400)
    const statuses = [res1.status, res2.status];
    expect(statuses.filter((s) => s === 201).length).toBe(1);
    expect(
      statuses.filter((s) => s === 400).length +
        statuses.filter((s) => s === 409).length,
    ).toBe(1);

    // verify DB: offer stock should be 0
    const freshOffer = await dataSource
      .getRepository(SellerOffer)
      .findOne({ where: { id: offer.id } });
    expect(freshOffer).toBeDefined();
    expect(freshOffer!.stock).toBe(0);

    // verify exactly one order exists for buyer
    const orders = await dataSource
      .getRepository(Order)
      .find({ where: { user: { id: buyer.id } } as any });
    expect(orders.length).toBe(1);
  }, 20000);
});
