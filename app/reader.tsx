import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { WebView } from "react-native-webview";
import { EPUBService } from "@/services/epub";

export default function ReaderScreen() {
  const { path, name } = useLocalSearchParams();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);

  useEffect(() => {
    const loadBook = async () => {
      try {
        const { chapters } = await EPUBService.extractEPUB(path as string);
        setChapters(chapters);
      } catch (error) {
        console.error("Error loading book:", error);
      }
    };

    loadBook();
  }, [path]);

  const currentContent = chapters[currentChapter]?.content || "";

  return (
    <>
      <Stack.Screen
        options={{
          title: name as string,
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#FFFFFF",
        }}
      />
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <WebView
          source={{
            html: `
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                  <style>
                    body {
                      padding: 20px;
                      font-family: system-ui;
                      line-height: 1.6;
                      color: #333;
                      background: white;
                    }
                  </style>
                </head>
                <body>
                  ${currentContent}
                </body>
              </html>
            `,
          }}
          style={{ flex: 1 }}
        />
        <View
          style={{ flexDirection: "row", padding: 16, backgroundColor: "#111" }}
        >
          <Pressable
            onPress={() => setCurrentChapter((c) => Math.max(0, c - 1))}
            style={{ padding: 8, opacity: currentChapter > 0 ? 1 : 0.5 }}
          >
            <Text style={{ color: "#FFF" }}>Previous</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() =>
              setCurrentChapter((c) => Math.min(chapters.length - 1, c + 1))
            }
            style={{
              padding: 8,
              opacity: currentChapter < chapters.length - 1 ? 1 : 0.5,
            }}
          >
            <Text style={{ color: "#FFF" }}>Next</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}