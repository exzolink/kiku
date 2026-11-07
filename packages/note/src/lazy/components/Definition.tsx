import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, Show } from "solid-js";
import { EXTRA_DEFINITIONS_TOGGLE_KEY, type DatasetProp } from "#/src/lib/config";
import { isHtmlEffectivelyEmpty, parseHtml, removeBrInsideStyleTag } from "#/src/lib/dom";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { useConfigContext } from "#/src/contexts/ConfigContext";

type DefinitionPage = { name: string; html: string };

export function Definition() {
  const { $ankiFields } = useAnkiFieldContext();
  const { $config } = useConfigContext();
  const [$extraVisible, $setExtraVisible] = createSignal(false);

  createEffect(
    on(
      () => $ankiFields.CardID,
      () => $setExtraVisible(false),
      { defer: true },
    ),
  );

  const $glossary = createMemo(() => {
    // empty glossary if it's the same as main definition
    if ($ankiFields.MainDefinition === $ankiFields.Glossary) return "";
    const glossary = removeMainDefinitionFromGlossary(
      $ankiFields.Glossary,
      $ankiFields.MainDefinition,
    );
    return !isHtmlEffectivelyEmpty(glossary) ? removeBrInsideStyleTag(glossary) : "";
  });

  const $selection = createMemo(() => {
    return !isHtmlEffectivelyEmpty($ankiFields.SelectionText)
      ? removeBrInsideStyleTag($ankiFields.SelectionText)
      : "";
  });

  const $main = createMemo(() => {
    return !isHtmlEffectivelyEmpty($ankiFields.MainDefinition)
      ? removeBrInsideStyleTag($ankiFields.MainDefinition)
      : "";
  });

  const $ru = createMemo(() => {
    return !isHtmlEffectivelyEmpty($ankiFields.RuDefinition)
      ? removeBrInsideStyleTag($ankiFields.RuDefinition)
      : "";
  });

  const $eng = createMemo(() => {
    return !isHtmlEffectivelyEmpty($ankiFields.EngDefinition)
      ? removeBrInsideStyleTag($ankiFields.EngDefinition)
      : "";
  });

  const $misc = createMemo(() => {
    return !isHtmlEffectivelyEmpty($ankiFields.MiscInfo)
      ? removeBrInsideStyleTag($ankiFields.MiscInfo)
      : "";
  });

  const $primaryPages = createMemo(() => {
    const p: DefinitionPage[] = [];
    const selection = $selection();
    const main = $main();

    if ($config.definitionStyle === "single-page") {
      const combined = [selection, main].filter(Boolean);
      if (combined.length > 0) {
        const html = combined.join('<div class="divider my-4"></div>');
        p.push({ name: "Определение", html });
      }
      return p;
    }

    if (selection) {
      p.push({ name: "Выбранный текст", html: selection });
    }
    if (main) {
      let name = "Основное определение";
      if ($config.definitionStyle === "glossary-split") {
        const doc = parseHtml(main);
        const li = doc.querySelector("li[data-dictionary]");
        const dictName = li?.getAttribute("data-dictionary");
        if (dictName) {
          name = `Основное определение (${dictName})`;
        }
      }
      p.push({ name, html: main });
    }

    return p;
  });

  const $extraCenterPages = createMemo(() => {
    const p: DefinitionPage[] = [];
    const glossary = $glossary();
    const misc = $misc();

    if (!isHtmlEffectivelyEmpty(glossary)) {
      const doc = parseHtml(glossary);
      const entries = doc.querySelectorAll("li[data-dictionary]");
      if ($config.definitionStyle === "glossary-split" && entries.length > 0) {
        const styles = Array.from(doc.querySelectorAll("style"))
          .map((s) => s.outerHTML)
          .join("");
        const dictGroups = new Map<string, string>();
        for (const li of entries) {
          const dictName = li.getAttribute("data-dictionary") || "Словарная статья";
          const prevHtml = dictGroups.get(dictName);
          const divider = prevHtml ? '<div class="divider"></div>' : "";
          dictGroups.set(dictName, (prevHtml || "") + divider + li.outerHTML);
        }
        for (const [name, html] of dictGroups) {
          p.push({
            name,
            html: `<div style="text-align: left;" class="yomitan-glossary"><ol>${styles}${html}</ol></div>`,
          });
        }
      } else {
        p.push({ name: "Словарная статья", html: glossary });
      }
    }

    if (misc) {
      p.push({ name: "Доп. информация", html: misc });
    }

    if ($config.definitionStyle === "glossary-split") {
      for (const item of p) {
        const doc = parseHtml(item.html);
        const iEl = doc.querySelector("i:first-child");
        if (!(iEl instanceof HTMLElement)) continue;
        if (iEl.textContent === `(${item.name})`) {
          iEl.style.display = "none";
        }
        item.html = doc.body.innerHTML;
      }
    }

    return p;
  });

  const $hasExtraSides = createMemo(() => Boolean($ru() || $eng()));
  const $hasExtraCenter = createMemo(() => $extraCenterPages().length > 0);
  const $hasExtras = createMemo(() => $hasExtraSides() || $hasExtraCenter());
  const $showExtras = createMemo(
    () => $config.extraDefinitionsVisibility === "always" || $extraVisible(),
  );
  const $showSides = createMemo(() => $showExtras() && $hasExtraSides());

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if ($config.extraDefinitionsVisibility !== "on-key") return;
      if (!$hasExtras()) return;
      if (e.key.toLowerCase() !== EXTRA_DEFINITIONS_TOGGLE_KEY) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.closest("input, textarea, select, [contenteditable=true]") ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      $setExtraVisible((v) => !v);
    };
    window.addEventListener("keydown", handler);
    onCleanup(() => window.removeEventListener("keydown", handler));
  });

  const $definitionDataset = createMemo<DatasetProp>(() => ({
    "data-dictionary": $primaryPages()[0]?.name ?? $extraCenterPages()[0]?.name,
  }));

  const $accentPageName = createMemo(() => {
    if ($selection()) return "Выбранный текст";
    return $primaryPages()[0]?.name;
  });

  return (
    <Show when={$primaryPages().length > 0 || $hasExtras()}>
      <div
        classList={{
          // Full-bleed only in the side-by-side layout; stacked adaptive keeps layout width.
          "2xl:relative 2xl:left-1/2 2xl:w-screen 2xl:max-w-[100vw] 2xl:-translate-x-1/2 2xl:box-border 2xl:px-4":
            $showSides(),
        }}
      >
        <div
          class="mx-auto grid grid-cols-1 gap-2 sm:gap-3"
          classList={{
            "2xl:w-full 2xl:grid-cols-[minmax(0,1fr)_minmax(0,calc(var(--layout-max-width)-2rem))_minmax(0,1fr)] 2xl:items-start":
              $showSides(),
          }}
        >
          <Show when={$showSides()}>
            <aside class="min-w-0 order-2 2xl:order-1">
              <Show when={$ru()}>
                {(html) => <DefinitionCard name="RuDefinition" html={html()} compact />}
              </Show>
            </aside>
          </Show>

          <div
            class="min-w-0 order-1 2xl:order-2 flex flex-col gap-2 sm:gap-3"
            {...$definitionDataset()}
          >
            <For each={$primaryPages()}>
              {(page) => (
                <DefinitionCard
                  name={page.name}
                  html={page.html}
                  accent={page.name === $accentPageName()}
                />
              )}
            </For>

            <Show when={$showExtras()}>
              <For each={$extraCenterPages()}>
                {(page) => <DefinitionCard name={page.name} html={page.html} />}
              </For>
            </Show>
          </div>

          <Show when={$showSides()}>
            <aside class="min-w-0 order-3">
              <Show when={$eng()}>
                {(html) => <DefinitionCard name="EngDefinition" html={html()} compact />}
              </Show>
            </aside>
          </Show>
        </div>
      </div>
    </Show>
  );
}

