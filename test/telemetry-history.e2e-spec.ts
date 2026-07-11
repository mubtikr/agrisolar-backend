import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Telemetry History (e2e)', () => {
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
    await prisma.sensorTelemetry.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('GET /telemetry/history should return items array', async () => {
    await prisma.sensorTelemetry.create({
      data: {
        deviceId: 'esp32_farm_01',
        soilPercent: 42,
        airTemp: 27.4,
        humidity: 55.1,
        waterTemp: 22.0,
        rainDetected: false,
        pumpState: false,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/telemetry/history?deviceId=esp32_farm_01')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('deviceId', 'esp32_farm_01');
    expect(response.body).toHaveProperty('count');
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it('GET /telemetry/history should return empty items for empty range', async () => {
    const response = await request(app.getHttpServer())
      .get('/telemetry/history?deviceId=nonexistent&from=2020-01-01T00:00:00Z&to=2020-01-02T00:00:00Z')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.items).toEqual([]);
  });

  it('GET /telemetry/history should return 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/telemetry/history?deviceId=esp32_farm_01')
      .expect(401);
  });
});
