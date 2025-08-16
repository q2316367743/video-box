import {Elysia, t} from "elysia";
import {sourceAiDao, sourceAiModelDao} from "@/dao";
import {Result} from "@/views/Result";
import {YesOrNoType} from "@/global/constant";
import {SourceAi} from "@/types/SourceAi";
import {beginTransactional} from "@/utils/SqlUtil";
import {http} from "@/global/http";

interface ModelObject {
  data: Datum[];
  object: string;
}

interface Datum {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: Permission[];
  root: string;
  parent?: any;
}

interface Permission {
  id: string;
  object: string;
  created: number;
  allow_create_engine: boolean;
  allow_sampling: boolean;
  allow_logprobs: boolean;
  allow_search_indices: boolean;
  allow_view: boolean;
  allow_fine_tuning: boolean;
  organization: string;
  group?: any;
  is_blocking: boolean;
}

async function refreshModels(sourceAi: SourceAi) {
  await beginTransactional(async () => {
    // 删除
    await sourceAiModelDao.query().eq('ai_id', sourceAi.id).delete();
    const {data} = await http.request<ModelObject>({
      url: '/v1/models',
      baseURL: sourceAi.url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sourceAi.token,
      }
    });
    const now = Date.now();
    for (let datum of data.data) {
      await sourceAiModelDao.insert({
        ai_id: sourceAi.id,
        model: datum.id,
        owned: datum.owned_by,
        created_at: now,
        updated_at: now,
      })
    }
  });
}

export default new Elysia({prefix: '/source/ai'})
  .get('/list', async () => {
    const list = await sourceAiDao.query().list();
    return Result.success(list);
  })
  .post('/add',
    async ({body}) => {
      const ai = await sourceAiDao.insert({
        created_at: Date.now(),
        updated_at: Date.now(),
        name: body.name,
        description: body.description,
        url: body.url,
        token: body.token,
        is_enabled: body.is_enabled as YesOrNoType,
      });
      await refreshModels(ai);
      return Result.success();
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.String(),
        url: t.String(),
        token: t.String(),
        is_enabled: t.Number(),
      })
    })
  .put('/update/:id',
    async ({params, body}) => {
      const old = await sourceAiDao.selectById(params.id);
      if (!old) return Result.error("AI源不存在");
      await sourceAiDao.updateById(params.id, {
        updated_at: Date.now(),
        name: body.name,
        description: body.description,
        url: body.url,
        token: body.token,
        is_enabled: body.is_enabled as YesOrNoType,
      });
      const now = await sourceAiDao.selectById(params.id);
      await refreshModels(now!);
      return Result.success();
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.String(),
        description: t.String(),
        url: t.String(),
        token: t.String(),
        is_enabled: t.Number(),
      })
    })
  .delete('/delete/:id',
    async ({params}) => {
      await beginTransactional(async () => {
        await sourceAiModelDao.query().eq('ai_id', params.id).delete();
        await sourceAiDao.deleteById(params.id);
      })
      return Result.success();
    },
    {
      params: t.Object({
        id: t.String(),
      })
    })
  .get('/model/:id',
    async ({params}) => {
      const list = await sourceAiModelDao.query().eq('ai_id', params.id).list();
      return Result.success(list);
    },
    {
      params: t.Object({
        id: t.String(),
      })
    })
  .post('refresh/:id',
    async ({params}) => {
      const sourceAi = await sourceAiDao.selectById(params.id);
      if (!sourceAi) return Result.error("AI源不存在");
      await refreshModels(sourceAi);
      return Result.success();
    },
    {
      params: t.Object({
        id: t.String(),
      })
    })