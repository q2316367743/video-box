export interface EmbyItemInfo {
  Name: string;
  ServerId: string;
  Id: string;
  Etag: string;
  DateCreated: string;
  CanDelete: boolean;
  CanDownload: boolean;
  SortName: string;
  PremiereDate: string;
  ExternalUrls: any[];
  Path: string;
  EnableMediaSourceDisplay: boolean;
  ChannelId?: any;
  Taglines: any[];
  Genres: string[];
  CumulativeRunTimeTicks: number;
  RunTimeTicks: number;
  PlayAccess: string;
  ProductionYear: number;
  RemoteTrailers: any[];
  ProviderIds: ProviderIds;
  IsFolder: boolean;
  ParentId: string;
  Type: string;
  People: any[];
  Studios: any[];
  GenreItems: any[];
  ParentBackdropItemId: string;
  ParentBackdropImageTags: string[];
  LocalTrailerCount: number;
  UserData: UserData;
  RecursiveItemCount: number;
  ChildCount: number;
  SpecialFeatureCount: number;
  DisplayPreferencesId: string;
  Tags: any[];
  PrimaryImageAspectRatio: number;
  Artists: string[];
  ArtistItems: ArtistItem[];
  AlbumArtist: string;
  AlbumArtists: ArtistItem[];
  ImageTags: ImageTags;
  BackdropImageTags: any[];
  ImageBlurHashes: ImageBlurHashes;
  LocationType: string;
  LockedFields: any[];
  LockData: boolean;
  OfficialRating?: string;
}

interface ImageBlurHashes {
  Primary: Primary;
  Backdrop: Backdrop;
}

interface Backdrop {
  '17c8f1f8c484ca3f6f9dee5102176e1e': string;
}

interface Primary {
  b9a921b8a933b371c1075b3c9d046352: string;
}

interface ImageTags {
  Primary: string;
}

interface ArtistItem {
  Name: string;
  Id: string;
}

interface UserData {
  PlaybackPositionTicks: number;
  PlayCount: number;
  IsFavorite: boolean;
  Played: boolean;
  Key: string;
}

interface ProviderIds {
}