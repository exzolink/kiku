import type { JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { useGeneralContext } from "#/src/contexts/GeneralContext";

export function Layout(props: { children: JSX.Element }) {
  const { $general, $setGeneral, isAnkiWeb } = useGeneralContext();

  return (
    <div
      ref={(ref) => $setGeneral("layoutRef", ref)}
      class="font-cyrillic relative"
      lang="ru"
    >
      <div
        class="flex flex-col gap-2 sm:gap-4 p-2 sm:p-4 sm:pt-0 pt-0 bg-base-100 min-h-full mx-auto pb-24 sm:pb-4 layout-max-width"
        ref={(ref) => $setGeneral("contentRef", ref)}
      >
        {props.children}
      </div>
      <Portal mount={$general.layoutRef}>
        {$general.toast.message && (
          <div
            class="toast toast-top toast-center z-50"
            classList={{
              absolute: isAnkiWeb,
            }}
          >
            <div
              class="alert"
              classList={{
                "alert-error": $general.toast.type === "error",
                "alert-success": $general.toast.type === "success",
              }}
            >
              <span>{$general.toast.message}</span>
            </div>
          </div>
        )}
      </Portal>
    </div>
  );
}
