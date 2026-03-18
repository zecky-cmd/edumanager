import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  console.log('--- Tentative d\'initialisation de l\'application ---');
  try {
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
    await app.init();
    console.log('Application initialisée avec succès !');
    await app.close();
  } catch (error) {
    console.error('Échec de l\'initialisation de l\'application :');
    console.error(error);
    process.exit(1);
  }
}
bootstrap();
