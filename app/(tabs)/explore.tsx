import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useEffect } from "react";

export default function AddBookScreen() {
  useEffect(() => {
    const pickDocument = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ["application/epub+zip"],
          copyToCacheDirectory: true,
        });

        if (result.assets && result.assets[0]) {
          const file = result.assets[0];
          console.log("Selected file:", file.name, file.uri);
          // Here we'll handle the selected epub file
        }
      } catch (err) {
        console.log("Document picking error:", err);
      } finally {
        // Always go back to the home screen
        router.back();
      }
    };

    pickDocument();
  }, []);

  return null;
}
