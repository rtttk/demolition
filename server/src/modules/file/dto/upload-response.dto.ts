import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ description: '文件ID' })
  id: number;

  @ApiProperty({ description: '文件URL' })
  fileUrl: string;

  @ApiProperty({ description: '文件名' })
  fileName: string;

  @ApiProperty({ description: '文件类型 1=图片 2=视频 3=文档' })
  fileType: number;

  @ApiProperty({ description: '文件大小(字节)' })
  fileSize: number;
}
