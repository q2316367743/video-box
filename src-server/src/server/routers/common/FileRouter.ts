// routes/upload.ts
import {Elysia, t, file} from 'elysia';
import {writeFileSync, mkdirSync} from 'fs';
import {join, extname} from 'path';
import {resourceDao} from "@/dao";
import {APP_FILE_DIR} from "@/global/constant";
import {beginTransactional} from "@/utils/SqlUtil";
import {useSnowflake} from "@/utils/Snowflake";
import {Result} from "@/views/Result";

export default new Elysia({prefix: '/file'})
  .post('/upload',
    async ({body}) => {
      const filename = await beginTransactional(async () => {
        const file = body.file as File;
        const ext = extname(file.name);
        const uuid = useSnowflake().nextId();
        const datePath = new Date().toISOString().slice(0, 10).replace(/-/g, '/'); // 2025/08/18
        const filename = `${uuid}.${ext}`;
        const dir = join(APP_FILE_DIR, datePath);
        mkdirSync(dir, {recursive: true});

        const buffer = await file.arrayBuffer();
        writeFileSync(join(dir, filename), Buffer.from(buffer));

        // 插入数据库
        await resourceDao.insertSelf({
          id: uuid,
          filename,
          original_name: file.name,
          mime_type: file.type,
          size: file.size,
          path: `${datePath}/${filename}`,
          create_at: Date.now(),
        });
        return filename;
      });

      return Result.success(filename);
    },
    {
      body: t.Object({
        file: t.File(),
      })
    })
  .get('/preview/:id.:ext',
    async ({params: {id, ext}, set}) => {
      // 1. 查库
      const row = await resourceDao.selectById(id);
      if (!row) {
        set.status = 404;
        return 'Not Found';
      }

      // 2. 简单的扩展名校验（可选）
      if (row.filename !== `${id}.${ext}`) {
        set.status = 404;
        return 'Extension mismatch';
      }
      // 3. 读文件并返回
      const filePath = join(APP_FILE_DIR, row.path);
      set.headers['Content-Type'] = row.mime_type;
      return file(filePath);
    },
    {
      params: t.Object({
        id: t.String(),
        ext: t.String(),
      })
    });