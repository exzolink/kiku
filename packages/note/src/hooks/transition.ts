import { useCardContext } from "#/src/contexts/CardContext";
import { useConfigContext } from "#/src/contexts/ConfigContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";
import { daisyUIThemes, type DaisyUITheme } from "#/src/lib/theme";

export function useViewTransition() {
  function startViewTransition(callback: () => void, _opts: { beforeCallback?: () => void } = {}) {
    callback();
  }
  return startViewTransition;
}

export function useNavigationTransition() {
  const { $card, $setCard } = useCardContext();

  function navigate(
    destination: "main" | "settings" | "nested" | "kanji" | (() => void),
    _direction: "back" | "forward",
    navigateBack?: () => void,
  ) {
    if (navigateBack) $setCard("navigateBack", (old) => [...old, navigateBack]);
    if (typeof destination === "function") {
      destination();
    } else {
      $setCard("page", destination);
    }
  }
  function navigateBack() {
    const last = $card.navigateBack[$card.navigateBack.length - 1];
    $setCard("navigateBack", (list) => list.slice(0, -1));
    last?.();
  }

  return { navigate, navigateBack };
}

export function useThemeTransition() {
  const { initialDarkMode } = useGeneralContext();
  const { $config, $setConfig } = useConfigContext();

  function $changeTheme(theme: DaisyUITheme, mode: "light" | "dark") {
    const key = mode === "dark" ? "themeDark" : "theme";
    $setConfig(key, theme);
  }

  function $changeThemeNext() {
    const current = initialDarkMode ? $config.themeDark : $config.theme;
    const index = daisyUIThemes.indexOf(current);
    const nextTheme = daisyUIThemes[(index + 1) % daisyUIThemes.length];
    $changeTheme(nextTheme, initialDarkMode ? "dark" : "light");
  }

  return { $changeTheme, $changeThemeNext };
}

export function usePictureModalTransition() {
  const { $setCard } = useCardContext();

  function $setPictureModal(img: string | undefined) {
    $setCard("pictureModal", img);
  }

  return { $setPictureModal };
}
