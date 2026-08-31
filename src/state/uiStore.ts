import { useSyncExternalStore } from "react";

export type UiState = {
  colorway: number;
  hotspot: string | null;
  specsOpen: boolean;
  reserved: boolean;
};

let state: UiState = { colorway: 0, hotspot: null, specsOpen: false, reserved: false };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const uiActions = {
  setColorway(i: number) {
    state = { ...state, colorway: i };
    emit();
  },
  setHotspot(id: string | null) {
    state = { ...state, hotspot: id };
    emit();
  },
  toggleSpecs(open?: boolean) {
    state = { ...state, specsOpen: open ?? !state.specsOpen };
    emit();
  },
  reserve() {
    state = { ...state, reserved: true };
    emit();
  },
};

/** Non-reactive read for the render loop. */
export const readUi = () => state;

export function useUi<T>(select: (s: UiState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => select(state),
    () => select(state),
  );
}
