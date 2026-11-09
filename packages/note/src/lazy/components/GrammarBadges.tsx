import { createMemo, For, Show } from "solid-js";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { parseHtml } from "#/src/lib/dom";

function splitBadgeValues(raw: string) {
  return raw
    .split(/[,，、;；|/]+/)
    .map((part) => part.replace(/\u00a0/g, " ").trim())
    .filter(Boolean);
}

function listOrSplit(raw: string) {
  if (!raw) return [];
  const fromLis = Array.from(parseHtml(raw).querySelectorAll("li"))
    .map((item) => item.textContent?.replace(/\u00a0/g, " ").trim() ?? "")
    .filter(Boolean);
  return fromLis.length ? fromLis : splitBadgeValues(raw);
}

export function GrammarBadges() {
  const { $ankiFields } = useAnkiFieldContext();

  const $conjugations = createMemo(() => listOrSplit($ankiFields.Conjugation?.trim() ?? ""));

  const $partsOfSpeech = createMemo(() =>
    listOrSplit($ankiFields.PartOfSpeech?.trim() ?? "").filter(
      (value) => value.toLowerCase() !== "unknown",
    ),
  );

  const $badges = createMemo(() => [
    ...$conjugations().map((label) => ({ label, kind: "conjugation" as const })),
    ...$partsOfSpeech().map((label) => ({ label, kind: "pos" as const })),
  ]);

  return (
    <Show when={$badges().length}>
      <div class="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="flex gap-1.5 sm:gap-2 items-center justify-start sm:justify-center flex-nowrap w-max min-w-full sm:min-w-0 sm:flex-wrap sm:w-auto mx-auto">
          <For each={$badges()}>
            {(badge) => (
              <div
                class="badge badge-outline shrink-0 h-5 min-h-5 px-1.5 text-xs sm:h-6 sm:min-h-6 sm:px-2.5 sm:text-sm"
                classList={{
                  "badge-accent": badge.kind === "conjugation",
                  "badge-info": badge.kind === "pos",
                }}
              >
                {badge.label}
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}
