import type { JSX } from "solid-js/jsx-runtime";

/** Reserved header height: h-6 (= 22.5px at 15px root / 24px at 16px). */
export function HeaderLayout(props: { children?: JSX.Element }) {
  return (
    <div class="w-full h-6 min-h-6">
      <div class="flex justify-between flex-row h-6 items-center min-h-6">{props.children}</div>
    </div>
  );
}
