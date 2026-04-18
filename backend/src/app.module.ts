import { Module } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { FeatureModule } from './modules/feature.module';
import { ShareModule } from './shared/share.module';

@Module({
  imports: [ShareModule, FeatureModule],
  providers: [
    GlobalExceptionFilter,
    RequestContextInterceptor,
    HttpLoggingInterceptor,
    TransformResponseInterceptor,
  ],
})
export class AppModule {}
