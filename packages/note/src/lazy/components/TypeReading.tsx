import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { useCardContext } from "#/src/contexts/CardContext";
import { useConfigContext } from "#/src/contexts/ConfigContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";

export function TypeReading() {
  const { $config } = useConfigContext();
  const { $general } = useGeneralContext();
  const { initialAnkiFields, $isInitialAnkiFields } = useAnkiFieldContext();
  const { $card, $initialSide, $isInitialSide } = useCardContext();

  const cardId = initialAnkiFields.CardID;
  const expected = initialAnkiFields.ExpressionReading?.trim() ?? "";
  const storageKey = `type-reading-${cardId}`;

  const [$value, $setValue] = createSignal("");
  const [$hasLoaded, $setHasLoaded] = createSignal(false);
  const [$inputRef, $setInputRef] = createSignal<HTMLInputElement>();
  const [$banner, $setBanner] = createSignal<"ok" | "err" | null>(null);
  const [$headerMount, $setHeaderMount] = createSignal<Element>();

  const $enabled = createMemo(
    () => $config.typeReading && $isInitialAnkiFields() && Boolean(expected),
  );
  const $showInput = createMemo(
    () => $enabled() && $initialSide() === "front" && $isInitialSide(),
  );

  onMount(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved !== null) $setValue(saved);
    $inputRef()?.focus();
    $setHasLoaded(true);
    $setHeaderMount($general.root?.querySelector("[data-type-reading-banner]") ?? undefined);

    if ($enabled() && $card.side === "back") {
      $setBanner($value().trim() === expected ? "ok" : "err");
      const timeout = setTimeout(() => $setBanner(null), 2000);
      onCleanup(() => clearTimeout(timeout));
    }
  });

  createEffect(() => {
    if (!$hasLoaded() || !$showInput()) return;
    sessionStorage.setItem(storageKey, $value());
  });

  return (
    <>
      <Show when={$showInput()}>
        <div class="mt-2 flex flex-col items-center">
          <input
            type="text"
            class="input input-bordered w-full max-w-xs text-center font-japanese-text"
            lang="ja"
            placeholder="Введите чтение…"
            value={$value()}
            ref={$setInputRef}
            on:input={(e) => $setValue(e.currentTarget.value)}
            on:keydown={(e) => {
              e.stopPropagation();
              if (e.isComposing || e.key === "Process" || e.keyCode === 229) return;
              if (e.key === "Enter" && typeof pycmd !== "undefined") pycmd("ans");
            }}
          />
        </div>
      </Show>
      <Show when={$banner()}>
        <Show when={$headerMount()}>
          {(mount) => (
            <Portal mount={mount()}>
              <div
                class="px-2 py-0.5 rounded-field text-xs font-medium leading-none"
                classList={{
                  "bg-success text-success-content": $banner() === "ok",
                  "bg-error text-error-content": $banner() === "err",
                }}
              >
                {$banner() === "ok" ? "Верно" : "Ошибка"}
              </div>
            </Portal>
          )}
        </Show>
      </Show>
    </>
  );
}
