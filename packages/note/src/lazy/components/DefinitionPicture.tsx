import { createMemo, For, Show } from "solid-js";
import { parseHtml } from "#/src/lib/dom";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { usePictureModalTransition } from "#/src/hooks/transition";

export function DefinitionPicture() {
  const { $ankiFields } = useAnkiFieldContext();
  const { $setPictureModal } = usePictureModalTransition();

  const $pictures = createMemo(() => {
    const html = $ankiFields.DefinitionPicture?.trim() ?? "";
    if (!html) return [];
    const doc = parseHtml(html);
    const nodes = Array.from(doc.querySelectorAll("img, svg"));
    if (nodes.length > 0) {
      return nodes.map((node) => node.outerHTML);
    }
    if (/<(?:img|svg)\b/i.test(html)) return [html];
    return [];
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
