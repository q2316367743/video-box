import {
  Button,
  Card,
  Divider,
  DrawerPlugin,
  Image, LoadingPlugin,
  TabPanel,
  Tabs,
  Tag
} from 'tdesign-vue-next'
import {
  CalendarIcon, HeartIcon,
  Location1Icon,
  PlayIcon,
  PlusIcon, ShareIcon,
  TimeIcon,
  UsergroupIcon
} from "tdesign-icons-vue-next";
import {isNotEmptyString} from "@/utils/lang/FieldUtil.ts";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {pluginWebDetail} from "@/apis/plugin-web/index.js";
import {copyWebShare, openWebPlayer} from "@/plugin/player.js";
import {myVideoItemExist, myVideoItemPost, myVideoItemToggle} from "@/apis/my/video-item.js";
import {MyVideoItemForm, MyVideoItemFromEnum, MyVideoItemTypeEnum} from "@/views/MyVideoItemView.js";


export async function openVideoInfoDrawer(sourceId: string, videoId: string) {
  const lp = LoadingPlugin({
    text: '正在获取详情',
    fullscreen: true
  })
  try {

    // 获取播放记录
    const existLiked = ref(false);
    const existFollowing = ref(false);
    myVideoItemExist({
      type: MyVideoItemTypeEnum.FOLLOWING,
      from: MyVideoItemFromEnum.WEB,
      payload: sourceId + '/' + videoId
    }).then(res => existFollowing.value = res);
    myVideoItemExist({
      type: MyVideoItemTypeEnum.LIKED,
      from: MyVideoItemFromEnum.WEB,
      payload: sourceId + '/' + videoId
    }).then(res => existLiked.value = res);

    // 获取详情
    const detail = await pluginWebDetail(sourceId, videoId);
    const chapterId = detail.chapters[0]?.id || '';

    const handlePlay = () => {
      myVideoItemPost({
        title: detail.title,
        cover: detail.cover,
        description: detail.remark,
        type: MyVideoItemTypeEnum.WATCHED,
        from: MyVideoItemFromEnum.WEB,
        payload: `${sourceId}/${videoId}`
      })
      openWebPlayer(sourceId, videoId);
      dp.destroy?.();
    }
    const handleMy = (type: MyVideoItemTypeEnum, onSuccess: (exist: boolean) => void) => {
      const data: MyVideoItemForm = {
        type,
        from: MyVideoItemFromEnum.WEB,
        payload: sourceId + '/' + videoId,
        cover: detail.cover,
        title: detail.title,
        description: detail.remark
      };
      myVideoItemToggle(data)
        .then(() => {
          myVideoItemExist(data).then(onSuccess)
        })
    }
    const toggleFollowing = () => handleMy(MyVideoItemTypeEnum.FOLLOWING, exist => {
      MessageUtil.success((exist ? '' : '取消') + "在追成功");
      existFollowing.value = exist;
    });
    const toggleLiked = () => handleMy(MyVideoItemTypeEnum.LIKED, exist => {
      MessageUtil.success((exist ? '' : '取消') + "喜欢成功");
      existLiked.value = exist;
    });

    const dp = DrawerPlugin({
      header: false,
      closeBtn: false,
      size: '500px',
      footer: false,
      default: () => (
        <div class="pb-16px">

          {/* 海报和基本信息 */}
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-100px overflow-hidden">
              <Image
                src={detail.cover || "./movie.svg"}
                alt={detail.title}
                fit={'cover'}
                class="rounded-lg"
              />
            </div>
            <div class="flex-1 space-y-3">
              <div>
                <div class="text-xl font-bold leading-tight">{detail.title}</div>
                {detail.subtitle && <div class="text-sm mt-4px">{detail.subtitle}</div>}
              </div>

              <div class="flex gap-1 flex-wrap">
                {detail.types.filter(isNotEmptyString).map((genre) => (
                  <Tag key={genre} variant={"outline"} theme={'primary'} shape={'round'}>
                    {genre}
                  </Tag>
                ))}
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {detail.releaseYear && <div class="flex items-center gap-1">
                  <CalendarIcon class="h-3 w-3"/>
                  <span>{detail.releaseYear}</span>
                </div>}
                {detail.duration && <div class="flex items-center gap-1">
                  <TimeIcon class="h-3 w-3"/>
                  <span>{detail.duration}</span>
                </div>}
                {detail.region && <div class="flex items-center gap-1">
                  <Location1Icon class="h-3 w-3"/>
                  <span>{detail.region}</span>
                </div>}
                {detail.language && <div class="flex items-center gap-1">
                  <UsergroupIcon class="h-3 w-3"/>
                  <span>{detail.language}</span>
                </div>}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div class="flex gap-2 mt-16px">
            <Button theme={'primary'} class="flex-1 gap-2" onClick={handlePlay}>{{
              icon: () => <PlayIcon/>,
              default: () => <span>立即播放</span>
            }}</Button>
            <Button theme={'primary'} variant={existFollowing.value ? 'base' : 'outline'} shape={'square'}
                    onClick={toggleFollowing}>{{
              icon: () => <PlusIcon/>
            }}</Button>
            <Button theme={'primary'} variant={existLiked.value ? 'base' : 'outline'} shape={'square'}
                    onClick={toggleLiked}>{{
              icon: () => <HeartIcon/>
            }}</Button>
            <Button theme={'primary'} variant="outline" shape={'square'} onClick={() => copyWebShare(sourceId, videoId)}>{{
              icon: () => <ShareIcon/>
            }}</Button>
          </div>

          <Divider/>

          {/* 剧情简介 */}
          <div class="space-y-3 mt-8px">
            <h3 class="font-semibold">剧情简介</h3>
            <p class="text-sm text-muted-foreground leading-relaxed" innerHTML={detail.content}></p>
          </div>

          <Divider/>

          {/* 影片信息 */}
          <div class="space-y-3">
            <h3 class="font-semibold">影片信息</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="min-w-65px">导演：</span>
                <span
                  class="text-right">{(detail.writers && detail.writers.length > 0) ? detail.writers.join("、") : '-'}</span>
              </div>
              <div class="flex justify-between">
                <span class="min-w-65px">主演：</span>
                <span
                  class="text-right max-w-[300px]">{(detail.actors && detail.actors.length > 0) ? detail.actors.join("、") : '-'}</span>
              </div>
              <div class="flex justify-between">
                <span class="min-w-65px">语言：</span>
                <span class="text-right">{detail.language || '-'}</span>
              </div>
              <div class="flex justify-between">
                <span class="min-w-65px">制片国家：</span>
                <span class="text-right">{detail.region || '-'}</span>
              </div>
            </div>
          </div>

          <Divider/>

          {/* 播放源 */}
          {detail.chapters && detail.chapters.length > 0 && (
            <>
              <div class="space-y-3">
                <h3 class="font-semibold mb-0">播放源</h3>
                <div class="space-y-2">
                  <Tabs defaultValue={chapterId} class="w-full">
                    {detail.chapters.map((source, index) => (
                      <TabPanel key={index} label={source.name} value={source.id}>
                        <div class="mt-8px flex justify-start items-start flex-wrap content-start gap-8px">
                          {source.items.map(item => (<div style={{
                              backgroundColor: 'var(--td-bg-color-component)',
                              lineHeight: '24px',
                              textAlign: 'center',
                              borderRadius: 'var(--td-radius-default)',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              color: 'var(--td-color-primary)'
                            }}>{item.name}</div>
                          ))}
                        </div>
                      </TabPanel>
                    ))}
                  </Tabs>
                </div>
              </div>
            </>
          )}

          {/* 相关推荐 */}
          {detail.recommends.length > 0 && <>
            <Divider/>
            <div class="space-y-3">
              <h3 class="font-semibold">相关推荐</h3>
              <div class="grid grid-cols-2 gap-3">
                {detail.recommends.map((movie) => (
                  <Card key={movie.id} class="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div class="aspect-[2/3] relative">
                      <Image src={movie.cover || "./movie.svg"} alt={movie.title} class="object-cover"/>
                    </div>
                    <h4 class="font-medium text-xs truncate">{movie.title}</h4>
                  </Card>
                ))}
              </div>
            </div>
          </>}
        </div>)
    })
  } catch (e) {
    MessageUtil.error("获取影片详情失败", e);
  } finally {
    lp.hide();
  }
}