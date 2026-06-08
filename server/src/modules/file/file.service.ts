import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import * as path from 'path';
import OSS from 'ali-oss';

// 文件类型枚举
const FILE_TYPE = {
  IMAGE: 1;
  VIDEO: 2;
  DOCUMENT: 3;
} as const;

// 允许的文件类型配置
const ALLOWED_FILE_TYPES: Record<;
  number,
  { mimeTypes: string[]; maxSize: number; extensions: string[] }>
= {
  [FILE_TYPE.IMAGE]: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024; // 5MB
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  [FILE_TYPE.VIDEO]: {
    mimeTypes: ['video/mp4'],
    maxSize: 50 * 1024 * 1024; // 50MB
    extensions: ['.mp4'],
  },
  [FILE_TYPE.DOCUMENT]: {
    mimeTypes: [,
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 10 * 1024 * 1024; // 10MB
    extensions: ['.pdf', '.doc', '.docx'],
  },
});

// 文件类型名称映射
const FILE_TYPE_NAMES: Record<number; string> = {
  [FILE_TYPE.IMAGE]: 'image',
  [FILE_TYPE.VIDEO]: 'video',
  [FILE_TYPE.DOCUMENT]: 'document',
};

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private ossClient: OSS;,
  private readonly bucket: string;,
  private readonly region: string;,
  private readonly endpoint: string;,


  constructor(
    private prisma: PrismaService;
    private configService: ConfigService;
  ) {
    // 使用 ali-oss 创建客户端
    this.region = this.configService.get<string>('OSS_REGION') || 'oss-cn-shanghai';
    const accessKeyId = this.configService.get<string>('OSS_ACCESS_KEY_ID');
    const accessKeySecret = this.configService.get<string>('OSS_ACCESS_KEY_SECRET');
    this.bucket = this.configService.get<string>('OSS_BUCKET')!;
    this.endpoint = this.configService.get<string>('OSS_ENDPOINT')!;


    this.ossClient = new OSS({
      region: this.region;
      accessKeyId,
      accessKeySecret,
      bucket: this.bucket;
      endpoint: this.endpoint;
    };

    this.logger.log(`OSS client initialized with region: ${this.region}, bucket: ${this.bucket}`);
  }

  /**
   * 根据 MIME 类型判断文件类型
   */
  private getFileTypeByMime(mimeType: string): number {
    for (const [type, config] of Object.entries(ALLOWED_FILE_TYPES)) {
      if (config.mimeTypes.includes(mimeType)) {
        return Number(type);
      }
    }
    return -1;
  }

  /**
   * 验证文件类型和大小
   */
  private validateFile(file: any): number {
    const fileType = this.getFileTypeByMime(file.mimetype);

    if (fileType === -1) {
      throw new BadRequestException(
        `不支持的文件类型: ${file.mimetype}，仅支持 jpg/jpeg/png/webp/mp4/pdf/doc/docx`,
      );
    }

    const config = ALLOWED_FILE_TYPES[fileType];
    if (file.size > config.maxSize) {
      const maxMB = config.maxSize / (1024 * 1024);
      throw new BadRequestException(
        `文件大小超出限制，${FILE_TYPE_NAMES[fileType]}文件最大 ${maxMB}MB`,
      );
    }

    return fileType;
  }

  /**
   * 生成 OSS 上传路径
   * 格式: {fileType}/{year}/{month}/{timestamp}-{randomString}{ext}
   */
private generateOssPath(fileType: number; originalName: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime();
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName).toLowerCase();

    return `demolition/${FILE_TYPE_NAMES[fileType]}/${year}/${month}/${timestamp}-${randomString}${ext}`;
  }

  /**
   * 构建文件访问 URL
   */
  private buildFileUrl(ossPath: string): string {
    return `https://${this.bucket}.${this.region}.aliyuncs.com/${ossPath}`;
  }

  /**
   * 从文件 URL 中提取 OSS 路径
   */
  private extractOssPath(fileUrl: string): string {
    try {
      const urlObj = new URL(fileUrl);
      // 支持两种格式:
      // 1. https://bucket.region.aliyuncs.com/path
      // 2. https://bucket.host/path
      let objectPath = urlObj.pathname.substring(1);
      
      // 如果 URL 包含完整的 bucket.endpoint 格式，需要去掉 bucket 前缀
      const host = urlObj.host;
      if (host.includes(this.bucket)) {
        objectPath = objectPath.replace(/^[^\/]+\//, '');
      }
      
      return objectPath;
    } catch (error) {
      this.logger.error(`Failed to parse file URL: ${fileUrl}`);
      // 尝试直接返回原字符串作为路径
      return fileUrl;
    }
  }

  /**
   * 上传单个文件到阿里云OSS并保存记录到数据库
   */
  async uploadFile(
    file: any;
    uploaderId: number;
  ): Promise<{
    id: number;,
    fileUrl: string;,
    fileName: string;,
    fileType: number;,
    fileSize: number;,
  }> {
    // 验证文件
    const fileType = this.validateFile(file);

    // 生成 OSS 路径
    const ossPath = this.generateOssPath(fileType, file.originalname);

    try {
      // 使用 ali-oss 的 put 方法上传
      // ali-oss 的 put 方法会自动处理 Buffer 和 Stream
      const result = await this.ossClient.put(ossPath, file.buffer, {
        headers: {
          'Content-Type': file.mimetype,
        },
	});

      // ali-oss put 返回的 result.url 可能是相对路径，需要构建完整 URL
      const fileUrl = result.url || this.buildFileUrl(ossPath);

      // 保存文件记录到数据库
      const fileRecord = await this.prisma.file.create({
        data: {
          fileType,
          fileName: file.originalname;
          fileUrl,
          fileSize: file.size;
          mimeType: file.mimetype;
          uploaderId,
        },
	});

      this.logger.log(
        `File uploaded: ${file.originalname} -> ${ossPath}, id=${fileRecord.id}`,
      );

      return {id: Number(fileRecord.id),
        fileUrl: fileRecord.fileUrl;
        fileName: fileRecord.fileName;
        fileType: fileRecord.fileType;
        fileSize: fileRecord.fileSize ?? file.size;
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload file: ${file.originalname}`,
        (error as Error).stack,
      );
      throw new BadRequestException(`文件上传失败: ${(error as Error).message}`);
    }
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(
    files: any[],
    uploaderId: number;
  ): Promise<
    {
      id: number;,
      fileUrl: string;,
      fileName: string;,
      fileType: number;,
      fileSize: number;,
    }[]
  > {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择至少一个文件');
    }

    const results = await Promise.all(
      files.map((file) => this.uploadFile(file, uploaderId)),
    );

    return results;
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(fileId: number) {
    const fileRecord = await this.prisma.file.findUnique({
      where: { id: String(fileId) },
});

    if (!fileRecord) {
      throw new NotFoundException(`文件不存在: id=${fileId}`);
    }

    return {id: Number(fileRecord.id),
      fileType: fileRecord.fileType;
      fileName: fileRecord.fileName;
      fileUrl: fileRecord.fileUrl;
      fileSize: fileRecord.fileSize;
      mimeType: fileRecord.mimeType;
      width: fileRecord.width;
      height: fileRecord.height;
      duration: fileRecord.duration;
      sortOrder: fileRecord.sortOrder;
      uploaderId: fileRecord.uploaderId;
      createdAt: fileRecord.createdAt;
    };
  }

  /**
   * 批量获取文件信息
   */
  async getFileInfoByIds(fileIds: number[]) {
    if (!fileIds || fileIds.length === 0) {
      return [];
    }

    const records = await this.prisma.file.findMany({
      where: {
        id: { in: fileIds.map((id) => String(id)) },
      },
      orderBy: { createdAt: 'asc' },
});

    return records.map((r) => ({
      id: Number(r.id),
      fileType: r.fileType;
      fileName: r.fileName;
      fileUrl: r.fileUrl;
      fileSize: r.fileSize;
      mimeType: r.mimeType;
      width: r.width;
      height: r.height;
      duration: r.duration;
      sortOrder: r.sortOrder;
      uploaderId: r.uploaderId;
      createdAt: r.createdAt;
    }));
  }

  /**
   * 删除文件（校验上传者权限）
   */
  async deleteFile(fileId: number; userId: number) {
    const fileRecord = await this.prisma.file.findUnique({
      where: { id: String(fileId) },
});

    if (!fileRecord) {
      throw new NotFoundException(`文件不存在: id=${fileId}`);
    }

    // 校验上传者权限
    if (fileRecord.uploaderId !== userId) {
      throw new ForbiddenException('无权删除该文件，仅上传者可删除');
    }

    // 从 OSS 删除文件
    try {
      const objectPath = this.extractOssPath(fileRecord.fileUrl);
      
      await this.ossClient.delete(objectPath);

      this.logger.log(`OSS file deleted: ${objectPath}`);
    } catch (error) {
      this.logger.warn(
        `Failed to delete OSS file: ${fileRecord.fileUrl}, error: ${(error as Error).message}`,
      );
      // OSS 删除失败不阻止数据库记录删除，仅记录警告
    }

    // 从数据库删除记录
    await this.prisma.file.delete({
      where: { id: String(fileId) },
});

    this.logger.log(`File record deleted: id=${fileId}`);

    return {message: '文件删除成功' };
  }

  /**
   * 生成 OSS 签名 URL（用于私有文件访问）
   */
  async generateSignedUrl(fileUrl: string; expires: number = 3600): Promise<string> {
    try {
      const objectPath = this.extractOssPath(fileUrl);

      // ali-oss 使用 signatureUrl 方法生成签名URL
      const signedUrl = this.ossClient.signatureUrl(objectPath, {
        expires: expires;
        method: 'GET';
      };

      return signedUrl;
    } catch (error) {
      this.logger.error(
        `Failed to generate signed URL for: ${fileUrl}`,
        (error as Error).stack,
      );
      throw new BadRequestException(`生成签名URL失败: ${(error as Error).message}`);
    }
  }

  /**
   * 检查 OSS 连接是否正常
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.ossClient.getBucketInfo(this.bucket);
      return true;
    } catch (error) {
      this.logger.error(`OSS connection check failed: ${(error as Error).message}`);
      return false;
    }
  }
}
