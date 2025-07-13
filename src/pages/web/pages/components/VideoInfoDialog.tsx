import {Button, Card, Divider, DrawerPlugin, Image, TabPanel, Tabs, Tag} from 'tdesign-vue-next'
import {VideoListItem, VideoPlugin} from "@/modules/video/VideoPlugin";
import {
  CalendarIcon, HeartIcon,
  Location1Icon,
  PlayIcon,
  PlusIcon, ShareIcon,
  TimeIcon,
  UsergroupIcon
} from "tdesign-icons-vue-next";
import {usePlayerWindowStore} from "@/store";
import {isNotEmptyString} from "@/utils/lang/FieldUtil";
import {useCacheRecordStorage} from "@/hooks/CacheRecordStorage";
import {LocalNameEnum} from "@/global/LocalNameEnum";


export async function openVideoInfoDrawer(item: VideoListItem, plugin: VideoPlugin) {
  // 获取详情
  const detail = await plugin.getDetail(item);
  // 获取看到哪里了
  const createRef = useCacheRecordStorage(LocalNameEnum.KEY_PLAYER_VIDEO_INDEX);
  const chapterId = createRef<string>(`/${plugin.props.id}/${detail.id}`, 'chapter', detail.playUrls[0]?.name || '');
  const idx = createRef<number>(`/${plugin.props.id}/${detail.id}`, 'index', 0);

  const handlePlay = () => {
    usePlayerWindowStore().openPlayerWindow(plugin.props, detail).then(() => {
      dp.destroy?.();
    }).catch(console.error);
  }
  
  const dp =  DrawerPlugin({
    header: detail.title,
    size: '600px',
    footer: false,
    default: () => (
      <div class="pb-16px">

        {/* 海报和基本信息 */}
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-200px overflow-hidden">
            <Image
              src={detail.cover || "./movie.svg"}
              alt={detail.title}
              fit={'cover'}
              class="rounded-lg"
            />
          </div>
          <div class="flex-1 space-y-3">
            <div>
              <h1 class="text-xl font-bold leading-tight">{detail.title}</h1>
              <p class="text-sm text-muted-foreground">{detail.subtitle}</p>
            </div>

            <div class="flex gap-1 flex-wrap">
              {detail.types.filter(isNotEmptyString).map((genre) => (
                <Tag key={genre} variant={"outline"} theme={'primary'} shape={'round'}>
                  {genre}
                </Tag>
              ))}
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div class="flex items-center gap-1">
                <CalendarIcon class="h-3 w-3"/>
                <span>{detail.releaseYear}</span>
              </div>
              <div class="flex items-center gap-1">
                <TimeIcon class="h-3 w-3"/>
                <span>{detail.duration}</span>
              </div>
              <div class="flex items-center gap-1">
                <Location1Icon class="h-3 w-3"/>
                <span>{detail.region}</span>
              </div>
              <div class="flex items-center gap-1">
                <UsergroupIcon class="h-3 w-3"/>
                <span>{detail.language}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div class="flex gap-2 mt-16px">
          <Button theme={'primary'} class="flex-1 gap-2" onClick={handlePlay}>{{
            icon: () => <PlayIcon class="h-4 w-4"/>,
            default: () => <span>立即播放</span>
          }}</Button>
          <Button theme={'primary'} variant="outline" shape={'square'}>
            <PlusIcon class="h-4 w-4"/>
          </Button>
          <Button theme={'primary'} variant="outline" shape={'square'}>
            <HeartIcon class="h-4 w-4"/>
          </Button>
          <Button theme={'primary'} variant="outline" shape={'square'}>
            <ShareIcon class="h-4 w-4"/>
          </Button>
        </div>

        <Divider/>

        {/* 剧情简介 */}
        <div class="space-y-3 mt-8px">
          <h3 class="font-semibold">剧情简介</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">{detail.blurb}</p>
        </div>

        <Divider/>

        {/* 影片信息 */}
        <div class="space-y-3">
          <h3 class="font-semibold">影片信息</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">导演：</span>
              <span class="text-right">{detail.writers.join("、")}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">主演：</span>
              <span class="text-right max-w-[300px]">{detail.actors.join("、")}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">语言：</span>
              <span class="text-right">{detail.language}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">制片国家：</span>
              <span class="text-right">{detail.region}</span>
            </div>
          </div>
        </div>

        <Divider/>

        {/* 播放源 */}
        {detail.playUrls && detail.playUrls.length > 0 && (
          <>
            <div class="space-y-3">
              <h3 class="font-semibold">播放源</h3>
              <div class="space-y-2">
                <Tabs defaultValue={chapterId.value} class="w-full">
                  {detail.playUrls.map((source, index) => (
                    <TabPanel key={index} label={source.name} value={source.id}>
                      <div class="mt-8px flex justify-start items-start flex-wrap content-start gap-8px">
                        {source.items.map((item, i) => (
                          (source.id === chapterId.value && i === idx.value) ? <div style={{
                              backgroundColor: 'var(--td-bg-color-component-active)',
                              lineHeight: '24px',
                              textAlign: 'center',
                              borderRadius: 'var(--td-radius-default)',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              color: 'var(--td-success-color)'
                            }}>{item.name}</div> :
                            <div style={{
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
      </div>
    ),
  })
}