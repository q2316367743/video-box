import {LocalNameEnum} from "@/global/LocalNameEnum.js";
import {defaultBaseSetting} from "@/entities/BaseSetting.js";

export const useBaseSettingStore = useLocalStorage(LocalNameEnum.KEY_SETTING_BASE, defaultBaseSetting);