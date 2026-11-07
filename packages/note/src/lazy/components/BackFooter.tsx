import { ErrorBoundary, Show } from "solid-js";
import { useCtxContext } from "#/src/contexts/CtxContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";
import { FrequencyBadges } from "./FrequencyBadges";

export function BackFooter() {
  const { $general } = useGeneralContext();
  const ctx = useCtxContext();

  function DefaultFooter() {
    return <FrequencyBadges />;
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
