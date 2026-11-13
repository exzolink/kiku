import { createMemo, createSignal, lazy, Match, onMount, Show, Switch } from "solid-js";
import { isServer } from "solid-js/web";
import { useCardContext } from "#/src/contexts/CardContext";
import { useLoadPlugin } from "#/src/hooks/plugin";
import { FieldGroupPaginationSection } from "./FieldGroupPaginationSection";
import { PictureSection } from "./PictureSection";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { useConfigContext } from "#/src/contexts/ConfigContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";
import { ExpressionSection } from "./ExpressionSection";
import { HeaderLayout } from "./HeaderLayout";

// oxfmt-ignore
const Lazy = {
  AudioButtons: lazy(async () => ({ default: (await import("#/src/lazy")).AudioButtons })),
  AudioElements: lazy(async () => ({ default: (await import("#/src/lazy")).AudioElements })),
  HeaderMain: lazy(async () => ({ default: (await import("#/src/lazy")).HeaderMain })),
  FieldGroupPagination: lazy(async () => ({ default: (await import("#/src/lazy")).FieldGroupPagination, })),
  UseAnkiDroid: lazy(async () => ({ default: (await import("#/src/lazy")).UseAnkiDroid })),
  Sentence: lazy(async () => ({ default: (await import("#/src/lazy")).Sentence })),
  Expression: lazy(async () => ({ default: (await import("#/src/lazy")).Expression })),
  Settings: lazy(async () => ({ default: (await import("#/src/lazy")).Settings })),
  CardEnd: lazy(async () => ({ default: (await import("#/src/lazy")).CardEnd })),
  PictureModal: lazy(async () => ({ default: (await import("#/src/lazy")).PictureModal })),
  DefinitionPicture: lazy(async () => ({ default: (await import("#/src/lazy")).DefinitionPicture })),
};

export function Front() {
  const { $card, $setCard, $isInitialSide, nested } = useCardContext();
  const { $ankiFields } = useAnkiFieldContext();
  const [$hideExpression, $setHideExpression] = createSignal(false);
  const { $config } = useConfigContext();
  const { logger } = useGeneralContext();
  const loadPlugin = useLoadPlugin();
  const $hidden = createMemo(() => isServer);

  onMount(() => {
    setTimeout(() => {
      $setCard("ready", true);
      logger.info("[Front] ready, expression:", $ankiFields.Expression);
      loadPlugin();
    }, 0);

    if ($config.modHidden) {
      setTimeout(() => {
        $setHideExpression(true);
      }, $config.modHiddenDuration);
    }
  });

  return (
    <>
      {$card.ready && !nested && <Lazy.UseAnkiDroid />}
      <Switch>
        <Match when={$card.page === "settings" && $card.ready}>
          <Lazy.Settings />
        </Match>
        <Match when={$card.page === "main"}>
          <HeaderLayout>{$card.ready && <Lazy.HeaderMain />}</HeaderLayout>
          <div class="flex flex-col">
            <div
              class="expression-picture-box tappable"
              on:click={() => {
                if (!$isInitialSide()) return;
                $setHideExpression(false);
              }}
              on:touchend={(e) => e.stopPropagation()}
            >
              <div class="expression-audio-box">
                <ExpressionSection hideExpression={$hideExpression()} />
                <Show when={!$isInitialSide()}>
                  <div class="hidden sm:block sm:h-7 sm:mt-1">
                    {$card.ready && (
                      <div class="flex gap-2">
                        <Lazy.AudioButtons position={1} />
                      </div>
                    )}
                  </div>
                </Show>
              </div>
              <PictureSection />
            </div>
            {$card.ready && !$hidden() && <FieldGroupPaginationSection />}
          </div>
          <div
            class="flex flex-col gap-4 items-center text-center justify-center"
            classList={{
              "opacity-0": $hideExpression() && $isInitialSide(),
            }}
          >
            {$card.ready && !$hidden() && <Lazy.Sentence />}
            {$card.ready && !$hidden() && <Lazy.DefinitionPicture />}
          </div>
          {$card.ready && (
            <Show when={!$isInitialSide()}>
              <Lazy.AudioButtons position={2} />
            </Show>
          )}
          {$card.ready && <Lazy.CardEnd />}
        </Match>
      </Switch>
      {$card.ready && <Lazy.PictureModal />}
      {$card.ready && <Lazy.AudioElements />}
    </>
  );
}
