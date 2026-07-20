import { useState, useCallback, useRef } from "react";

interface AISuggestionState {
  suggestion: string | null;
  isLoading: boolean;
  position: { line: number; column: number } | null;
  decoration: string[];
  isEnabled: boolean;
}

interface UseAISuggestionsReturn extends AISuggestionState {
  toggleEnabled: () => void;
  fetchSuggestion: (type: string, editor: any) => Promise<void>;
  acceptSuggestion: (editor: any, monaco: any) => void;
  rejectSuggestion: (editor: any) => void;
  clearSuggestion: (editor: any) => void;
}

export const useAISuggestions = (): UseAISuggestionsReturn => {
  const [state, setState] = useState<AISuggestionState>({
    suggestion: null,
    isLoading: false,
    position: null,
    decoration: [],
    isEnabled: true,
  });

  // Tracks the in-flight request so we can cancel it if a newer one starts
  const abortControllerRef = useRef<AbortController | null>(null);

  const toggleEnabled = useCallback(() => {
    setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const fetchSuggestion = useCallback(async (type: string, editor: any) => {
    if (!editor) return;

    const model = editor.getModel();
    const cursorPosition = editor.getPosition();

    if (!model || !cursorPosition) return;

    let shouldFetch = false;
    setState((currentState) => {
      // Don't queue a new request if one is already in flight
      if (!currentState.isEnabled || currentState.isLoading) return currentState;
      shouldFetch = true;
      return { ...currentState, isLoading: true };
    });

    if (!shouldFetch) return;

    // Cancel any stale request just in case, then start a fresh controller
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const payload = {
        fileContent: model.getValue(),
        cursorLine: cursorPosition.lineNumber - 1,
        cursorColumn: cursorPosition.column - 1,
        suggestionType: type,
      };

      const response = await fetch("/api/code-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();

      if (data.suggestion) {
        // Discard stale suggestion if the cursor moved while we were waiting
        const livePosition = editor.getPosition();
        const cursorMoved =
          !livePosition ||
          livePosition.lineNumber !== cursorPosition.lineNumber ||
          livePosition.column !== cursorPosition.column;

        if (cursorMoved) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        const suggestionText = data.suggestion.trim();
        setState((prev) => ({
          ...prev,
          suggestion: suggestionText,
          position: {
            line: cursorPosition.lineNumber,
            column: cursorPosition.column,
          },
          isLoading: false,
        }));
      } else {
        console.warn("No suggestion received from API.");
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        // Expected when we cancel a stale request — don't clear isLoading here,
        // the newer request that superseded this one owns that responsibility.
        return;
      }
      console.error("Error fetching code suggestion", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const acceptSuggestion = useCallback((editor: any, monaco: any) => {
    setState((currentState) => {
      if (
        !currentState.suggestion ||
        !currentState.position ||
        !editor ||
        !monaco
      ) {
        return currentState;
      }

      const { line, column } = currentState.position;
      const sanitizedSuggestion = currentState.suggestion.replace(
        /^\d+:\s*/gm,
        ""
      );

      editor.executeEdits("", [
        {
          range: new monaco.Range(line, column, line, column),
          text: sanitizedSuggestion,
          forceMoveMarker: true,
        },
      ]);

      if (currentState.decoration.length > 0) {
        editor.deltaDecorations(currentState.decoration, []);
      }

      return {
        ...currentState,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);

  const rejectSuggestion = useCallback((editor: any) => {
    setState((currentState) => {
      if (editor && currentState.decoration.length > 0) {
        editor.deltaDecorations(currentState.decoration, []);
      }
      return {
        ...currentState,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);

  const clearSuggestion = useCallback((editor: any) => {
    setState((currentState) => {
      if (editor && currentState.decoration.length > 0) {
        editor.deltaDecorations(currentState.decoration, []);
      }
      return {
        ...currentState,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);

  return {
    ...state,
    toggleEnabled,
    fetchSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestion,
  };
};