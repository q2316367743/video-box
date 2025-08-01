declare module 'aplayer' {
    export interface Music {
        // 歌曲名
        name: string;
        // 艺术家
        artist: string;
        // 链接
        url: string;
        // 封面
        cover: string;
        // 歌词
        lrc?: string;
    }

    export interface APlayerOption {
        container: HTMLElement | null | undefined;
        fixed?: boolean;
        audio: Array<Music>;
        autoplay?: boolean;
        preload?: 'none' | 'metadata' | 'auto';
        loop?: 'all' | 'one' | 'none';
        order?: 'list' | 'random';
        listMaxHeight?: string;
        /**
         * 歌词类型：1、JS字符串，2、HTML，3、url
         */
        lrcType?: 1|2|3;
    }

    export default class APlayer {
        constructor(option: APlayerOption);

        play();

        pause();

        destroy();

        list: {
            audios: Array<Music>
            //显示播放列表
            show();
            // 隐藏播放列表
            hide();
            // 显示/隐藏播放列表
            toggle();
            // 添加一个或几个新音频到播放列表
            add(audios: Array<Music> | Music);
            // 移除播放列表中的一个音频
            remove(index: number);
            // 切换到播放列表里的其他音频
            switch(index: number);
            //清空播放列表
            clear();
        };

        on(name: string, callback: (e: any) => void): void;

        setMode(mode: 'mini' | 'normal')

        audio: HTMLAudioElement

        mode: 'mini' | 'normal'
    }
}
