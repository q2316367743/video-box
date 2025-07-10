export interface EmbyView {
  Items: Item[];
  TotalRecordCount: number;
}

interface Item {
  Name: string;
  ServerId: string;
  Id: string;
  Guid: string;
  Etag: string;
  DateCreated: string;
  CanDelete: boolean;
  CanDownload: boolean;
  PresentationUniqueKey: string;
  SortName: string;
  ForcedSortName: string;
  ExternalUrls: any[];
  Taglines: any[];
  RemoteTrailers: any[];
  ProviderIds: ProviderIds;
  IsFolder: boolean;
  ParentId: string;
  Type: string;
  UserData: UserData;
  ChildCount: number;
  DisplayPreferencesId: string;
  CollectionType: string;
  ImageTags: ImageTags;
  BackdropImageTags: any[];
  LockedFields: any[];
  LockData: boolean;
  PrimaryImageAspectRatio?: PrimaryImageAspectRatio;
}

interface PrimaryImageAspectRatio {
  s: number;
  e: number;
  c: number[];
}

interface ImageTags {
  Primary?: string;
}

interface UserData {
  PlaybackPositionTicks: number;
  IsFavorite: boolean;
  Played: boolean;
}

interface ProviderIds {
}