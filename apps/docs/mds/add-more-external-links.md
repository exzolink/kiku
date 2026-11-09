---
outline: deep
---

# Дополнительные внешние ссылки

По умолчанию в шапке уже есть ссылки на JPDB, Jisho, Google и Nadeshiko. Через плагин можно добавить свои или заменить набор целиком.

Пример: ссылка на поиск предложений с иконкой-картинкой.

```js
/**
 * @import { KikuPlugin } from "#/plugins/plugin-types";
 */

/** @type { KikuPlugin } */
export const plugin = {
  ExternalLinks: (props) => {
    const { html } = props.ctx;

    function ExampleLink() {
      const url = new URL("https://example.com/search");
      url.searchParams.set("q", props.ctx.$ankiFields.Expression);
      return html`<a href=${url.toString()} target="_blank" rel="noopener">
        <img class="size-5 object-contain rounded-xs" src="data:image/png;base64,..." alt="Example" />
      </a>`;
    }

    return [
      props.DefaultExternalLinks(),
      ExampleLink(),
    ];
  },
};
```

Полный пример плагина:

::: code-group

<!-- prettier-ignore -->
<<< ../../../packages/note/plugins/add-more-external-links/_kiku_plugin.js [_kiku_plugin.js]
:::
