import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { parseHtml } from "#/src/lib/dom";
import { unique } from "#/src/lib/es";
import { pitchTypes, type PitchType } from "#/src/lib/types";
import { createMemo } from "solid-js";

export function extractPitchNumbers(html: string) {
  if (!html) return [];
  const pitchPositionDoc = parseHtml(html);
  let text = pitchPositionDoc.body.textContent || "";

  // Normalize full-width numbers to half-width
  text = text.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

  const matches = text.match(/\d+/g);
  if (!matches) return [];

  const numbers = matches
    .map(Number)
    // Pitch accents are usually small (0-20).
    // This helps ignore things like years (2024) in the text.
    .filter((n) => n < 50);

  return unique(numbers);
}

export function normalizePitchType(s: string) {
  let pitchCategory: string | null = s.trim().toLowerCase();
  if (pitchCategory === "平板") pitchCategory = "heiban";
  if (pitchCategory === "頭高") pitchCategory = "atamadaka";
  if (pitchCategory === "中高") pitchCategory = "nakadaka";
  if (pitchCategory === "尾高") pitchCategory = "odaka";
  if (pitchCategory === "起伏") pitchCategory = "kifuku";
  if (!pitchTypes.includes(pitchCategory as PitchType)) pitchCategory = null;
  return pitchCategory as PitchType | null;
}

const pitchTypeLabels: Record<PitchType, { ja: string; romaji: string; description: string }> = {
  heiban: {
    ja: "平板",
    romaji: "heiban",
    description: "Первый слог низкий, остальные высокие;\nчастица остаётся высокой.",
  },
  atamadaka: {
    ja: "頭高",
    romaji: "atamadaka",
    description: "Первый слог высокий, остальные низкие;\nчастица низкая.",
  },
  nakadaka: {
    ja: "中高",
    romaji: "nakadaka",
    description: "Начало низкое, затем подъём и спад до низкой частицы.",
  },
  odaka: {
    ja: "尾高",
    romaji: "odaka",
    description: "Первый слог низкий, остальные высокие;\nчастица падает.",
  },
  kifuku: {
    ja: "起伏",
    romaji: "kifuku",
    description: "Сложный / волнообразный тон (обычно у глаголов и прилагательных).",
  },
};

export function getPitchTypeInfo(type: PitchType | null | undefined) {
  if (!type) return undefined;
  return pitchTypeLabels[type];
}

export function usePitch() {
  const { $ankiFields } = useAnkiFieldContext();

  const $pitchCategories = createMemo(() =>
    $ankiFields.PitchCategories.split(",")
      .map((s) => normalizePitchType(s))
      .filter((v): v is PitchType => v != null),
  );

  const $pitchType = createMemo(() => $pitchCategories()[0]);

  const $hasPitchPosition = createMemo(() => Boolean($ankiFields.PitchPosition?.trim()));

  return { $pitchCategories, $pitchType, $hasPitchPosition };
}
