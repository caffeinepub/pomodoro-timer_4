import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Preferences {
    customRestMinutes: bigint;
    background: string;
    displayMode: string;
    selectedPreset: string;
    customWorkMinutes: bigint;
}
export interface backendInterface {
    getAllPreferences(): Promise<Array<Preferences>>;
    getPreferences(): Promise<Preferences>;
    updatePreferences(selectedPreset: string, customWorkMinutes: bigint, customRestMinutes: bigint, displayMode: string, background: string): Promise<void>;
}
