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

      // Find cover image with more patterns
      let coverImage = null;
      for (const [path, file] of Object.entries(epub.files)) {
        if (
          path.match(/cover\.(jpg|jpeg|png)$/i) ||
          path.match(/cover-image\.(jpg|jpeg|png)$/i) ||
          path.toLowerCase().includes("cover") ||
          path.match(/^images?\/.*\.(jpg|jpeg|png)$/i)
        ) {
          console.log("Found potential cover image:", path);
          const imageContent = await file.async("base64");
          const ext = path.split(".").pop()?.toLowerCase();
          const mimeType = ext === "png" ? "image/png" : "image/jpeg";
          coverImage = `data:${mimeType};base64,${imageContent}`;
          break;
        }
      }

      // Log whether we found a cover
      console.log("Cover image found:", !!coverImage);

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

          // Extract chapter title from content
          const titleMatch = content.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
          const chapterTitle = titleMatch
            ? titleMatch[1].trim()
            : `Chapter ${chapters.length + 1}`;

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
            title: chapterTitle,
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
