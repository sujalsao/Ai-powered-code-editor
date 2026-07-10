"use client"
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
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
import { Bot, Save, Settings, FileText, X } from 'lucide-react';

import { TemplateFileTree } from '../../../../modules/playground/components/playground-explorer';
import { useFileExplorer } from '../../../../modules/playground/hooks/useFileExplorer';
import { TemplateFile } from '../../../../modules/playground/lib/path-to-json';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import PlaygroundEditor from '../../../../modules/playground/components/playground-editor';
import WebContainerPreview from '../../../../modules/webcontainers/components/webcontainer-preview';
import { useWebContainers } from '../../../../modules/webcontainers/hooks/usewebcontainers';

const MainPlaygroundPage = () => {
    const { id } = useParams<{ id: string }>();
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const { playgroundData, templateData, isLoading, error } = usePlayground(id);
    const {
        setTemplateData,
        setActiveFileId,
        setPlaygroundId,
        activefileId,
        closeAllFiles,
        closeFile,
        openFiles,
        openFile,
        updateFileContent,
    } = useFileExplorer();

    const {
        serverUrl,
        isLoading: containerLoading,
        error: containerError,
        instance,
        writeFileSync
    } = useWebContainers({ templateData: templateData! });

    useEffect(() => {
        setPlaygroundId(id);
    }, [id, setPlaygroundId]);

    useEffect(() => {
        if (templateData && !openFiles.length) {
            setTemplateData(templateData);
        }
    }, [templateData, setTemplateData, openFiles.length]);

    const activeFile = openFiles.find((f) => f.id === activefileId);
    const hasUnsavedChanges = openFiles.some((f) => f.hasUnsavedchanges);

    const handleFileSelect = (file: TemplateFile) => {
        openFile(file);
    };

    // TODO: wire these up to real create/delete/rename logic
    const wrappedHandleAddFile = () => {};
    const wrappedHandleAddFolder = () => {};
    const wrappedHandleDeleteFile = () => {};
    const wrappedHandleDeleteFolder = () => {};
    const wrappedHandleRenameFile = () => {};
    const wrappedHandleRenameFolder = () => {};

    // TODO: implement real save logic
    const handleSave = () => {
        if (!activeFile) return;
    };
    const handleSaveAll = () => {};

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (error) {
        return <div className="flex h-screen items-center justify-center text-red-500">Error: {error}</div>;
    }

    if (!templateData) {
        return <div className="flex h-screen items-center justify-center">No template data available</div>;
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