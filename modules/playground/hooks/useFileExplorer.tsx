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

    //File explorer methods
    handleAddFile: (
    newFile: TemplateFile,
    parentPath: string,
    writeFileSync: (filePath: string, content: string) => Promise<void>,
    instance: any,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;

  handleAddFolder: (
    newFolder: TemplateFolder, 
    parentPath: string, 
    instance: any, 
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;

  handleDeleteFile: (
    file: TemplateFile, 
    parentPath: string, 
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;
  handleDeleteFolder: (
    folder: TemplateFolder,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;
  handleRenameFile: (
    file: TemplateFile,
    newFilename: string,
    newExtension: string,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;
  handleRenameFolder: (
    folder: TemplateFolder,
    newFolderName: string,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;
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

    handleAddFile:async(newFile , parentPath , writeFileSync , instance , saveTemplateData)=>{
        const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(JSON.stringify(templateData)) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      currentFolder.items.push(newFile);
      set({ templateData: updatedTemplateData });
      toast.success(`Created file: ${newFile.filename}.${newFile.fileExtension}`);

      // Use the passed saveTemplateData function
      await saveTemplateData(updatedTemplateData);

      // Sync with web container
      if (writeFileSync) {
        const filePath = parentPath
          ? `${parentPath}/${newFile.filename}.${newFile.fileExtension}`
          : `${newFile.filename}.${newFile.fileExtension}`;
        await writeFileSync(filePath, newFile.content || "");
      }

      get().openFile(newFile);
    } catch (error) {
      console.error("Error adding file:", error);
      toast.error("Failed to create file");
    }
  },

    handleAddFolder: async (newFolder, parentPath, instance, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(JSON.stringify(templateData)) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      currentFolder.items.push(newFolder);
      set({ templateData: updatedTemplateData });
      toast.success(`Created folder: ${newFolder.folderName}`);

      // Use the passed saveTemplateData function
      await saveTemplateData(updatedTemplateData);

      // Sync with web container
      if (instance && instance.fs) {
        const folderPath = parentPath
          ? `${parentPath}/${newFolder.folderName}`
          : newFolder.folderName;
        await instance.fs.mkdir(folderPath, { recursive: true });
      }
    } catch (error) {
      console.error("Error adding folder:", error);
      toast.error("Failed to create folder");
    }
  },

    handleDeleteFile: async (file, parentPath, saveTemplateData) => {
    const { templateData, openFiles } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData)
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      currentFolder.items = currentFolder.items.filter(
        (item) =>
          !("filename" in item) ||
          item.filename !== file.filename ||
          item.fileExtension !== file.fileExtension
      );

      // Find and close the file if it's open
      // Use the same ID generation logic as in openFile
      const fileId = generateFileId(file, templateData);
      const matchingOpenFile = openFiles.find((f) => f.id === fileId);

      if (matchingOpenFile) {
        // Close the file using the closeFile method
        get().closeFile(fileId);
      }

      set({ templateData: updatedTemplateData });

      // Use the passed saveTemplateData function
      await saveTemplateData(updatedTemplateData);
      toast.success(`Deleted file: ${file.filename}.${file.fileExtension}`);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  },

    handleDeleteFolder: async (folder, parentPath, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData)
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      currentFolder.items = currentFolder.items.filter(
        (item) =>
          !("folderName" in item) || item.folderName !== folder.folderName
      );

      // Close all files in the deleted folder recursively
      const closeFilesInFolder = (folder: TemplateFolder, currentPath: string = "") => {
        folder.items.forEach((item) => {
          if ("filename" in item) {
            // Generate the correct file ID using the same logic as openFile
            const fileId = generateFileId(item, templateData);
            get().closeFile(fileId);
          } else if ("folderName" in item) {
            const newPath = currentPath ? `${currentPath}/${item.folderName}` : item.folderName;
            closeFilesInFolder(item, newPath);
          }
        });
      };
      
      closeFilesInFolder(folder, parentPath ? `${parentPath}/${folder.folderName}` : folder.folderName);

      set({ templateData: updatedTemplateData });

      // Use the passed saveTemplateData function
      await saveTemplateData(updatedTemplateData);
      toast.success(`Deleted folder: ${folder.folderName}`);
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  },

   handleRenameFile: async (
    file,
    newFilename,
    newExtension,
    parentPath,
    saveTemplateData
  ) => {
    const { templateData, openFiles, activefileId } = get();
    if (!templateData) return;

    // Generate old and new file IDs using the same logic as openFile
    const oldFileId = generateFileId(file, templateData);
    const newFile = { ...file, filename: newFilename, fileExtension: newExtension };
    const newFileId = generateFileId(newFile, templateData);

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData)
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      const fileIndex = currentFolder.items.findIndex(
        (item) =>
          "filename" in item &&
          item.filename === file.filename &&
          item.fileExtension === file.fileExtension
      );

      if (fileIndex !== -1) {
        const updatedFile = {
          ...currentFolder.items[fileIndex],
          filename: newFilename,
          fileExtension: newExtension,
        } as TemplateFile;
        currentFolder.items[fileIndex] = updatedFile;

        // Update open files with new ID and names
        const updatedOpenFiles = openFiles.map((f) =>
          f.id === oldFileId
            ? {
                ...f,
                id: newFileId,
                filename: newFilename,
                fileExtension: newExtension,
              }
            : f
        );

        set({
          templateData: updatedTemplateData,
          openFiles: updatedOpenFiles,
          activefileId: activefileId === oldFileId ? newFileId : activefileId,
        });

        // Use the passed saveTemplateData function
        await saveTemplateData(updatedTemplateData);
        toast.success(`Renamed file to: ${newFilename}.${newExtension}`);
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("Failed to rename file");
    }
  },

  
  handleRenameFolder: async (folder, newFolderName, parentPath, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData)
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      const folderIndex = currentFolder.items.findIndex(
        (item) => "folderName" in item && item.folderName === folder.folderName
      );

      if (folderIndex !== -1) {
        const updatedFolder = {
          ...currentFolder.items[folderIndex],
          folderName: newFolderName,
        } as TemplateFolder;
        currentFolder.items[folderIndex] = updatedFolder;

        set({ templateData: updatedTemplateData });

        // Use the passed saveTemplateData function
        await saveTemplateData(updatedTemplateData);
        toast.success(`Renamed folder to: ${newFolderName}`);
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Failed to rename folder");
    }
  },

}));