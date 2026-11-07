import { createMemo, lazy, Match, onMount, Switch } from "solid-js";
import { isServer } from "solid-js/web";
import { CardStoreContextProvider, useCardContext } from "#/src/contexts/CardContext";
import type { DatasetProp } from "#/src/lib/config";
import { isNsfw } from "#/src/lib/util";
import { useLoadPlugin } from "#/src/hooks/plugin";
import { useNavigationTransition } from "#/src/hooks/transition";
import { FieldGroupPaginationSection } from "./FieldGroupPaginationSection";
import { PictureSection } from "./PictureSection";
import { AnkiFieldContextProvider, useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { CtxContextProvider } from "#/src/contexts/CtxContext";
import { FieldGroupContextProvider } from "#/src/contexts/FieldGroupContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";
import { usePitch } from "#/src/hooks/pitch";
import { ExpressionSection } from "./ExpressionSection";
import { HeaderLayout } from "./HeaderLayout";

// oxfmt-ignore
const Lazy = {
  Settings: lazy(async () => ({ default: (await import("#/src/lazy")).Settings })),
  CardEnd: lazy(async () => ({ default: (await import("#/src/lazy")).CardEnd })),
  HeaderMain: lazy(async () => ({ default: (await import("#/src/lazy")).HeaderMain })),
  BackFooter: lazy(async () => ({ default: (await import("#/src/lazy")).BackFooter })),
  AudioButtons: lazy(async () => ({ default: (await import("#/src/lazy")).AudioButtons })),
  AudioElements: lazy(async () => ({ default: (await import("#/src/lazy")).AudioElements })),
  PictureModal: lazy(async () => ({ default: (await import("#/src/lazy")).PictureModal })),
  BackBody: lazy(async () => ({ default: (await import("#/src/lazy")).BackBody })),
  Pitches: lazy(async () => ({ default: (await import("#/src/lazy")).Pitches })),
  KanjiPage: lazy(async () => ({ default: (await import("#/src/lazy")).KanjiPage })),
  UseAnkiDroid: lazy(async () => ({ default: (await import("#/src/lazy")).UseAnkiDroid })),
  Expression: lazy(async () => ({ default: (await import("#/src/lazy")).Expression })),
  AnkiMobileDebug: lazy(async () => ({ default: (await import("#/src/lazy")).AnkiMobileDebug })),
  RelatedExpression: lazy(async () => ({ default: (await import("#/src/lazy")).RelatedExpression, })),
};

export function Back(props: { onExitNested?: () => void }) {
  const { navigateBack } = useNavigationTransition();
  const { $card, $setCard, nested } = useCardContext();
  const { $ankiFields } = useAnkiFieldContext();
  const loadPlugin = useLoadPlugin();
  const { logger } = useGeneralContext();
  usePitch();

  onMount(() => {
    setTimeout(() => {
      $setCard("ready", true);
      logger.info("[Back] ready, expression:", $ankiFields.Expression);
      loadPlugin();
    }, 0);
  });

  const $pitchFieldDataset = createMemo<DatasetProp>(() => ({
    "data-has-pitch": isServer
      ? "{{#PitchPosition}}true{{/PitchPosition}}"
      : $card.ready
        ? $ankiFields.PitchPosition
          ? "true"
          : ""
        : "",
  }));

  return (
    <>
      {$card.ready && !nested && <Lazy.UseAnkiDroid />}
      <Switch>
        <Match when={$card.page === "settings" && $card.ready}>
          <Lazy.Settings />
        </Match>
        <Match when={$card.page === "kanji" && $card.ready}>
          <Lazy.KanjiPage />
        </Match>
        <Match when={$card.page === "nested" && $card.ready}>
          <AnkiFieldContextProvider
            initialAnkiFields={$card.nestedAnkiFields}
            noteId={$card.nestedNoteId}
          >
            <CardStoreContextProvider
              nested
              initialSide="back"
              isMergePreview={$card.nestedIsMergePreview}
              initialNsfw={isNsfw($card.nestedAnkiFields.Tags)}
            >
              <FieldGroupContextProvider>
                <CtxContextProvider>
                  <Back onExitNested={navigateBack} />
                </CtxContextProvider>
              </FieldGroupContextProvider>
            </CardStoreContextProvider>
          </AnkiFieldContextProvider>
        </Match>
        <Match when={$card.page === "main"}>
          <HeaderLayout>
            {$card.ready && <Lazy.HeaderMain onExitNested={props.onExitNested} />}
          </HeaderLayout>
          <div class="flex flex-col">
            {$card.ready && <Lazy.RelatedExpression />}
            <div class="expression-picture-box">
              <div class="expression-audio-box">
                <ExpressionSection />
                <div
                  class="mt-1 sm:mt-2 gap-2 pitch pitch-field min-h-lh"
                  {...$pitchFieldDataset()}
                >
                  {$ankiFields.PitchPosition && $card.ready && <Lazy.Pitches />}
                </div>
                <div class="hidden sm:block sm:h-7 sm:mt-1">
                  {$card.ready && (
                    <div class="flex gap-2">
                      <Lazy.AudioButtons position={1} />
                    </div>
                  )}
                </div>
              </div>
              <PictureSection />
            </div>
            {$card.ready && <FieldGroupPaginationSection />}
          </div>
          {$card.ready && <Lazy.BackBody />}
          {$card.ready && (
            <>
              <Lazy.BackFooter />
              <Lazy.AudioButtons position={2} />
            </>
          )}
          {$card.ready && <Lazy.CardEnd />}
        </Match>
      </Switch>
      {$card.ready && <Lazy.PictureModal />}
      {$card.ready && <Lazy.AudioElements />}
    </>
  );
}
