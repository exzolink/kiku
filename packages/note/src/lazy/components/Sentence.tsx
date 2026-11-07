import { createMemo, ErrorBoundary, Match, Show, Switch } from "solid-js";
import { useCardContext } from "#/src/contexts/CardContext";
import { useConfigContext } from "#/src/contexts/ConfigContext";
import { useCtxContext } from "#/src/contexts/CtxContext";
import { useFieldGroupContext } from "#/src/contexts/FieldGroupContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";
import { parseHtml } from "#/src/lib/dom";
import { usePitch } from "#/src/hooks/pitch";

export function Sentence() {
  const { $card } = useCardContext();
  const { $group } = useFieldGroupContext();
  const { $general } = useGeneralContext();
  const ctx = useCtxContext();

  function DefaultSentence() {
    return (
      <div class="flex flex-col justify-center gap-2 items-center text-center">
        <Switch>
          <Match when={$card.side === "back" && $group().sentenceTranslationField}>
            <SentenceFieldWithTranslation />
          </Match>
          <Match when={true}>
            <SentenceField />
          </Match>
        </Switch>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<DefaultSentence />}>
      <Show when={$general.plugin?.Sentence} fallback={<DefaultSentence />}>
        {(get) => {
          const Sentence = get();
          return <Sentence ctx={ctx} DefaultSentence={DefaultSentence} />;
        }}
      </Show>
    </ErrorBoundary>
  );
}

function SentenceFieldWithTranslation() {
  const { $group } = useFieldGroupContext();

  return (
    <div class="flex flex-col gap-2">
      <SentenceField />
      <div
        class="text-base text-base-content-calm font-cyrillic"
        lang="ru"
        innerHTML={$group().sentenceTranslationField}
      ></div>
    </div>
  );
}

function SentenceField() {
  const { $card, $initialSide, $isInitialSide } = useCardContext();
  const { $config } = useConfigContext();
  const { $pitchType } = usePitch();
  const { $group } = useFieldGroupContext();

  const $sentence = createMemo(() => parseHtml($group().sentenceField).body.innerHTML);

  const $furiganaAlways = createMemo(
    () => $card.side === "back" && $config.sentenceFuriganaAlwaysVisible,
  );

  const expressionPitchDataset = () => {
    if ($initialSide() === "front" && $isInitialSide()) return {};
    return {
      "data-pitch-type": $pitchType(),
    };
  };

  return (
    <div
      class="sentence font-japanese-text sentence-field"
      lang="ja"
      data-furigana-always={$furiganaAlways() ? "true" : undefined}
      innerHTML={$sentence()}
      {...expressionPitchDataset()}
    ></div>
  );
}
