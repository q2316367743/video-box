import { DirItem } from "@/apis/plugin/disk/list";
import { DialogPlugin, Descriptions, DescriptionsItem, Tag } from "tdesign-vue-next";
import { prettyDataUnit, toDateTimeString } from "@/utils/lang/FormatUtil";
import FileIconView from "@/pages/disk/info/components/FileIconView.vue";
import "./DirItemInfoDialog.less";

export function openDirItemInfoDialog(item: DirItem) {
    const dialogInstance = DialogPlugin({
        header: "文件属性",
        width: 800,
        draggable: true,
        placement: "center",
        footer: false,
        default: () => (
            <div class={'dir-item-info-dialog'}>
                {/* 文件图标和名称区域 */}
                <div class="file-header">
                    <div class="file-icon-large">
                        <FileIconView
                            type={item.type}
                            extname={item.extname}
                            size="48px"
                        />
                    </div>
                    <div class="file-name-info">
                        <div class="file-name" title={item.name}>
                            {item.name}
                        </div>
                        <div class="file-type">
                            <Tag variant="light" theme="primary">
                                {getFileTypeText(item)}
                            </Tag>
                        </div>
                    </div>
                </div>

                {/* 基本信息区域 */}
                <div class="file-details">
                    <Descriptions title="基本信息" bordered>
                        <DescriptionsItem label="类型">
                            {getFileTypeText(item)}
                        </DescriptionsItem>
                        {item.size !== undefined && (
                            <DescriptionsItem label="大小">
                                <div class="file-size">
                                    {prettyDataUnit(item.size)}
                                    <span class="size-bytes">({item.size.toLocaleString()} 字节)</span>
                                </div>
                            </DescriptionsItem>
                        )}
                        <DescriptionsItem label="路径" span={12}>
                            <div class="file-path" title={item.path}>
                                {item.path}
                            </div>
                        </DescriptionsItem>
                        <DescriptionsItem label="所在目录" span={12}>
                            <div class="file-folder" title={item.folder}>
                                {item.folder}
                            </div>
                        </DescriptionsItem>
                        {item.lastModified && (
                            <DescriptionsItem label="修改时间">
                                {formatDateTime(item.lastModified)}
                            </DescriptionsItem>
                        )}
                        {item.extname && (
                            <DescriptionsItem label="扩展名">
                                <Tag variant="outline">.{item.extname}</Tag>
                            </DescriptionsItem>
                        )}
                    </Descriptions>

                    {/* 扩展信息 */}
                    {item.expands && Object.keys(item.expands).length > 0 && (
                        <div class="expand-info">
                            <Descriptions title="扩展信息" bordered>
                                {Object.entries(item.expands).map(([key, value]) => (
                                    <DescriptionsItem key={key} label={key}>
                                        {String(value)}
                                    </DescriptionsItem>
                                ))}
                            </Descriptions>
                        </div>
                    )}
                </div>
            </div>
        ),
        onConfirm: () => {
            dialogInstance.destroy();
        },
        onClose: () => {
            dialogInstance.destroy();
        }
    });
}

// 获取文件类型文本
function getFileTypeText(item: DirItem): string {
    if (item.type === 'folder') {
        return '文件夹';
    } else if (item.type === 'file') {
        if (item.extname) {
            return `${item.extname.toUpperCase()} 文件`;
        }
        return '文件';
    }
    return '未知类型';
}

// 格式化日期时间
function formatDateTime(dateTime: number | string): string {
    try {
        return toDateTimeString(dateTime);
    } catch (error) {
        return String(dateTime);
    }
}
