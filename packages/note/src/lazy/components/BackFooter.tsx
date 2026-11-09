import { ErrorBoundary, Show } from "solid-js";
import { useCtxContext } from "#/src/contexts/CtxContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";
import { FrequencyBadges } from "./FrequencyBadges";
import { GrammarBadges } from "./GrammarBadges";

export function BackFooter() {
  const { $general } = useGeneralContext();
  const ctx = useCtxContext();

  function DefaultFooter() {
    return (
      <div class="flex flex-col gap-3 items-center w-full min-w-0">
        <FrequencyBadges />
        <GrammarBadges />
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<DefaultFooter />}>
      <Show when={$general.plugin?.Footer} fallback={<DefaultFooter />}>
        {(get) => {
          const Footer = get();
          return <Footer ctx={ctx} DefaultFooter={DefaultFooter} />;
        }}
      </Show>
    </ErrorBoundary>
  );
}
