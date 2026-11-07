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
      <div class="flex gap-2 items-center justify-center flex-wrap">
        <For each={$frequencies()}>
          {(frequency) => <div class="badge badge-secondary">{frequency}</div>}
        </For>
      </div>
    </Show>
  );
}
