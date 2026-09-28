import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class TransferMoneyDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  sourceAccountId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  destinationAccountId!: string;

  @ApiProperty({ description: 'Positive amount expressed in cents', example: 2500 })
  @IsInt()
  @Min(1)
  amountInCents!: number;
}
