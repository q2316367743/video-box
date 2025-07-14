import {useUtoolsColorMode} from "@/hooks/ColorMode";

export const detach = ref(utools.getWindowType() !== 'main')

export const {isDark, colorMode} = useUtoolsColorMode();