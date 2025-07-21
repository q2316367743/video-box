export interface EmbyAuthenticateByName {
  User: User;
  SessionInfo: SessionInfo;
  AccessToken: string;
  ServerId: string;
}

interface SessionInfo {
  PlayState: PlayState;
  AdditionalUsers: any[];
  RemoteEndPoint: string;
  Protocol: string;
  PlayableMediaTypes: any[];
  PlaylistIndex: number;
  PlaylistLength: number;
  Id: string;
  ServerId: string;
  UserId: string;
  UserName: string;
  Client: string;
  LastActivityDate: string;
  DeviceName: string;
  InternalDeviceId: number;
  DeviceId: string;
  ApplicationVersion: string;
  SupportedCommands: any[];
  SupportsRemoteControl: boolean;
}

interface PlayState {
  CanSeek: boolean;
  IsPaused: boolean;
  IsMuted: boolean;
  RepeatMode: string;
  SleepTimerMode: string;
  SubtitleOffset: number;
  Shuffle: boolean;
  PlaybackRate: number;
}

interface User {
  Name: string;
  ServerId: string;
  Prefix: string;
  DateCreated: string;
  Id: string;
  HasPassword: boolean;
  HasConfiguredPassword: boolean;
  LastLoginDate: string;
  LastActivityDate: string;
  Configuration: Configuration;
  Policy: Policy;
  HasConfiguredEasyPassword: boolean;
}

interface Policy {
  IsAdministrator: boolean;
  IsHidden: boolean;
  IsHiddenRemotely: boolean;
  IsHiddenFromUnusedDevices: boolean;
  IsDisabled: boolean;
  LockedOutDate: number;
  AllowTagOrRating: boolean;
  BlockedTags: any[];
  IsTagBlockingModeInclusive: boolean;
  IncludeTags: any[];
  EnableUserPreferenceAccess: boolean;
  AccessSchedules: any[];
  BlockUnratedItems: any[];
  EnableRemoteControlOfOtherUsers: boolean;
  EnableSharedDeviceControl: boolean;
  EnableRemoteAccess: boolean;
  EnableLiveTvManagement: boolean;
  EnableLiveTvAccess: boolean;
  EnableMediaPlayback: boolean;
  EnableAudioPlaybackTranscoding: boolean;
  EnableVideoPlaybackTranscoding: boolean;
  EnablePlaybackRemuxing: boolean;
  EnableContentDeletion: boolean;
  RestrictedFeatures: any[];
  EnableContentDeletionFromFolders: any[];
  EnableContentDownloading: boolean;
  EnableSubtitleDownloading: boolean;
  EnableSubtitleManagement: boolean;
  EnableSyncTranscoding: boolean;
  EnableMediaConversion: boolean;
  EnabledChannels: any[];
  EnableAllChannels: boolean;
  EnabledFolders: any[];
  EnableAllFolders: boolean;
  InvalidLoginAttemptCount: number;
  EnablePublicSharing: boolean;
  RemoteClientBitrateLimit: number;
  AuthenticationProviderId: string;
  ExcludedSubFolders: any[];
  SimultaneousStreamLimit: number;
  EnabledDevices: any[];
  EnableAllDevices: boolean;
  AllowCameraUpload: boolean;
  AllowSharingPersonalItems: boolean;
}

interface Configuration {
  PlayDefaultAudioTrack: boolean;
  DisplayMissingEpisodes: boolean;
  SubtitleMode: string;
  OrderedViews: any[];
  LatestItemsExcludes: any[];
  MyMediaExcludes: any[];
  HidePlayedInLatest: boolean;
  HidePlayedInMoreLikeThis: boolean;
  HidePlayedInSuggestions: boolean;
  RememberAudioSelections: boolean;
  RememberSubtitleSelections: boolean;
  EnableNextEpisodeAutoPlay: boolean;
  ResumeRewindSeconds: number;
  IntroSkipMode: string;
  EnableLocalPassword: boolean;
}