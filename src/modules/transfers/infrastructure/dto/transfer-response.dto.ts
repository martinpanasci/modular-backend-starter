import { ApiProperty } from '@nestjs/swagger';

import type { TransferMoneyOutput } from '../../application/types/transfer-money.types.js';

type CompletedTransfer = Extract<TransferMoneyOutput, { status: 'completed' }>;

export class TransferResponseDto {
  @ApiProperty({ example: 'completed' })
  status!: 'completed';

  @ApiProperty({ format: 'uuid' })
  transferId!: string;

  @ApiProperty({ format: 'uuid' })
  sourceAccountId!: string;

  @ApiProperty({ format: 'uuid' })
  destinationAccountId!: string;

  @ApiProperty({ example: 2500 })
  amountInCents!: number;

  static from(result: CompletedTransfer): TransferResponseDto {
    const response = new TransferResponseDto();
    Object.assign(response, result);
    return response;
  }
}
