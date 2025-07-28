import {LocalNameEnum} from "@/global/LocalNameEnum";
import {defaultBaseSetting} from "@/entities/BaseSetting";

export const useBaseSettingStore = useLocalStorage(LocalNameEnum.KEY_SETTING_BASE, defaultBaseSetting);