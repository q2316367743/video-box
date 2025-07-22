import {DrawerPlugin, List, ListItem, ListItemMeta, Space, Tag} from "tdesign-vue-next";
import {sourceTvInfo} from "@/apis/source/tv.js";

export async function openDispositionInfo(id: string) {
  const info = await sourceTvInfo(id);
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
