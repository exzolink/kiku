import { createMemo, For, Show } from "solid-js";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { parseHtml } from "#/src/lib/dom";

export function FrequencyBadges() {
  const { $ankiFields } = useAnkiFieldContext();
  const $frequencies = createMemo(() => {
    const html = $ankiFields.Frequency?.trim() ?? "";
    if (!html) return [];
    return Array.from(parseHtml(html).querySelectorAll("li"))
      .map((item) => item.textContent?.replace(/\u00a0/g, " ").trim() ?? "")
      .filter(Boolean);
  });

  return (
    <Show when={$frequencies().length}>
      <div class="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="flex gap-1.5 sm:gap-2 items-center justify-start sm:justify-center flex-nowrap w-max min-w-full sm:min-w-0 sm:flex-wrap sm:w-auto mx-auto">
          <For each={$frequencies()}>
            {(frequency) => (
              <div class="badge badge-secondary shrink-0 h-5 min-h-5 px-1.5 text-xs sm:h-6 sm:min-h-6 sm:px-2.5 sm:text-sm">
                {frequency}
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}
