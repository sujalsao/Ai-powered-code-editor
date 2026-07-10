import { TemplateFile, TemplateFolder, TemplateItem } from "../../playground/lib/path-to-json";

interface WebContainerFile {
  file: {
    contents: string;
  };
}

interface WebContainerDirectory {
  directory: {
    [key: string]: WebContainerFile | WebContainerDirectory;
  };
}

type WebContainerFileSystem = Record<string, WebContainerFile | WebContainerDirectory>;

function isTemplateFolder(item: TemplateItem): item is TemplateFolder {
  return "folderName" in item;
}

export function transformToWebContainerFormat(
  template: TemplateFolder
): WebContainerFileSystem {
  function processItem(item: TemplateItem): WebContainerFile | WebContainerDirectory {
    if (isTemplateFolder(item)) {
      // This is a directory
      const directoryContents: WebContainerFileSystem = {};

      item.items.forEach((subItem) => {
        const key = isTemplateFolder(subItem)
          ? subItem.folderName
          : `${subItem.filename}.${subItem.fileExtension}`;
        directoryContents[key] = processItem(subItem);
      });

      return {
        directory: directoryContents,
      };
    } else {
      // This is a file
      return {
        file: {
          contents: item.content,
        },
      };
    }
  }

  const result: WebContainerFileSystem = {};

  template.items.forEach((item) => {
    const key = isTemplateFolder(item)
      ? item.folderName
      : `${item.filename}.${item.fileExtension}`;
    result[key] = processItem(item);
  });

  return result;
}