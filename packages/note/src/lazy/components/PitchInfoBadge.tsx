import { createMemo, Show } from "solid-js";
import { getPitchTypeInfo, usePitch } from "#/src/hooks/pitch";
import { InfoIcon } from "./Icons";

export function PitchInfoBadge() {
  const { $pitchType, $hasPitchPosition } = usePitch();
  const $info = createMemo(() =>
    $hasPitchPosition() ? getPitchTypeInfo($pitchType()) : undefined,
  );

  return (
    <Show when={$info()}>
      {(info) => (
        <div class="absolute top-1 right-1 z-10">
          <div class="tooltip tooltip-left pitch-info-tooltip">
            <div class="tooltip-content pitch-info-tooltip-content">
              <div>
                {info().ja} ({info().romaji})
              </div>
              <div class="whitespace-pre-line">{info().description}</div>
            </div>
            <span class="badge badge-ghost gap-0.5 cursor-help px-2 text-base-content-soft">
              <InfoIcon class="size-4" />
            </span>
          </div>
        </div>
      )}
    </Show>
  );
}
