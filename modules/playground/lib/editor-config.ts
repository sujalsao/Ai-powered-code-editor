import type { editor } from "monaco-editor";
import type { Monaco } from "@monaco-editor/react";

export const defaultEditorOptions: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
  fontLigatures: true,
  fontWeight: "400",
  minimap: {
    enabled: true,
    size: "proportional",
    showSlider: "mouseover",
  },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  lineNumbers: "on",
  stickyScroll: {
    enabled: true,
  },
};

export function getEditorLanguage(extension: string): string {
  switch (extension.toLowerCase()) {
    case "ts":
      return "typescript";

    case "tsx":
      return "typescript";

    case "js":
      return "javascript";

    case "jsx":
      return "javascript";

    case "json":
      return "json";

    case "html":
      return "html";

    case "css":
      return "css";

    case "scss":
      return "scss";

    case "sass":
      return "scss";

    case "md":
      return "markdown";

    case "py":
      return "python";

    case "java":
      return "java";

    case "cpp":
    case "cc":
    case "cxx":
      return "cpp";

    case "c":
      return "c";

    case "cs":
      return "csharp";

    case "php":
      return "php";

    case "go":
      return "go";

    case "rs":
      return "rust";

    case "xml":
      return "xml";

    case "yaml":
    case "yml":
      return "yaml";

    case "sql":
      return "sql";

    case "sh":
      return "shell";

    default:
      return "plaintext";
  }
}

export function configureMonaco(monaco: Monaco) {
  monaco.editor.defineTheme("custom-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {},
  });

  monaco.editor.setTheme("custom-dark");
}