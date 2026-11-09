import { createMemo, For, Match, Show, Switch } from "solid-js";
import { parseHtml } from "#/src/lib/dom";
import { extractKanji } from "#/src/lib/kana";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { useCardContext } from "#/src/contexts/CardContext";
import {
  KanjiTooltipContextProvider,
  useKanjiTooltipContext,
} from "#/src/lazy/contexts/KanjiTooltipContext";

export function Expression() {
  const { $ankiFields } = useAnkiFieldContext();
  const { $initialSide, $isInitialSide } = useCardContext();

  const $doc = createMemo(() => parseHtml($ankiFields.ExpressionFurigana));
  const $isRuby = createMemo(() => Boolean($doc().querySelector("ruby")));

  function ExpressionRuby() {
    return (
      <For each={Array.from($doc().body.childNodes)}>{(node) => <RenderNode node={node} />}</For>
    );
  }

  function ExpressionNoFurigana() {
    return (
      <ruby>
        <For each={Array.from($ankiFields.Expression)}>{(char) => <CharSpan char={char} />}</For>
        <Show
          when={$ankiFields.ExpressionReading && extractKanji($ankiFields.Expression).length > 0}
        >
          <rt>{$ankiFields.ExpressionReading}</rt>
        </Show>
      </ruby>
    );
  }

  return (
    <KanjiTooltipContextProvider>
      <Switch>
        <Match when={$initialSide() === "front" && $isInitialSide()}>
          {$ankiFields.Expression}
        </Match>
        <Match when={$isRuby()}>
          <ExpressionRuby />
        </Match>
        <Match when={true}>
          <ExpressionNoFurigana />
        </Match>
      </Switch>
    </KanjiTooltipContextProvider>
  );
}

function RenderNode(props: { node: Node }) {
  const $el = createMemo(() => props.node as HTMLElement);
  const $tagName = createMemo(() => $el().tagName?.toLowerCase());

  return (
    <Switch>
      <Match when={$el().nodeType === Node.TEXT_NODE}>
        <For each={Array.from($el().textContent)}>{(char) => <CharSpan char={char} />}</For>
      </Match>
      <Match when={$el().nodeType === Node.ELEMENT_NODE}>
        <Switch fallback={<span innerHTML={$el().outerHTML} />}>
          <Match when={$tagName() === "rt"}>
            <rt innerHTML={$el().innerHTML} />
          </Match>
          <Match when={$tagName() === "rp"}>
            <rp innerHTML={$el().innerHTML} />
          </Match>
          <Match when={$tagName() === "ruby"}>
            <ruby>
              <For each={Array.from($el().childNodes)}>
                {(child) => <RenderNode node={child} />}
              </For>
            </ruby>
          </Match>
          <Match when={$tagName() === "rb"}>
            <For each={Array.from($el().childNodes)}>{(child) => <RenderNode node={child} />}</For>
          </Match>
        </Switch>
      </Match>
    </Switch>
  );
}

function CharSpan(props: { char: string }) {
  const { $initialSide } = useCardContext();
  const $kanji = createMemo(() => extractKanji(props.char)[0]);
  const { onInactive, onActive } = useKanjiTooltipContext();

  return (
    <Switch>
      <Match when={$initialSide() === "back"}>
        <span
          tabindex={0}
          class="tappable"
          on:mouseenter={(e) => onActive(e, $kanji())}
          on:mouseleave={onInactive}
          on:focusin={(e) => onActive(e, $kanji())}
          on:focusout={onInactive}
          on:touchstart={(e) => onActive(e, $kanji())}
          on:touchend={(e) => e.stopPropagation()}
        >
          {props.char}
        </span>
      </Match>
      <Match when={$initialSide() === "front"}>
        <span>{props.char}</span>
      </Match>
    </Switch>
  );
}
