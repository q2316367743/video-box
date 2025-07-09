import {useLiveSourceStore} from "@/store";
import {DrawerPlugin, List, ListItem, ListItemMeta, Space, Tag} from "tdesign-vue-next";

export async function openDispositionInfo(id: number) {
  const info = await useLiveSourceStore().getChannel(id);
  DrawerPlugin({
    header: info.name,
    size: '75%',
    footer: false,
    default: () => <List split={true}>
      {info.channels.map((item) => <ListItem>
        <ListItemMeta title={item.name} description={item.url} image={item.logo}></ListItemMeta>
        <Space>
          <Tag>{item.group}</Tag>
        </Space>
      </ListItem>)}
    </List>
  });
}
