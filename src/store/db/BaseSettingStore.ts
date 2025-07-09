import {useUtoolsDbStorage} from "@/hooks/UtoolsObjStorage";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {defaultBaseSetting} from "@/entities/BaseSetting";

export const useBaseSettingStore = useUtoolsDbStorage(LocalNameEnum.KEY_SETTING_BASE, defaultBaseSetting);