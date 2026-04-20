import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { AppI18nValidationPipe } from './common/pipes/i18n-validation.pipe';
import { FeatureModule } from './modules/feature.module';
import { ShareModule } from './shared/share.module';

@Module({
  imports: [ShareModule, FeatureModule],
  providers: [
    GlobalExceptionFilter,
    RequestContextInterceptor,
    HttpLoggingInterceptor,
    TransformResponseInterceptor,
    AppI18nValidationPipe,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
