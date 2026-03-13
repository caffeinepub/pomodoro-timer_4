import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Preferences } from "../backend.d";
import { useActor } from "./useActor";

export function useGetPreferences() {
  const { actor, isFetching } = useActor();
  return useQuery<Preferences>({
    queryKey: ["preferences"],
    queryFn: async () => {
      if (!actor) {
        return {
          selectedPreset: "25/5",
          customWorkMinutes: 25n,
          customRestMinutes: 5n,
          displayMode: "digital",
          background: "default",
        };
      }
      return actor.getPreferences();
    },
    enabled: !isFetching,
  });
}

export function useUpdatePreferences() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Preferences) => {
      if (!actor) return;
      await actor.updatePreferences(
        prefs.selectedPreset,
        prefs.customWorkMinutes,
        prefs.customRestMinutes,
        prefs.displayMode,
        prefs.background,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
  });
}