function DefinitionCard(props: {
  name: string;
  html: string;
  compact?: boolean;
  accent?: boolean;
}) {
  const { $config } = useConfigContext();

  return (
    <div data-dictionary={props.name}>
      <div
        class="relative bg-base-200 p-2 sm:p-4 border-s-4 rounded-lg definition-field"
        classList={{
          "text-sm sm:text-base": props.compact,
          "text-base sm:text-lg": !props.compact,
          "misc-info": props.name === "Доп. информация",
        }}
        style={{
          "border-color": props.accent
            ? "var(--color-primary)"
            : "var(--dictionary-color, color-mix(in oklab, var(--color-base-content) 22%, transparent))",
          "background-color": props.accent
            ? "color-mix(in oklab, var(--color-primary) 12%, var(--color-base-200))"
            : undefined,
        }}
        data-definition-style={$config.definitionStyle}
      >
        <div class="overflow-auto">
          <div class="contents" innerHTML={props.html}></div>
        </div>
      </div>
    </div>
  );
}

function removeMainDefinitionFromGlossary(glossary: string, mainDefinition: string) {
  const parser = new DOMParser();
  const glossaryDoc = parser.parseFromString(glossary, "text/html");
  const mainDefinitionDoc = parser.parseFromString(mainDefinition, "text/html");

  const mainDefinitionLis = mainDefinitionDoc.querySelectorAll(
    'div[class="yomitan-glossary"] > ol > li[data-dictionary]',
  );
  const mainDefinitionDicts = Array.from(mainDefinitionLis)
    .map((li) => li.getAttribute("data-dictionary"))
    .filter(Boolean) as string[];
  if (mainDefinitionDicts.length === 0) return glossary;

  const glossaries = glossaryDoc.querySelectorAll(
    `div[class="yomitan-glossary"] > ol > li[data-dictionary]`,
  );
  for (const glossaryLi of glossaries) {
    const dictName = glossaryLi.getAttribute("data-dictionary");
    if (!dictName) continue;
    if (mainDefinitionDicts.includes(dictName)) {
      glossaryLi.remove();
    }
  }
  return glossaryDoc.body.innerHTML;
}
