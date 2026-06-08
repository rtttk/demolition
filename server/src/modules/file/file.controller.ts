import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FileService } from './file.service';
import { UploadResponseDto } from './dto/upload-response.dto';

@ApiTags('文件管理')
@Controller('files')
@UseGuards(AuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传单个文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '支持 jpg/jpeg/png/webp(<=5MB), mp4(<=50MB), pdf/doc/docx(<=10MB)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @CurrentUser('id') userId: number,
  ) {
    return this.fileService.uploadFile(file, userId);
  }

  @Post('upload/batch')
  @ApiOperation({ summary: '批量上传文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: '支持 jpg/jpeg/png/webp(<=5MB), mp4(<=50MB), pdf/doc/docx(<=10MB)',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles() files: any[],
    @CurrentUser('id') userId: number,
  ) {
    return this.fileService.uploadFiles(files, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文件信息' })
  async getFileInfo(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.getFileInfo(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文件' })
  async deleteFile(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.fileService.deleteFile(id, userId);
  }
}
