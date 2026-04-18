import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';

import {
  ApiCommonErrorResponses,
  ApiPaginatedResponse,
  ApiSuccessResponse,
  ApiValidationErrorResponse,
} from '../../common/decorators/api-response.decorator';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiPaginatedResponse(UserResponseDto, 'List users')
  @ApiValidationErrorResponse()
  @ApiCommonErrorResponses()
  public findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: IdParamDto })
  @ApiSuccessResponse(UserResponseDto, { description: 'Get user detail' })
  @ApiValidationErrorResponse()
  @ApiCommonErrorResponses()
  public findById(@Param() params: IdParamDto): Promise<UserResponseDto> {
    const { id } = params;

    return this.usersService.findById(id);
  }

  @Post()
  @ApiSuccessResponse(UserResponseDto, { status: 201, description: 'Create user' })
  @ApiValidationErrorResponse()
  @ApiCommonErrorResponses()
  public create(@Body() payload: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(payload);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: IdParamDto })
  @ApiSuccessResponse(UserResponseDto, { description: 'Update user' })
  @ApiValidationErrorResponse()
  @ApiCommonErrorResponses()
  public update(@Param() params: IdParamDto, @Body() payload: UpdateUserDto): Promise<UserResponseDto> {
    const { id } = params;

    return this.usersService.update(id, payload);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: IdParamDto })
  @ApiSuccessResponse(UserResponseDto, { description: 'Delete user' })
  @ApiValidationErrorResponse()
  @ApiCommonErrorResponses()
  public remove(@Param() params: IdParamDto): Promise<UserResponseDto> {
    const { id } = params;

    return this.usersService.remove(id);
  }
}
