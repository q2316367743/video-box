export interface EmbyItems {
  Items: Item[];
  TotalRecordCount: number;
}

interface Item {
  Name: string;
  ServerId: string;
  Id: string;
  CanDelete: boolean;
  CanDownload: boolean;
  SupportsSync: boolean;
  RunTimeTicks: number;
  ProductionYear: number;
  IsFolder: boolean;
  Type: string;
  UserData: UserData;
  PrimaryImageAspectRatio: PlayedPercentage;
  ImageTags: ImageTags;
  BackdropImageTags: string[];
  MediaType: string;
}

interface ImageTags {
  Primary: string;
  Thumb: string;
}

interface UserData {
  PlayedPercentage?: PlayedPercentage;
  PlaybackPositionTicks: number;
  PlayCount: number;
  IsFavorite: boolean;
  Played: boolean;
}

interface PlayedPercentage {
  s: number;
  e: number;
  c: number[];
}