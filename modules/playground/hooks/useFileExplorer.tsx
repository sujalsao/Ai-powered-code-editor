import { create } from 'zustand';
import { toast } from 'sonner';
import { TemplateFile, TemplateFolder } from '../lib/path-to-json';
import { generateFileId } from '../lib';

interface OpenFile extends TemplateFile {
    id: string;
    hasUnsavedchanges: boolean;
    content: string;
    originalContent: string;
}

interface FileExplorerState {
    playgroundId: string;
    templateData: TemplateFolder | null;
    openFiles: OpenFile[];
    activefileId: string | null;
    editorContent: string;

    // setter functions
    setPlaygroundId: (id: string) => void;
    setTemplateData: (data: TemplateFolder) => void;
    setEditorContent: (content: string) => void;
    setOpenFiles: (files: OpenFile[]) => void;
    setActiveFileId: (id: string | null) => void;

    // functions
    openFile: (file: TemplateFile) => void;
    closeFile: (fileId: string) => void;
    closeAllFiles: () => void;
    updateFileContent: (fileId: string, content: string) => void;
}

export const useFileExplorer = create<FileExplorerState>((set, get) => ({
    templateData: null,
    playgroundId: "",
    openFiles: [],
    activefileId: null,
    editorContent: "",

    setTemplateData: (data) => set({ templateData: data }),
    setPlaygroundId: (id) => set({ playgroundId: id }),
    setEditorContent: (content) => set({ editorContent: content }),
    setOpenFiles: (files) => set({ openFiles: files }),
    setActiveFileId: (id) => set({ activefileId: id }),

    openFile: (file) => {
        const fileId = generateFileId(file, get().templateData!);
        const existingFile = get().openFiles.find((f) => f.id === fileId);
        if (existingFile) {
            set({ activefileId: fileId, editorContent: existingFile.content });
            return;
        }
        const newOpenFile: OpenFile = {
            ...file,
            id: fileId,
            hasUnsavedchanges: false,
            content: file.content || "",
            originalContent: file.content || "",
        };
        set((state) => ({
            openFiles: [...state.openFiles, newOpenFile],
            activefileId: fileId,
            editorContent: file.content || "",
        }));
    },

    closeFile: (fileId) => {
        const { openFiles, activefileId } = get();
        const newFiles = openFiles.filter((f) => f.id !== fileId);

        let newActiveFileId = activefileId;
        let newEditorContent = get().editorContent;

        if (activefileId === fileId) {
            if (newFiles.length > 0) {
                newActiveFileId = newFiles[newFiles.length - 1].id;
                newEditorContent = newFiles[newFiles.length - 1].content;
            } else {
                newActiveFileId = null;
                newEditorContent = "";
            }
        }
        set({ openFiles: newFiles, activefileId: newActiveFileId, editorContent: newEditorContent });
    },

    closeAllFiles: () => set({ openFiles: [], activefileId: null, editorContent: "" }),

    updateFileContent: (fileId, content) => {
        set((state) => ({
            openFiles: state.openFiles.map((f) =>
                f.id === fileId
                    ? { ...f, content, hasUnsavedchanges: content !== f.originalContent }
                    : f
            ),
            editorContent: state.activefileId === fileId ? content : state.editorContent,
        }));
    },
}));