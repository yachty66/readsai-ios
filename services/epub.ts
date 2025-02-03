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

      // First find and parse container.xml
      const containerXml = await epub
        .file("META-INF/container.xml")
        ?.async("text");
      const opfPath = containerXml?.match(/full-path="([^"]+)"/)?.[1];

      if (!opfPath) throw new Error("No OPF file found");

      // Parse OPF to get proper chapter titles
      const opfContent = await epub.file(opfPath)?.async("text");
      const chapters: Chapter[] = [];

      // Extract spine order and titles from OPF
      const titles = new Map();
      const titleMatches = opfContent?.matchAll(/<dc:title[^>]*>([^<]+)/g);
      for (const match of titleMatches || []) {
        titles.set(match[1], match[1]);
      }

      // Find HTML files in spine order
      for (const [path, file] of Object.entries(epub.files)) {
        if (path.endsWith(".html") || path.endsWith(".xhtml")) {
          const content = await file.async("text");
          const title = titles.get(path) || `Chapter ${chapters.length + 1}`;

          chapters.push({
            id: path,
            href: path,
            title,
            content,
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
