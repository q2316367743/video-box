import {SelectOption} from "tdesign-vue-next";

export enum SourceWebTypeEnum {
  CMS_JSON = 1,
  CMS_XML = 2,
  EMBY = 3,
  JELLYFIN = 4,
}

export const sourceWebTypeOptions: Array<SelectOption> = [{
  label: 'CMS (JSON)',
  value: SourceWebTypeEnum.CMS_JSON
}, {
  label: 'CMS (XML)',
  value: SourceWebTypeEnum.CMS_XML
}, {
  label: 'Emby',
  value: SourceWebTypeEnum.EMBY,
  disabled: true
}]