import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import type { TransferMoneyOutput } from '../../application/types/transfer-money.types.js';
import { TransferMoneyUseCase } from '../../application/use-cases/transfer-money.use-case.js';
import { TransferMoneyDto } from '../dto/transfer-money.dto.js';
import { TransferResponseDto } from '../dto/transfer-response.dto.js';

@ApiTags('transfers')
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transferMoney: TransferMoneyUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Transfer funds between two internal accounts' })
  @ApiCreatedResponse({ type: TransferResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid amount or identical accounts' })
  @ApiNotFoundResponse({ description: 'One or both accounts do not exist' })
  @ApiConflictResponse({ description: 'The balance changed concurrently' })
  @ApiUnprocessableEntityResponse({ description: 'Insufficient funds' })
  async create(@Body() dto: TransferMoneyDto): Promise<TransferResponseDto> {
    const result = await this.transferMoney.execute(dto);

    if (result.status === 'completed') {
      return TransferResponseDto.from(result);
    }

    return this.throwHttpError(result);
  }

  private throwHttpError(result: Extract<TransferMoneyOutput, { status: 'rejected' }>): never {
    switch (result.reason) {
      case 'ACCOUNT_NOT_FOUND':
        throw new NotFoundException(result.message);
      case 'CONCURRENT_UPDATE':
        throw new ConflictException(result.message);
      case 'INSUFFICIENT_FUNDS':
        throw new UnprocessableEntityException(result.message);
      case 'INVALID_AMOUNT':
      case 'SAME_ACCOUNT':
        throw new BadRequestException(result.message);
    }
  }
}
