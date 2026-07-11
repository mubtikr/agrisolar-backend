import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Telemetry Ingestion (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should persist a valid telemetry reading', async () => {
    const validPayload = {
      deviceId: 'esp32_farm_01',
      soilPercent: 42,
      airTemp: 27.4,
      humidity: 55.1,
      waterTemp: 22.0,
      rainDetected: false,
      pumpState: false,
    };

    const response = await request(app.getHttpServer())
      .post('/telemetry/ingest')
      .send(validPayload)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.deviceId).toBe('esp32_farm_01');
    expect(response.body.soilPercent).toBe(42);
  });

  it('should reject a malformed telemetry payload', async () => {
    const malformedPayload = {
      soilPercent: 'oops',
    };

    await request(app.getHttpServer())
      .post('/telemetry/ingest')
      .send(malformedPayload)
      .expect(400);
  });
});
