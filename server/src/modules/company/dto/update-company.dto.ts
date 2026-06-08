import {
  IsString,
  IsOptional,
  IsDateString,
  IsJSON,
  Length,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ description: '公司名称' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({ description: '联系人姓名' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  contactPerson?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  contactPhone?: string;

  @ApiPropertyOptional({ description: '营业执照编号' })
  @IsOptional()
  @IsString()
  licenseNo?: string;

  @ApiPropertyOptional({ description: '营业执照图片JSON' })
  @IsOptional()
  @IsJSON()
  licenseImages?: string;

  @ApiPropertyOptional({ description: '资质等级' })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiPropertyOptional({ description: '资质证书图片JSON' })
  @IsOptional()
  @IsJSON()
  qualificationImages?: string;

  @ApiPropertyOptional({ description: '安全生产许可证编号' })
  @IsOptional()
  @IsString()
  safetyCertNo?: string;

  @ApiPropertyOptional({ description: '安全生产许可证图片JSON' })
  @IsOptional()
  @IsJSON()
  safetyCertImages?: string;

  @ApiPropertyOptional({ description: '成立日期' })
  @IsOptional()
  @IsDateString()
  establishedAt?: string;

  @ApiPropertyOptional({ description: '公司描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '服务区域JSON' })
  @IsOptional()
  @IsJSON()
  serviceArea?: string;
}
