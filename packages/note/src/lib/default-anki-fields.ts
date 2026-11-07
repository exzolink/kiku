/** Default Anki note-type field editor settings baked into the Kiku RU .apkg. */
export type AnkiFieldDefaults = {
  font: string;
  size: number;
  collapsed: boolean;
};

const DEFAULT_FONT = "Tahoma";

const field = (size: number, collapsed = false): AnkiFieldDefaults => ({
  font: DEFAULT_FONT,
  size,
  collapsed,
});

export const defaultAnkiFields: Record<string, AnkiFieldDefaults> = {
  Expression: field(18),
  ExpressionFurigana: field(18),
  ExpressionReading: field(18),
  ExpressionAudio: field(10),
  RelatedExpression: field(18, true),
  SelectionText: field(18),
  MainDefinition: field(18),
  RuDefinition: field(18),
  EngDefinition: field(18),
  DefinitionPicture: field(10),
  Sentence: field(18),
  SentenceFurigana: field(18),
  SentenceTranslation: field(18, true),
  SentenceAudio: field(10),
  Picture: field(18),
  Glossary: field(18, true),
  Hint: field(18, true),
  PitchPosition: field(18),
  PitchCategories: field(18, true),
  Frequency: field(18, true),
  FreqSort: field(18, true),
  MiscInfo: field(18),
};
