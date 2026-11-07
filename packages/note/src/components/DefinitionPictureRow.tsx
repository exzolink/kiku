import { createMemo, For, Show } from "solid-js";
import { isServer } from "solid-js/web";
import { parseHtml } from "#/src/lib/dom";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { usePictureModalTransition } from "#/src/hooks/transition";

export function DefinitionPictureRow() {
  const { $ankiFields } = useAnkiFieldContext();
  const { $setPictureModal } = usePictureModalTransition();

  const $pictures = createMemo(() => {
    if (isServer) return [];
    const doc = parseHtml($ankiFields.DefinitionPicture);
    return Array.from(doc.querySelectorAll("img")).map((img) => img.outerHTML);
  });

  return (
    <Show when={$pictures().length > 0}>
      <div class="flex flex-wrap justify-center items-end gap-2 sm:gap-3 w-full [&_img]:max-h-16 sm:[&_img]:max-h-20 [&_img]:w-auto [&_img]:object-contain [&_img]:rounded-sm [&_svg]:max-h-16 sm:[&_svg]:max-h-20 [&_svg]:w-auto">
        <For each={$pictures()}>
          {(html) => (
            <div
              class="cursor-pointer tappable shrink-0"
              on:click={() => $setPictureModal(html)}
              on:touchend={(e) => e.stopPropagation()}
              innerHTML={html}
            />
          )}
        </For>
      </div>
    </Show>
  );
}
