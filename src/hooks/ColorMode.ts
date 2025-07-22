type ColorModeType = 'auto' | 'light' | 'dark';

interface ColorModeResult {
  colorMode: Ref<ColorModeType>;
  isDark: ComputedRef<boolean>;
}

const isDarkColors = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const useColorMode = (): ColorModeResult => {
  const colorMode = ref<ColorModeType>((localStorage.getItem('/key/color-mode') as any) || 'auto');
  const isDark = computed(() => {
    if (colorMode.value === 'dark') {
      return true;
    } else if (colorMode.value === 'light') {
      return false;
    }
    return isDarkColors();
  });

  function onAutoColor() {
    if (colorMode.value != 'auto') {
      return;
    }
    document.documentElement.setAttribute("theme-mode", isDarkColors() ? 'dark' : 'light');

  }

  window.matchMedia("(prefers-color-scheme:dark)").addEventListener("change", onAutoColor);

  function renderColorMode() {
    if (colorMode.value === 'light') {
      document.documentElement.setAttribute("theme-mode", "light");
    } else if (colorMode.value === 'dark') {
      document.documentElement.setAttribute("theme-mode", "dark");
    } else {
      document.documentElement.setAttribute("theme-mode", isDarkColors() ? 'dark' : 'light');
    }
  }

  renderColorMode();

  watch(colorMode, val => {
    localStorage.setItem('/key/color-mode', val);
    renderColorMode();
  });

  return {colorMode, isDark}

}