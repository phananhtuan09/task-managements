import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse as SwaggerApiResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

class SuccessMetaDto {
  @ApiProperty()
  public readonly page!: number;

  @ApiProperty()
  public readonly limit!: number;

  @ApiProperty()
  public readonly total!: number;

  @ApiProperty()
  public readonly totalPages!: number;
}

class SuccessEnvelopeDto {
  @ApiProperty({ example: true })
  public readonly success!: true;

  @ApiPropertyOptional({ example: 'OK' })
  public readonly message?: string;

  @ApiProperty({ example: '2e5d2f86-c7fb-4f65-8d12-a8d4929c9a76' })
  public readonly requestId!: string;

  @ApiProperty({ example: '2026-04-18T09:30:00.000Z' })
  public readonly timestamp!: string;
}

class ErrorEnvelopeDto {
  @ApiProperty({ example: false })
  public readonly success!: false;

  @ApiProperty({ example: 'VALIDATION_ERROR' })
  public readonly code!: string;

  @ApiProperty({ example: 'User not found' })
  public readonly message!: string;

  @ApiPropertyOptional({ example: { field: 'email' } })
  public readonly details?: unknown;

  @ApiPropertyOptional({ example: 'Bad Request' })
  public readonly error?: unknown;

  @ApiPropertyOptional({ example: 'Error: stack trace' })
  public readonly stack?: string;

  @ApiProperty({ example: '/v1/users/123' })
  public readonly path!: string;

  @ApiProperty({ example: '2e5d2f86-c7fb-4f65-8d12-a8d4929c9a76' })
  public readonly requestId!: string;

  @ApiProperty({ example: '2026-04-18T09:30:00.000Z' })
  public readonly timestamp!: string;
}

interface SuccessResponseOptions {
  readonly status?: HttpStatus.OK | HttpStatus.CREATED;
  readonly description?: string;
  readonly isArray?: boolean;
}

function buildSuccessSchema(model: Type<unknown>, options?: { isArray?: boolean; paginated?: boolean }) {
  const dataSchema = options?.isArray
    ? {
        type: 'array',
        items: { $ref: getSchemaPath(model) },
      }
    : { $ref: getSchemaPath(model) };

  return {
    allOf: [
      { $ref: getSchemaPath(SuccessEnvelopeDto) },
      {
        type: 'object',
        properties: {
          data: dataSchema,
          ...(options?.paginated
            ? {
                meta: { $ref: getSchemaPath(SuccessMetaDto) },
              }
            : {}),
        },
      },
    ],
  };
}

export function ApiSuccessResponse(model: Type<unknown>, options?: SuccessResponseOptions): MethodDecorator {
  const decorator = (options?.status ?? HttpStatus.OK) === HttpStatus.CREATED ? ApiCreatedResponse : ApiOkResponse;

  return applyDecorators(
    ApiExtraModels(SuccessEnvelopeDto, SuccessMetaDto, model),
    decorator({
      description: options?.description,
      schema: buildSuccessSchema(model, {
        isArray: options?.isArray,
      }),
    }),
  );
}

export function ApiPaginatedResponse(model: Type<unknown>, description?: string): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(SuccessEnvelopeDto, SuccessMetaDto, model),
    ApiOkResponse({
      description,
      schema: buildSuccessSchema(model, {
        isArray: true,
        paginated: true,
      }),
    }),
  );
}

export function ApiErrorResponse(
  status: number,
  description?: string,
  example?: Partial<ErrorEnvelopeDto>,
): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(ErrorEnvelopeDto),
    SwaggerApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ErrorEnvelopeDto) },
          ...(example
            ? [
                {
                  example,
                },
              ]
            : []),
        ],
      },
    }),
  );
}

export function ApiCommonErrorResponses(): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(ErrorEnvelopeDto),
    ApiBadRequestResponse({
      schema: {
        $ref: getSchemaPath(ErrorEnvelopeDto),
      },
    }),
    ApiUnauthorizedResponse({
      schema: {
        $ref: getSchemaPath(ErrorEnvelopeDto),
      },
    }),
    ApiNotFoundResponse({
      schema: {
        $ref: getSchemaPath(ErrorEnvelopeDto),
      },
    }),
    ApiInternalServerErrorResponse({
      schema: {
        $ref: getSchemaPath(ErrorEnvelopeDto),
      },
    }),
  );
}

export function ApiValidationErrorResponse(): MethodDecorator {
  return ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation error', {
    success: false,
    code: 'VALIDATION_ERROR',
    message: 'email must be a valid email address',
    details: [
      {
        property: 'email',
        constraints: {
          isEmail: 'email must be a valid email address',
        },
      },
    ],
    path: '/v1/users',
    requestId: '2e5d2f86-c7fb-4f65-8d12-a8d4929c9a76',
    timestamp: '2026-04-18T09:30:00.000Z',
  });
}
