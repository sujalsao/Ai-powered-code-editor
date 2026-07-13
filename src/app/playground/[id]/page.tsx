"use client"
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';
import { usePlayground } from '../../../../modules/playground/hooks/usePlaygound';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Bot, Save, Settings, FileText, X, FolderOpen } from 'lucide-react';

import { TemplateFileTree } from '../../../../modules/playground/components/playground-explorer';
import { useFileExplorer } from '../../../../modules/playground/hooks/useFileExplorer';
import { TemplateFile, TemplateFolder } from '../../../../modules/playground/lib/path-to-json';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import PlaygroundEditor from '../../../../modules/playground/components/playground-editor';
import WebContainerPreview from '../../../../modules/webcontainers/components/webcontainer-preview';
import { useWebContainers } from '../../../../modules/webcontainers/hooks/usewebcontainers';
import { findFilePath } from '../../../../modules/playground/lib';

// TODO: this is a placeholder — LoadingStep was referenced below but never defined
// or imported anywhere in the original file. Replace with your real shared component
// if one already exists elsewhere in the codebase.
const LoadingStep = ({
    currentStep,
    step,
    label,
}: {
    currentStep: number;
    step: number;
    label: string;
}) => {
    const isComplete = currentStep > step;
    const isActive = currentStep === step;
    return (
        <div className="flex items-center gap-3 mb-3">
            <div
                className={`h-2 w-2 rounded-full ${
                    isComplete ? "bg-green-500" : isActive ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                }`}
            />
            <span className={`text-sm ${isActive ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
        </div>
    );
};

const MainPlaygroundPage = () => {
    const { id } = useParams<{ id: string }>();
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    // NOTE: `saveTemplateData` wasn't defined anywhere in the original file but was
    // used by the wrapped handlers below. Pulling it from usePlayground since that's
    // where playgroundData/templateData/loading/error already live — move this
    // destructure if saveTemplateData actually lives in a different hook.
    // IMPORTANT: for the `newTemplateData || updatedTemplateData` check further down
    // to typecheck, saveTemplateData's own definition (in usePlayground) must return
    // Promise<TemplateFolder> (or similar) rather than Promise<void>. If it currently
    // returns void, update it there so callers actually get the saved data back.
    const { playgroundData, templateData, isLoading, error, saveTemplateData } = usePlayground(id);

    const {
        setTemplateData,
        setActiveFileId,
        setPlaygroundId,
        activefileId,
        closeAllFiles,
        closeFile,
        openFiles,
        setOpenFiles,
        openFile,
        updateFileContent,

        handleAddFile,
        handleAddFolder,
        handleDeleteFolder,
        handleDeleteFile,
        handleRenameFolder,
        handleRenameFile,
    } = useFileExplorer();

    const {
        serverUrl,
        isLoading: containerLoading,
        error: containerError,
        instance,
        writeFileSync
    } = useWebContainers({ templateData: templateData! });

    const lastSyncedContent = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        setPlaygroundId(id);
    }, [id, setPlaygroundId]);

    useEffect(() => {
        if (templateData && !openFiles.length) {
            setTemplateData(templateData);
        }
    }, [templateData, setTemplateData, openFiles.length]);

    // Wrapper functions that pass saveTemplateData through to the file-explorer handlers
    const wrappedHandleAddFile = useCallback(
        (newFile: TemplateFile, parentPath: string) => {
            return handleAddFile(
                newFile,
                parentPath,
                writeFileSync!,
                instance,
                saveTemplateData
            );
        },
        [handleAddFile, writeFileSync, instance, saveTemplateData]
    );

    const wrappedHandleAddFolder = useCallback(
        (newFolder: TemplateFolder, parentPath: string) => {
            return handleAddFolder(newFolder, parentPath, instance, saveTemplateData);
        },
        [handleAddFolder, instance, saveTemplateData]
    );

    const wrappedHandleDeleteFile = useCallback(
        (file: TemplateFile, parentPath: string) => {
            return handleDeleteFile(file, parentPath, saveTemplateData);
        },
        [handleDeleteFile, saveTemplateData]
    );

    const wrappedHandleDeleteFolder = useCallback(
        (folder: TemplateFolder, parentPath: string) => {
            return handleDeleteFolder(folder, parentPath, saveTemplateData);
        },
        [handleDeleteFolder, saveTemplateData]
    );

    const wrappedHandleRenameFile = useCallback(
        (
            file: TemplateFile,
            newFilename: string,
            newExtension: string,
            parentPath: string
        ) => {
            return handleRenameFile(
                file,
                newFilename,
                newExtension,
                parentPath,
                saveTemplateData
            );
        },
        [handleRenameFile, saveTemplateData]
    );

    const wrappedHandleRenameFolder = useCallback(
        (folder: TemplateFolder, newFolderName: string, parentPath: string) => {
            return handleRenameFolder(
                folder,
                newFolderName,
                parentPath,
                saveTemplateData
            );
        },
        [handleRenameFolder, saveTemplateData]
    );

    const activeFile = openFiles.find((f) => f.id === activefileId);
    const hasUnsavedChanges = openFiles.some((f) => f.hasUnsavedchanges);

    const handleFileSelect = (file: TemplateFile) => {
        openFile(file);
    };

    const handleSave = useCallback(
        async (fileId?: string) => {
            const targetFileId = fileId || activefileId;
            if (!targetFileId) return;

            const fileToSave = openFiles.find((f) => f.id === targetFileId);
            if (!fileToSave) return;

            const latestTemplateData = useFileExplorer.getState().templateData;

            // FIX: latestTemplateData is typed `TemplateFolder | null`, but
            // findFilePath expects a non-null TemplateFolder. Guard here so
            // TypeScript narrows the type for everything below.
            if (!latestTemplateData) {
                toast.error("Template data not available");
                return;
            }

            try {
                const filePath = findFilePath(fileToSave, latestTemplateData);
                if (!filePath) {
                    toast.error(
                        `could not find path or file: ${fileToSave.filename}.${fileToSave.fileExtension}`
                    );
                    return;
                }

                const updatedTemplateData = JSON.parse(JSON.stringify(latestTemplateData));

                // FIX: added an explicit return type annotation (`: any[]`) so this
                // recursive function no longer implicitly resolves to `any`.
                const applyContentUpdate = (items: any[]): any[] =>
                    items.map((item) => {
                        if ("folderName" in item) {
                            return { ...item, items: applyContentUpdate(item.items) };
                        } else if (
                            item.filename === fileToSave.filename &&
                            item.fileExtension === fileToSave.fileExtension
                        ) {
                            return { ...item, content: fileToSave.content };
                        }
                        return item;
                    });
                updatedTemplateData.items = applyContentUpdate(updatedTemplateData.items);

                // Sync with WebContainer
                if (writeFileSync) {
                    await writeFileSync(filePath, fileToSave.content);
                    lastSyncedContent.current.set(fileToSave.id, fileToSave.content);
                    if (instance && instance.fs) {
                        await instance.fs.writeFile(filePath, fileToSave.content);
                    }
                }

                // FIX: this line only typechecks once saveTemplateData is declared
                // (in usePlayground) to return Promise<TemplateFolder> rather than
                // Promise<void>. If you can't change that hook right now, replace
                // with:
                  const newTemplateData = (await saveTemplateData(updatedTemplateData)) as TemplateFolder | undefined;
                  setTemplateData(newTemplateData ?? updatedTemplateData);
                

                // Update open files
                const updatedOpenFiles = openFiles.map((f) =>
                    f.id === targetFileId
                        ? {
                              ...f,
                              content: fileToSave.content,
                              originalContent: fileToSave.content,
                              hasUnsavedchanges: false,
                          }
                        : f
                );
                setOpenFiles(updatedOpenFiles);

                toast.success(`Saved ${fileToSave.filename}.${fileToSave.fileExtension}`);
            } catch (error) {
                console.error("Error saving file:", error);
                toast.error(`Failed to save ${fileToSave.filename}.${fileToSave.fileExtension}`);
                throw error;
            }
        },
        [
            activefileId,
            openFiles,
            writeFileSync,
            instance,
            saveTemplateData,
            setTemplateData,
            setOpenFiles,
        ]
    );

    const handleSaveAll = async () => {
        const unsavedFiles = openFiles.filter((f) => f.hasUnsavedchanges);

        if (unsavedFiles.length === 0) {
            toast.info("No unsaved changes");
            return;
        }

        try {
            await Promise.all(unsavedFiles.map((f) => handleSave(f.id)));
            toast.success(`Saved ${unsavedFiles.length} file(s)`);
        } catch (error) {
            toast.error("Failed to save some files");
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSave]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                    Something went wrong
                </h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="destructive">
                    Try Again
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
                <div className="w-full max-w-md p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold mb-6 text-center">
                        Loading Playground
                    </h2>
                    <div className="mb-8">
                        <LoadingStep currentStep={1} step={1} label="Loading playground data" />
                        <LoadingStep currentStep={2} step={2} label="Setting up environment" />
                        <LoadingStep currentStep={3} step={3} label="Ready to code" />
                    </div>
                </div>
            </div>
        );
    }

    // No template data
    if (!templateData) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
                <FolderOpen className="h-12 w-12 text-amber-500 mb-4" />
                <h2 className="text-xl font-semibold text-amber-600 mb-2">
                    No template data available
                </h2>
                <Button onClick={() => window.location.reload()} variant="outline">
                    Reload Template
                </Button>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <>
                <TemplateFileTree
                    data={templateData}
                    onFileSelect={handleFileSelect}
                    selectedFile={activeFile}
                    title="File Explorer"
                    onAddFile={wrappedHandleAddFile}
                    onAddFolder={wrappedHandleAddFolder}
                    onDeleteFile={wrappedHandleDeleteFile}
                    onDeleteFolder={wrappedHandleDeleteFolder}
                    onRenameFile={wrappedHandleRenameFile}
                    onRenameFolder={wrappedHandleRenameFolder}
                />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />

                        <div className="flex flex-1 items-center gap-2">
                            <div className="flex flex-col flex-1">
                                <h1 className="text-sm font-medium">
                                    {playgroundData?.title || "Code Playground"}
                                </h1>
                                <p className="text-xs text-muted-foreground">
                                    {openFiles.length} File(s) Open
                                    {hasUnsavedChanges && " • Unsaved changes"}
                                </p>
                            </div>

                            <div className="flex items-center gap-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSave()}
                                            disabled={!activeFile || !activeFile.hasUnsavedchanges}
                                        >
                                            <Save className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Save (Ctrl+S)</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleSaveAll}
                                            disabled={!hasUnsavedChanges}
                                        >
                                            <Save className="h-4 w-4" /> All
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Save All (Ctrl+Shift+S)</TooltipContent>
                                </Tooltip>

                                {/* TODO: implement AI suggestions toggle once that feature is built */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="sm" variant="outline" disabled>
                                            <Bot className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>AI Suggestions (coming soon)</TooltipContent>
                                </Tooltip>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsPreviewVisible(!isPreviewVisible)}>
                                            {isPreviewVisible ? "Hide" : "Show"} Preview
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={closeAllFiles}>
                                            Close All Files
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </header>

                    <div className="h-[calc(100vh-4rem)]">
                        {openFiles.length > 0 ? (
                            <div className="h-full flex flex-col">
                                <div className="border-b bg-muted/30">
                                    <Tabs value={activefileId || ""} onValueChange={setActiveFileId}>
                                        <div className="flex items-center justify-between px-4 py-2">
                                            <TabsList className="h-8 bg-transparent p-0">
                                                {openFiles.map((file) => (
                                                    <TabsTrigger
                                                        key={file.id}
                                                        value={file.id}
                                                        className="relative h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm group"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-3 w-3" />
                                                            <span>
                                                                {file.filename}.{file.fileExtension}
                                                            </span>
                                                            {file.hasUnsavedchanges && (
                                                                <span className="h-2 w-2 rounded-full bg-orange-500" />
                                                            )}
                                                            <span
                                                                className="ml-2 h-4 w-4 hover:bg-destructive hover:text-destructive-foreground rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    closeFile(file.id);
                                                                }}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </span>
                                                        </div>
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>

                                            {openFiles.length > 1 && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={closeAllFiles}
                                                    className="h-6 px-2 text-xs"
                                                >
                                                    Close All
                                                </Button>
                                            )}
                                        </div>
                                    </Tabs>
                                </div>

                                <div className="flex-1">
                                    <ResizablePanelGroup orientation="horizontal" className="h-full">
                                        <ResizablePanel defaultSize={isPreviewVisible ? 50 : 100}>
                                            <PlaygroundEditor
                                                activeFile={activeFile}
                                                content={activeFile?.content ?? ""}
                                                onContentChange={(value) =>
                                                    activefileId && updateFileContent(activefileId, value)
                                                }
                                            />
                                        </ResizablePanel>

                                        {isPreviewVisible && (
                                            <>
                                                <ResizableHandle />
                                                <ResizablePanel defaultSize={50}>
                                                    <WebContainerPreview
                                                        templateData={templateData}
                                                        instance={instance}
                                                        writeFileSync={writeFileSync}
                                                        isLoading={containerLoading}
                                                        error={containerError}
                                                        serverUrl={serverUrl ?? ""}
                                                        forceResetup={false}
                                                    />
                                                </ResizablePanel>
                                            </>
                                        )}
                                    </ResizablePanelGroup>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-4">
                                <FileText className="h-16 w-16 text-gray-300" />
                                <div className="text-center">
                                    <p className="text-lg font-medium">No files open</p>
                                    <p className="text-sm text-gray-500">
                                        Select a file from the sidebar to start editing
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </SidebarInset>
            </>
        </TooltipProvider>
    );
};

export default MainPlaygroundPage;