---
outline: deep
---

# Установка

:::info
Kiku RU совместим с [Lapis](https://github.com/donkuri/lapis), поэтому процесс установки похож.
:::

::: warning
Эта инструкция предполагает, что вы уже знакомы с Anki, Yomitan и созданием карточек из контента.
:::

::: warning ТРЕБОВАНИЕ
Нужна версия Anki **25.09** или новее. Перед установкой обновите Anki.
:::

## Установка типа заметки

Скачайте файл `Kiku_RU_v*.apkg` из [последнего выпуска](https://github.com/ganqqwerty/kiku/releases/latest) и импортируйте его в Anki. После этого тип заметки `Kiku RU` появится в списке типов заметок.

## Настройка Yomitan

Откройте настройки Yomitan. Перейдите в `Anki` → `Configure Anki flashcard`, выберите модель `Kiku RU` и настройте поля по таблице:

| Поле                  | Значение                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Expression            | `{expression}`                                                                                                      |
| ExpressionFurigana    | `{furigana}` (HTML ruby, не `{furigana-plain}`)                                                                     |
| ExpressionReading     | `{reading}`                                                                                                         |
| ExpressionAudio       | `{audio}`                                                                                                           |
| RelatedExpression     |                                                                                                                     |
| SelectionText         | `{popup-selection-text}`                                                                                            |
| MainDefinition        | Например, `{single-glossary-jmdict/jitendex}`. Нажмите стрелку рядом с полем и выберите словарь с похожим форматом. |
| RuDefinition          | Русский словарь, например `{single-glossary-…}`. Показывается слева от основного определения.                       |
| EngDefinition         | Английский словарь, например `{single-glossary-…}`. Показывается справа от основного определения.                   |
| DefinitionPicture     | Картинка или набор картинок/SVG, поясняющих значение. Можно вставить изображения из аддона [Kanji Colorizer](https://ankiweb.net/shared/info/1964372878). |
| Sentence              | `{cloze-prefix}<b>{cloze-body}</b>{cloze-suffix}`                                                                   |
| SentenceFurigana      | `{sentence-furigana}`                                                                                               |
| SentenceTranslation   |                                                                                                                     |
| SentenceAudio         |                                                                                                                     |
| Picture               |                                                                                                                     |
| Glossary              | `{glossary}`                                                                                                        |
| Hint                  |                                                                                                                     |
| PitchPosition         | `{pitch-accent-graphs-jj}`                                                                                          |
| PitchCategories       | `{pitch-accent-categories}`                                                                                         |
| Frequency             | `{frequencies}`                                                                                                     |
| FreqSort              | `{frequency-harmonic-rank}`                                                                                         |
| Conjugation           | Например, `{conjugation}`. Показывается бейджами под частотностью.                                                  |
| PartOfSpeech          | Часть речи. Значение `Unknown` скрывается.                                                                          |
| MiscInfo              | `{document-title}` добавляет заголовок вкладки, из которой создана карточка. Это удобно, например, для ранобэ.      |

Таблица основана на инструкции [Lapis](https://github.com/donkuri/lapis).

## Дополнение [Kiku Note Manager](https://ankiweb.net/shared/info/408592650?cb=1763445474367)

Дополнение создаёт кэш заметок. Благодаря этому сеть кандзи работает на всех платформах.
Установите дополнение, затем выберите `Инструменты` → `Kiku Note Manager` → `Generate notes cache`.
