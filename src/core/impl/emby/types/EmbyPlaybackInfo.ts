export interface EmbyPlaybackInfo {
  MediaSources: MediaSource[];
  PlaySessionId: string;
}

interface MediaSource {
  Chapters: Chapter[];
  Protocol: string;
  Id: string;
  Path: string;
  Type: string;
  Container: string;
  Size: number;
  Name: string;
  IsRemote: boolean;
  HasMixedProtocols: boolean;
  RunTimeTicks: number;
  SupportsTranscoding: boolean;
  SupportsDirectStream: boolean;
  SupportsDirectPlay: boolean;
  IsInfiniteStream: boolean;
  RequiresOpening: boolean;
  RequiresClosing: boolean;
  RequiresLooping: boolean;
  SupportsProbing: boolean;
  MediaStreams: MediaStream[];
  Formats: any[];
  Bitrate: number;
  RequiredHttpHeaders: RequiredHttpHeaders;
  DirectStreamUrl: string;
  AddApiKeyToDirectStreamUrl: boolean;
  ReadAtNativeFramerate: boolean;
  DefaultAudioStreamIndex: number;
  ItemId: string;
}

interface RequiredHttpHeaders {
}

interface MediaStream {
  Codec: string;
  CodecTag: string;
  Language: string;
  TimeBase: string;
  VideoRange?: string;
  DisplayTitle: string;
  NalLengthSize?: string;
  IsInterlaced: boolean;
  BitRate: number;
  BitDepth?: number;
  RefFrames?: number;
  IsDefault: boolean;
  IsForced: boolean;
  IsHearingImpaired: boolean;
  Height?: number;
  Width?: number;
  AverageFrameRate?: number;
  RealFrameRate?: number;
  Profile: string;
  Type: string;
  AspectRatio?: string;
  Index: number;
  IsExternal: boolean;
  IsTextSubtitleStream: boolean;
  SupportsExternalStream: boolean;
  Protocol: string;
  PixelFormat?: string;
  Level?: number;
  IsAnamorphic?: boolean;
  ExtendedVideoType: string;
  ExtendedVideoSubType: string;
  ExtendedVideoSubTypeDescription: string;
  AttachmentSize: number;
  ChannelLayout?: string;
  Channels?: number;
  SampleRate?: number;
}

interface Chapter {
  StartPositionTicks: number;
  Name: string;
  MarkerType: string;
  ChapterIndex: number;
}