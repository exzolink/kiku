import {
  createEffect,
  createMemo,
  createSignal,
  ErrorBoundary,
  For,
  on,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";
import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import { ankiFieldsSkeleton, type AnkiNote } from "#/src/lib/types";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { useBreakpointContext } from "#/src/contexts/BreakpointContext";
import { useCardContext } from "#/src/contexts/CardContext";
import { useConfigContext } from "#/src/contexts/ConfigContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";
import { RELATED_EXPRESSION_TOGGLE_KEY } from "#/src/lib/config";
import { preloadImages } from "#/src/lib/dom";
import { GitPullRequestArrow, MoveDown } from "./Icons";

const sortNote = (a: AnkiNote, b: AnkiNote) => b.noteId - a.noteId;

const dedupeByCardId = (notes: AnkiNote[]) => {
  const seen = new Set<string>();
  return notes.filter((note) => {
    const cardId = note.cards[0]?.toString() ?? "";
    if (seen.has(cardId)) return false;
    seen.add(cardId);
    return true;
  });
};

function useRelatedExpressionNotes() {
  const { $config } = useConfigContext();
  const { $initialSide, $$card } = useCardContext();
  const { initialAnkiFields } = useAnkiFieldContext();

  const $relatedExpression = createMemo(() => {
    const query = $$card();
    if (!query) return [];
    const excludeNewCards = $config.relatedExpressionExcludeNewCards;
    const newCardIds = new Set(query.newNotes.flatMap((n) => n.cards));

    if ($initialSide() === "front") {
      return [...(query.sameExpression ?? [])]
        .filter((v) => {
          if (excludeNewCards)
            return (
              !newCardIds.has(v.cards[0]) &&
              v.fields["ExpressionReading"].value !== initialAnkiFields.ExpressionReading
            );
          return v.fields["ExpressionReading"].value !== initialAnkiFields.ExpressionReading;
        })
        .sort(sortNote);
    }

    let fallbackPriority1 = [
      ...(query.sameExpression ?? []),
      ...(query.sameReading ?? []),
      ...query.noteList.flatMap((n) => n[1]),
    ];

    let fallbackPriority2 = [
      ...(query.forms ?? []),
      ...(query.antonym ?? []),
      ...(query.referenced ?? []),
    ];

    let relatedExpression = query.relatedExpression;

    if (excludeNewCards) {
      fallbackPriority1 = fallbackPriority1.filter((v) => !newCardIds.has(v.cards[0]));
      fallbackPriority2 = fallbackPriority2.filter((v) => !newCardIds.has(v.cards[0]));
      relatedExpression = relatedExpression.filter((v) => !newCardIds.has(v.cards[0]));
    }

    if (!$config.relatedExpressionFallback) {
      fallbackPriority1 = [];
      fallbackPriority2 = [];
    }

    fallbackPriority1 = fallbackPriority1.sort(sortNote);
    fallbackPriority2 = fallbackPriority2.sort(sortNote);

    if (relatedExpression?.length && relatedExpression.length < 2) {
      return dedupeByCardId([
        ...relatedExpression,
        ...fallbackPriority2,
        ...fallbackPriority1,
      ]).slice(0, 2);
    } else if (relatedExpression?.length && relatedExpression.length >= 2) {
      return dedupeByCardId(relatedExpression);
    } else {
      return dedupeByCardId([...fallbackPriority2, ...fallbackPriority1]).slice(0, 2);
    }
  });

  const $newNotes = createMemo(() => new Set($$card()?.newNotes.flatMap((n) => n.cards) ?? []));
  const $isNewNote = createMemo(() => $newNotes().has(Number(initialAnkiFields.CardID)));
  const $hasContent = createMemo(
    () => $relatedExpression().length > 0 || ($isNewNote() && $initialSide() === "back"),
  );

  return { $relatedExpression, $newNotes, $isNewNote, $hasContent };
}

const playedCardIds = new Set<string>();

function useRelatedExpressionPlayback() {
  const { logger } = useGeneralContext();
  const { $card } = useCardContext();
  const { $ankiFields, $isInitialAnkiFields } = useAnkiFieldContext();
  const { $relatedExpression } = useRelatedExpressionNotes();

  createEffect(
    on(
      () => $relatedExpression(),
      (notes) => {
        notes.forEach((note) => preloadImages(note.fields.Picture.value));
      },
      { defer: true },
    ),
  );

  createEffect(
    on(
      () => $ankiFields.CardID,
      () => {
        if ($isInitialAnkiFields()) return;
        if (playedCardIds.has($ankiFields.CardID)) return;
        playedCardIds.add($ankiFields.CardID);

        const playSentence = () => {
          const sentence =
            $card.sentenceAudioRef?.querySelector("a") ??
            $card.sentenceAudioRef?.querySelector("audio") ??
            $card.sentenceAudios?.[0];
          if (!sentence) {
            logger.debug("[RelatedExpression] autoPlay: no sentence audio to chain");
            return;
          }
          logger.info("[RelatedExpression] autoPlay: sentence");
          if (sentence instanceof HTMLAnchorElement) sentence.click();
          if (sentence instanceof HTMLAudioElement) void sentence.play();
        };

        const expression =
          $card.expressionAudioRef?.querySelector("a") ??
          $card.expressionAudioRef?.querySelector("audio");
        if (expression) {
          logger.info("[RelatedExpression] autoPlay: expression");
          if (expression instanceof HTMLAnchorElement) expression.click();
          if (expression instanceof HTMLAudioElement) {
            void expression.play();
            expression.onended = () => playSentence();
            expression.onpause = () => {
              if (expression.ended || expression.currentTime === 0) playSentence();
            };
          } else {
            setTimeout(playSentence, 800);
          }
        } else {
          logger.debug("[RelatedExpression] autoPlay: no expression audio to play");
          playSentence();
        }
      },
      { defer: true },
    ),
  );
}

function RelatedExpressionList() {
  const { $setCard, $initialSide, $$card } = useCardContext();
  const { $ankiFields, $setAnkiFields, resetAnkiFields, initialAnkiFields, $isInitialAnkiFields } =
    useAnkiFieldContext();
  const { $relatedExpression, $newNotes, $isNewNote, $hasContent } = useRelatedExpressionNotes();
  const [$ref, $setRef] = createSignal<HTMLDivElement>();
  const [$hasMultipleRows, $setHasMultipleRows] = createSignal(false);

  const $displayExpression = createMemo(() => initialAnkiFields.Expression);

  const isExplicitRelatedExpression = (note: AnkiNote) => {
    return $$card()?.relatedExpression?.some((n) => n.noteId === note.noteId) ?? false;
  };

  onMount(() => {
    const ref = $ref();
    if (!ref) return;
    const observer = new ResizeObserver(() => {
      if (ref.children.length <= 1) {
        $setHasMultipleRows(false);
        return;
      }
      const children = Array.from(ref.children) as HTMLElement[];
      const firstTop = children[0].offsetTop;
      $setHasMultipleRows(children.some((child) => child.offsetTop > firstTop));
    });
    observer.observe(ref);
    onCleanup(() => observer.disconnect());
  });

  return (
    <Show when={$hasContent()}>
      <div
        ref={$setRef}
        class="flex gap-x-2 sm:gap-x-4 flex-wrap relative text-base sm:text-lg"
      >
        <div class="flex gap-px items-center">
          <MoveDown
            class="size-4 sm:size-5 text-base-content-faint"
            classList={{ hidden: !$hasMultipleRows() }}
          />
          <button
            class="hover:text-base-content cursor-pointer indicator font-japanese-display"
            classList={{
              "text-base-content-soft": !$isInitialAnkiFields(),
              "text-base-content": $isInitialAnkiFields(),
            }}
            lang="ja"
            on:click={() => {
              resetAnkiFields();
              $setCard("side", $initialSide());
            }}
            on:touchend={(e) => e.stopPropagation()}
          >
            {$displayExpression()}
            <Show when={$isNewNote() && $initialSide() === "back"}>
              <span class="status status-info"></span>
            </Show>
          </button>
        </div>
        <For each={$relatedExpression()}>
          {(note) => {
            const cardId = note.cards[0]?.toString() ?? "";
            const isNew = $newNotes().has(Number(cardId));
            return (
              <button
                class="hover:text-base-content cursor-pointer indicator"
                classList={{
                  "text-base-content-soft underline underline-offset-4 sm:underline-offset-5 decoration-1":
                    $ankiFields.CardID !== cardId && isExplicitRelatedExpression(note),
                  "text-base-content-soft":
                    $ankiFields.CardID !== cardId && !isExplicitRelatedExpression(note),
                  "text-base-content underline underline-offset-4 sm:underline-offset-5 decoration-1":
                    $ankiFields.CardID === cardId && isExplicitRelatedExpression(note),
                  "text-base-content":
                    $ankiFields.CardID === cardId && !isExplicitRelatedExpression(note),
                  "font-japanese-text": $initialSide() === "front",
                  "font-japanese-display": $initialSide() !== "front",
                }}
                lang="ja"
                on:click={() => {
                  $setAnkiFields({
                    ...ankiFieldsSkeleton,
                    ...Object.fromEntries(
                      Object.entries(note.fields).map(([key, value]) => [key, value.value ?? ""]),
                    ),
                    Picture: note.fields.Picture?.value ?? "",
                    CardID: cardId,
                    Tags: note.tags.join(" "),
                    __IS_ROOT__: false,
                  });
                  $setCard("side", "back");
                }}
                on:touchend={(e) => e.stopPropagation()}
              >
                {$initialSide() === "front"
                  ? note.fields.ExpressionReading.value
                  : note.fields.Expression.value}
                <Show when={isNew}>
                  <span class="status status-info"></span>
                </Show>
              </button>
            );
          }}
        </For>
      </div>
    </Show>
  );
}

export function RelatedExpressionTrigger() {
  return (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <$RelatedExpressionTrigger />
      </Suspense>
    </ErrorBoundary>
  );
}

function $RelatedExpressionTrigger() {
  const { $general } = useGeneralContext();
  const { $isInitialAnkiFields } = useAnkiFieldContext();
  const { $hasContent } = useRelatedExpressionNotes();
  const bp = useBreakpointContext();
  useRelatedExpressionPlayback();

  const [$show, $setShow] = createSignal(false);
  const [$anchor, $setAnchor] = createSignal<HTMLElement | null>(null);
  const [$buttonRef, $setButtonRef] = createSignal<HTMLButtonElement>();
  const [$tooltipRef, $setTooltipRef] = createSignal<HTMLDivElement>();
  const [$position, $setPosition] = createStore({ x: 0, y: 0 });

  let hideTimeout: ReturnType<typeof setTimeout> | undefined;

  function clearHideTimeout() {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = undefined;
    }
  }

  function close() {
    clearHideTimeout();
    $setShow(false);
    $setAnchor(null);
  }

  function scheduleHide() {
    clearHideTimeout();
    hideTimeout = setTimeout(() => {
      $setShow(false);
      $setAnchor(null);
    }, 100);
  }

  function openFrom(el: HTMLElement) {
    clearHideTimeout();
    $setAnchor(el);
    $setShow(true);
  }

  function open(event: MouseEvent | TouchEvent | FocusEvent) {
    if (!(event.currentTarget instanceof HTMLElement)) return;
    openFrom(event.currentTarget);
  }

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (!$hasContent()) return;
      if (e.key.toLowerCase() !== RELATED_EXPRESSION_TOGGLE_KEY) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.closest("input, textarea, select, [contenteditable=true]") ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      if ($show()) close();
      else {
        const button = $buttonRef();
        if (button) openFrom(button);
      }
    };
    window.addEventListener("keydown", handler);
    onCleanup(() => window.removeEventListener("keydown", handler));
  });

  onCleanup(() => clearHideTimeout());

  createEffect(() => {
    const anchor = $anchor();
    const tooltip = $tooltipRef();
    if (!$show() || !anchor || !tooltip) return;

    computePosition(anchor, tooltip, {
      placement: bp.isAtLeast("sm") ? "bottom-end" : "bottom",
      middleware: [offset({ mainAxis: 6, crossAxis: 0 }), flip(), shift({ padding: 5 })],
    })
      .then(({ x, y }) => $setPosition({ x, y }))
      .catch((e) => {
        console.error("[RelatedExpression] computePosition failed:", e);
      });
  });

  return (
    <Show when={$hasContent()}>
      <button
        type="button"
        ref={$setButtonRef}
        class="relative flex items-center cursor-pointer text-base-content-soft hover:text-base-content"
        classList={{
          "text-base-content": !$isInitialAnkiFields() || $show(),
        }}
        aria-label="Связанные выражения"
        on:mouseenter={open}
        on:mouseleave={scheduleHide}
        on:focusin={open}
        on:focusout={scheduleHide}
        on:touchstart={open}
        on:touchend={(e) => e.stopPropagation()}
      >
        <GitPullRequestArrow class="size-4" />
        <Show when={!$isInitialAnkiFields()}>
          <span class="status status-info absolute -top-1.5 -right-1.5 scale-75"></span>
        </Show>
      </button>

      <Portal mount={$general.layoutRef}>
        <div
          ref={$setTooltipRef}
          class="absolute z-10 overflow-hidden rounded-lg horizontal-tb text-start tooltip tappable shadow-lg"
          tabindex={0}
          on:mouseenter={clearHideTimeout}
          on:mouseleave={scheduleHide}
          on:focusin={clearHideTimeout}
          on:focusout={scheduleHide}
          on:touchstart={clearHideTimeout}
          style={{
            display: $show() ? "block" : "none",
            left: `${$position.x}px`,
            top: `${$position.y}px`,
          }}
        >
          <div
            class="relative text-base bg-base-200 z-10 p-2 sm:p-3 border border-base-300 rounded-lg font-cyrillic w-max max-w-[min(20rem,calc(100vw-1.5rem))] shadow-lg"
            lang="ru"
            style={{ color: "initial" }}
          >
            <RelatedExpressionList />
          </div>
        </div>
      </Portal>
    </Show>
  );
}
