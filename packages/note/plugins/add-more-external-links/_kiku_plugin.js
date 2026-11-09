/**
 * @import { KikuPlugin } from "#/plugins/plugin-types";
 */

/**
 * @type { KikuPlugin }
 */
export const plugin = {
  ExternalLinks: (props) => {
    const { html, useGeneralContext } = props.ctx;
    const { ankiDroidAPI } = useGeneralContext();

    function AnkiDroidBrowseButton() {
      const onclick = () => {
        void ankiDroidAPI?.ankiSearchCard(
          `("note:Kiku RU" OR "note:Kiku" OR "note:Lapis") AND "Expression:*${props.ctx.$ankiFields.Expression}*"`,
        );
      };
      return html`<button class="text-xs btn btn-xs" on:click=${onclick}>Открыть в Anki</button>`;
    }

    return [
      // includes the default ExternalLinks
      props.DefaultExternalLinks(),
      AnkiDroidBrowseButton(),
    ];
  },
};
