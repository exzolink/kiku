import { Show } from "solid-js";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";

export function Pitches() {
  const { $ankiFields } = useAnkiFieldContext();

  return (
    <Show when={$ankiFields.PitchPosition}>
      <div
        class="pitch-diagram font-japanese-text text-pitch [&_svg]:block [&_svg]:max-h-10 sm:[&_svg]:max-h-12"
        lang="ja"
        innerHTML={$ankiFields.PitchPosition}
      />
    </Show>
  );
}
