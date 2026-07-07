"use client"
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { usePlayground } from '../../../../modules/playground/hooks/usePlaygound';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TemplateFileTree } from '../../../../modules/playground/components/playground-explorer';
import { useFileExplorer } from '../../../../modules/playground/hooks/useFileExplorer';
import { TemplateFile } from '../../../../modules/playground/lib/path-to-json';

const MainPlaygroundPage = () => {
    const { id } = useParams<{ id: string }>();

    const { playgroundData, templateData, isLoading, error, loadPlayground, saveTemplateData } = usePlayground(id);
    const {
        setTemplateData,
        setActiveFileId,
        setPlaygroundId,
        setOpenFiles,
        activefileId,
        closeAllFiles,
        openFiles,
        openFile,
    } = useFileExplorer();

    useEffect(() => { setPlaygroundId(id); }, [id, setPlaygroundId]);

    useEffect(() => {
        if (templateData && !openFiles.length) {
            setTemplateData(templateData);
        }
    }, [templateData, setTemplateData, openFiles.length]);

    const activeFile = openFiles.find((f) => f.id === activefileId) ?? undefined;
    const hasUnsavedChanges = openFiles.some((f) => f.hasUnsavedchanges);

    const handleFileSelect = (file: TemplateFile) => {
        openFile(file);
    };

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
            <div className="flex h-screen">
                <TemplateFileTree
                    data={templateData}
                    onFileSelect={handleFileSelect}
                    selectedFile={activeFile}
                    title="File Explorer"
                    onAddFile={() => {}}
                    onAddFolder={() => {}}
                    onDeleteFile={() => {}}
                    onDeleteFolder={() => {}}
                    onRenameFile={() => {}}
                    onRenameFolder={() => {}}
                />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </header>
                    <div className="flex flex-1 items-center gap-2">
                        <div className="flex flex-1 flex-col">
                            <h1 className="text-sm font-medium">{playgroundData?.title || "codePlayground"}</h1>
                        </div>
                    </div>
                </SidebarInset>
            </div>
        </TooltipProvider>
    );
};

export default MainPlaygroundPage;