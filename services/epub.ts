import * as FileSystem from "expo-file-system";
import JSZip from "jszip";

type Chapter = {
  id: string;
  href: string;
  title: string;
  content: string;
};

export const EPUBService = {
  extractEPUB: async (epubPath: string) => {
    try {
      // Read the EPUB file as base64
      const content = await FileSystem.readAsStringAsync(epubPath, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Load it as a ZIP
      const zip = new JSZip();
      const epub = await zip.loadAsync(content, { base64: true });

      // Find HTML files (chapters)
      const chapters: Chapter[] = [];
      for (const [path, file] of Object.entries(epub.files)) {
        if (path.endsWith(".html") || path.endsWith(".xhtml")) {
          const content = await file.async("text");
          chapters.push({
            id: path,
            href: path,
            title: `Chapter ${chapters.length + 1}`,
            content: content,
          });
        }
      }

      return { chapters };
    } catch (error) {
      console.error("Error extracting EPUB:", error);
      throw error;
    }
  },
};
