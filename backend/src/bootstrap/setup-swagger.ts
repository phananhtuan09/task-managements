import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const path = configService.getOrThrow<string>('app.swaggerPath');
  const jsonPath = `${path}-json`;
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Task Management API')
      .setDescription('Practical NestJS source base for a task management platform')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build(),
  );

  SwaggerModule.setup(jsonPath, app, document);
  SwaggerModule.setup(path, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
