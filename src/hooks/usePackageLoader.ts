import { useState, useCallback, useRef } from 'react';
import type { PackageData, FileEntry } from '@/types/package';
import { parsePackage } from '@/services/packageParser';

interface UsePackageLoaderReturn {
  packageData: PackageData | null;
  isLoading: boolean;
  error: string | null;
  openPackage: () => Promise<void>;
  openPackageViaInput: (files: FileList) => Promise<void>;
  closePackage: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Read all files from a directory recursively (File System Access API)
 */
async function readDirectoryRecursive(
  handle: FileSystemDirectoryHandle,
  basePath: string = ''
): Promise<FileEntry[]> {
  const files: FileEntry[] = [];

  for await (const [name, entry] of handle.entries()) {
    const path = basePath ? `${basePath}/${name}` : name;

    if (entry.kind === 'file') {
      try {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        // Only read JSON files
        if (name.endsWith('.json')) {
          const content = await file.text();
          files.push({ path, content });
        }
      } catch (error) {
        console.warn(`Failed to read file ${path}:`, error);
      }
    } else if (entry.kind === 'directory') {
      // Skip node_modules and hidden directories
      if (name.startsWith('.') || name === 'node_modules') {
        continue;
      }
      const dirHandle = entry as FileSystemDirectoryHandle;
      const subFiles = await readDirectoryRecursive(dirHandle, path);
      files.push(...subFiles);
    }
  }

  return files;
}

/**
 * Read files from FileList (fallback for browsers without File System Access API)
 */
async function readFilesFromFileList(fileList: FileList): Promise<{ files: FileEntry[]; folderName: string }> {
  const files: FileEntry[] = [];
  let folderName = 'package';

  for (const file of Array.from(fileList)) {
    // webkitRelativePath contains the relative path including folder name
    // e.g., "my-package/transform/workflow.json"
    const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;

    // Extract folder name from first file
    if (folderName === 'package' && relativePath.includes('/')) {
      folderName = relativePath.split('/')[0] ?? 'package';
    }

    // Remove the root folder name from path
    const pathParts = relativePath.split('/');
    const path = pathParts.slice(1).join('/') || file.name;

    // Only process JSON files
    if (file.name.endsWith('.json')) {
      try {
        const content = await file.text();
        files.push({ path, content });
      } catch (error) {
        console.warn(`Failed to read file ${path}:`, error);
      }
    }
  }

  return { files, folderName };
}

/**
 * Hook for loading Reframe packages using File System Access API or fallback
 */
export function usePackageLoader(): UsePackageLoaderReturn {
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const usesFallback = !isFileSystemAccessSupported();

  const openPackage = useCallback(async () => {
    // If File System Access API is not supported, trigger the file input
    if (usesFallback) {
      inputRef.current?.click();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Open directory picker
      const dirHandle = await window.showDirectoryPicker!();
      const folderName = dirHandle.name;

      // Read all files recursively
      const files = await readDirectoryRecursive(dirHandle);

      // Parse the package
      const data = parsePackage(files, folderName);

      setPackageData(data);
    } catch (err) {
      // User cancelled the picker
      if (err instanceof Error && err.name === 'AbortError') {
        setIsLoading(false);
        return;
      }

      const message = err instanceof Error ? err.message : 'Failed to load package';
      setError(message);
      setPackageData(null);
    } finally {
      setIsLoading(false);
    }
  }, [usesFallback]);

  const openPackageViaInput = useCallback(async (fileList: FileList) => {
    if (fileList.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const { files, folderName } = await readFilesFromFileList(fileList);

      // Parse the package
      const data = parsePackage(files, folderName);

      setPackageData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load package';
      setError(message);
      setPackageData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closePackage = useCallback(() => {
    setPackageData(null);
    setError(null);
  }, []);

  return {
    packageData,
    isLoading,
    error,
    openPackage,
    openPackageViaInput,
    closePackage,
    inputRef,
  };
}
