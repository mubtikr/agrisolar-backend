import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('POST /auth/login should return accessToken with valid credentials', async () => {
    await prisma.user.create({
      data: {
        email: 'test@farm.com',
        password: '$2b$10$testhash',
        name: 'Test Admin',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@farm.com', password: 'password123' })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user).toHaveProperty('email', 'test@farm.com');
  });

  it('POST /auth/login should return 401 with invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@farm.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('GET /telemetry/latest should return 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/telemetry/latest?deviceId=esp32_farm_01')
      .expect(401);
  });
});
