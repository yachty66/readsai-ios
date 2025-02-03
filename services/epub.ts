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
      const content = await FileSystem.readAsStringAsync(epubPath, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const zip = new JSZip();
      const epub = await zip.loadAsync(content, { base64: true });

      // Find and parse the OPF file to get metadata
      let title = null;
      for (const [path, file] of Object.entries(epub.files)) {
        if (path.endsWith(".opf")) {
          const opfContent = await file.async("text");
          const titleMatch = opfContent.match(
            /<dc:title[^>]*>([^<]+)<\/dc:title>/
          );
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].trim();
          }
          break;
        }
      }

      // Find cover image (usually named cover.jpg or similar)
      let coverImage = null;
      for (const [path, file] of Object.entries(epub.files)) {
        if (path.match(/cover\.(jpg|jpeg|png)$/i)) {
          const imageContent = await file.async("base64");
          const ext = path.split(".").pop()?.toLowerCase();
          const mimeType = ext === "png" ? "image/png" : "image/jpeg";
          coverImage = `data:${mimeType};base64,${imageContent}`;
          break;
        }
      }

      // Extract images first and create blob URLs
      const images = new Map();
      for (const [path, file] of Object.entries(epub.files)) {
        if (path.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
          const imageContent = await file.async("base64");
          const mimeType = path.toLowerCase().endsWith("svg")
            ? "image/svg+xml"
            : path.toLowerCase().endsWith("png")
            ? "image/png"
            : "image/jpeg";
          images.set(path, `data:${mimeType};base64,${imageContent}`);
        }
      }

      // Process chapters and replace image sources
      const chapters: Chapter[] = [];
      for (const [path, file] of Object.entries(epub.files)) {
        if (path.endsWith(".html") || path.endsWith(".xhtml")) {
          let content = await file.async("text");

          // Replace image sources with base64 data URLs
          for (const [imgPath, dataUrl] of images.entries()) {
            const relativePath = imgPath.split("/").pop();
            content = content.replace(
              new RegExp(`src=["'](?:.*?${relativePath})["']`, "gi"),
              `src="${dataUrl}"`
            );
          }

          chapters.push({
            id: path,
            href: path,
            title: `Chapter ${chapters.length + 1}`,
            content,
          });
        }
      }

      return {
        chapters,
        coverImage,
        title,
      };
    } catch (error) {
      console.error("Error extracting EPUB:", error);
      throw error;
    }
  },
};
