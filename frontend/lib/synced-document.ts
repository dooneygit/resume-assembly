import { errorMessage, type WriteOptions } from "./api";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type SyncSnapshot<T> = { value: T; status: SaveStatus; error: string | null };

const SAVE_DELAY_MS = 800;

/**
 * Frontend working copy of one backend document. Edits apply immediately,
 * writes are debounced, and a failed write rolls back to the last saved value.
 * Shaped for useSyncExternalStore.
 */
export class SyncedDocument<T> {
  private snapshot: SyncSnapshot<T>;
  private lastSaved: T;
  private dirty = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private listeners = new Set<() => void>();
  private save: (value: T, options?: WriteOptions) => Promise<void>;

  constructor(initial: T, save: (value: T, options?: WriteOptions) => Promise<void>) {
    this.lastSaved = initial;
    this.snapshot = { value: initial, status: "idle", error: null };
    this.save = save;
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  update = (fn: (prev: T) => T) => {
    this.dirty = true;
    this.set({ value: fn(this.snapshot.value) });
    clearTimeout(this.timer);
    this.timer = setTimeout(this.flush, SAVE_DELAY_MS);
  };

  /** Sends unsaved edits with keepalive so the request survives page unload. */
  flushOnUnload = () => {
    if (!this.dirty) return;
    clearTimeout(this.timer);
    this.save(this.snapshot.value, { keepalive: true }).catch(() => {});
  };

  private flush = async () => {
    const value = this.snapshot.value;
    this.dirty = false;
    this.set({ status: "saving", error: null });
    try {
      await this.save(value);
      this.lastSaved = value;
      if (!this.dirty) this.set({ status: "saved" });
    } catch (err) {
      clearTimeout(this.timer);
      this.dirty = false;
      this.set({ value: this.lastSaved, status: "error", error: errorMessage(err) });
    }
  };

  private set(patch: Partial<SyncSnapshot<T>>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }
}
