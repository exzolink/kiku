import { createMemo, Show } from "solid-js";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";

export function FreqSortBadge() {
  const { $ankiFields } = useAnkiFieldContext();
  const $freqSort = createMemo(() => $ankiFields.FreqSort?.trim() ?? "");

  return (
    <Show when={$freqSort() && $freqSort() !== "9999999"}>
      <div class="badge badge-outline badge-secondary h-5 min-h-5 px-1.5 text-xs">
        {$freqSort()}
      </div>
    </Show>
  );
}
