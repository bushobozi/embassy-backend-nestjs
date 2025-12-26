import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Embassy System MVP API')
    .setDescription(
      'The Embassy System API description - Minimum Viable Product API',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger_docs/embassy', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
