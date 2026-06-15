## 服务端开发规范

### 文件服务实现

文件服务采用 `files` 表统一管理所有文件上传，**文件访问地址统一从 `files.file_url` 字段获取**。

**files 表结构**
```sql
id          - 主键ID (cuid)
uploaderId  - 上传者ID (String)
fileUrl     - 文件访问URL（重要：展示文件时使用此字段）
fileKey     - 文件存储Key
fileName    - 文件名
fileSize    - 文件大小(字节)
mimeType    - MIME类型
createdAt   - 创建时间
```

**文件上传流程**
1. 前端调用 `POST /files/upload` 上传文件
2. 后端生成唯一文件Key，存储到云存储（OSS/S3等）
3. 将文件元数据（URL、原始名称、大小等）存入 `files` 表
4. 返回文件ID和访问URL

**关联查询规范**
当需要返回关联文件信息时（如订单合同、施工日志图片等），需要显式查询 `files` 表，根据文件ID数组获取文件URL：

```typescript
// 错误示例 - 只返回ID数组
const log = await this.prisma.constructionLog.findUnique({ where: { id: logId } });
// log.imageIds = ["id1", "id2"]，无法直接展示

// 正确示例 - 查询文件信息并映射URL
const images = await this.prisma.file.findMany({
  where: { id: { in: log.imageIds } },
  select: { id: true, fileUrl: true },
});
const imageMap = new Map(images.map(img => [img.id, img.fileUrl]));
const imageUrls = log.imageIds.map(id => imageMap.get(id)).filter(Boolean);
// imageUrls = ["https://xxx.com/image1.jpg", "https://xxx.com/image2.jpg"]
```

**常见关联场景**

| 场景 | ID字段 | 查询方式 |
|------|--------|----------|
| 订单合同 | `order.contractId` | 单文件查询 `prisma.file.findUnique` |
| 施工日志图片 | `constructionLog.imageIds` | 多文件查询 `prisma.file.findMany` + Map映射 |
| 施工日志视频 | `constructionLog.videoIds` | 多文件查询 `prisma.file.findMany` + Map映射 |
| 案例前后照片 | `case.beforeImageIds/afterImageIds` | 多文件查询 + Map映射 |

**文件删除**
文件删除时需要同时：
1. 从云存储删除实际文件
2. 从 `files` 表删除记录

### TypeScript 语法规范

**Prisma Json 类型处理**
Prisma 的 `Json` 类型字段在 TypeScript 中被推断为 `JsonValue`（`string | number | boolean | Object | Array`），不能直接当作数组使用。需要使用 `parseJsonArray` 辅助函数进行类型断言：

```typescript
// 定义辅助函数
function parseJsonArray(value: unknown): string[] {
  if (!value || !Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

// 使用示例
const imageIds = parseJsonArray(log.imageIds);
const videoIds = parseJsonArray(log.videoIds);
```

**Map 构造函数类型注解**
创建 Map 时需要显式指定泛型类型，并将数组元素断言为元组类型：

```typescript
// 错误示例
const imageMap = new Map(images.map(img => [img.id, img.fileUrl]));

// 正确示例
const imageMap = new Map<string, string>(
  (images as { id: string; fileUrl: string }[]).map((img) => [img.id, img.fileUrl] as [string, string])
);
```

**数组方法参数类型注解**
使用 `map`、`filter` 等数组方法时，回调函数参数需要类型注解：

```typescript
// 错误示例
imageUrls: imageIds.map(id => imageMap.get(id)).filter(Boolean);

// 正确示例
imageUrls: imageIds.map((id: string) => imageMap.get(id)).filter(Boolean);
```

**严格模式配置参考**
项目 `tsconfig.json` 配置如下（供参考）：
```json
{
  "compilerOptions": {
    "strictNullChecks": false,
    "strict": false,
    "noImplicitAny": false,
    "skipLibCheck": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```
