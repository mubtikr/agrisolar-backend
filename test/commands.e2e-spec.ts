import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Commands (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    const user = await prisma.user.create({
      data: {
        email: 'test@farm.com',
        password: 'hashed',
        name: 'Test',
      },
    });

    token = jwtService.sign({ sub: user.id, email: user.email });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  it('POST /commands/pump should return 202 with valid JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/commands/pump')
      .set('Authorization', `Bearer ${token}`)
      .send({ deviceId: 'esp32_farm_01', pump: true })
      .expect(202);

    expect(response.body).toHaveProperty('deviceId', 'esp32_farm_01');
    expect(response.body).toHaveProperty('pump', true);
    expect(response.body).toHaveProperty('issuedAt');
  });

  it('POST /commands/pump should return 401 without token', async () => {
    await request(app.getHttpServer())
      .post('/commands/pump')
      .send({ deviceId: 'esp32_farm_01', pump: true })
      .expect(401);
  });

  it('POST /commands/pump should return 400 with invalid body', async () => {
    await request(app.getHttpServer())
      .post('/commands/pump')
      .set('Authorization', `Bearer ${token}`)
      .send({ deviceId: '' })
      .expect(400);
  });
});
