import { useEffect, useState, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { TemplateFolder } from '../../playground/lib/path-to-json';

interface UseWebContainersProps {
    templateData: TemplateFolder;
}

interface UseWebContainersReturn {
    webContainer: WebContainer | null;
    isLoading: boolean;
    error: string | null;
    instance: WebContainer | null;
    serverUrl: string | null;
    writeFileSync: (path: string, content: string) => Promise<void>;
    destroy: () => Promise<void>;
}

export const useWebContainers = ({ templateData }: UseWebContainersProps): UseWebContainersReturn => {
    const [serverUrl, setServerUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [instance, setInstance] = useState<WebContainer | null>(null);

    useEffect(() => {
        let mounted = true;
        let localInstance: WebContainer | null = null;

        async function initWebContainer() {
            try {
                const webContainerInstance = await WebContainer.boot();
                if (!mounted) return;

                localInstance = webContainerInstance;
                setInstance(webContainerInstance);
                setIsLoading(false);
            } catch (err) {
                console.error('Error initializing WebContainer:', err);
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer');
                    setIsLoading(false);
                }
            }
        }

        initWebContainer();

        return () => {
            mounted = false;
            if (localInstance) {
                localInstance.teardown();
            }
        };
    }, []);

    const writeFileSync = useCallback(async (path: string, content: string): Promise<void> => {
        if (!instance) {
            throw new Error('Web container instance not available');
        }
        try {
            const pathParts = path.split("/");
            const folderPath = pathParts.slice(0, -1).join("/");

            if (folderPath) {
                await instance.fs.mkdir(folderPath, { recursive: true }); // create folder structure recursively
            }
            await instance.fs.writeFile(path, content);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to write file";
            console.error(`Failed to write path at ${path}:`, error);
            throw new Error(`Failed to write path at ${path}: ${errorMessage}`);
        }
    }, [instance]);

    const destroy = useCallback(async (): Promise<void> => {
        if (instance) {
            await instance.teardown();
            setInstance(null);
            setServerUrl(null);
        }
    }, [instance]);

    return { webContainer: instance, isLoading, error, instance, serverUrl, writeFileSync, destroy };
};