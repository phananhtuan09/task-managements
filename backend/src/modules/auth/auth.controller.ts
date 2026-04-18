import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  ApiCommonErrorResponses,
  ApiSuccessResponse,
  ApiValidationErrorResponse,
} from '../../common/decorators/api-response.decorator';
import { OperationResultDto } from '../../common/dto/operation-result.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { AuthService } from './auth.service';
import {
  AuthTokenResponseDto,
  AuthUserResponseDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
} from './dto/auth.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a user session bootstrap flow' })
  @ApiSuccessResponse(AuthUserResponseDto, { status: 201, description: 'Register user' })
  @ApiValidationErrorResponse()
  @ApiCommonErrorResponses()
  public register(@Body() payload: RegisterRequestDto): Promise<AuthUserResponseDto> {
    return this.authService.register(payload);
  }

  @Public()
  @Post('login')
  @ApiSuccessResponse(AuthTokenResponseDto, { status: 201, description: 'Login user' })
  @ApiValidationErrorResponse()
  @ApiCommonErrorResponses()
  public login(@Body() payload: LoginRequestDto): Promise<AuthTokenResponseDto> {
    return this.authService.login(payload);
  }

  @Public()
  @Post('refresh')
  @ApiSuccessResponse(AuthTokenResponseDto, { status: 201, description: 'Refresh token' })
  @ApiValidationErrorResponse()
  @ApiCommonErrorResponses()
  public refresh(@Body() payload: RefreshTokenRequestDto): Promise<AuthTokenResponseDto> {
    return this.authService.refresh(payload);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiSuccessResponse(OperationResultDto, { description: 'Logout current user session' })
  @ApiCommonErrorResponses()
  public logout(): Promise<{ success: boolean }> {
    return this.authService.logout();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiSuccessResponse(AuthUserResponseDto, { description: 'Current user profile' })
  @ApiCommonErrorResponses()
  public me(@CurrentUser() _user?: { sub: string }): Promise<AuthUserResponseDto> {
    return this.authService.me();
  }
}
