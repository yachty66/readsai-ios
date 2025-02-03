import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { WebView } from "react-native-webview";
import { EPUBService } from "@/services/epub";

export default function ReaderScreen() {
  const { path, name } = useLocalSearchParams();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const webViewRef = useRef<WebView>(null);

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

  // Combine all chapters into one continuous content
  const fullContent = chapters
    .map((ch) => ch.content)
    .join(
      '<hr style="border: none; border-top: 1px solid #666; margin: 2em 0;">'
    );

  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          body {
            padding: 20px;
            font-family: system-ui;
            line-height: 1.6;
            font-size: ${fontSize}px;
            color: ${isDarkMode ? "#fff" : "#333"};
            background: ${isDarkMode ? "#000" : "#fff"};
            text-align: left;
            max-width: 800px;
            margin: 0 auto;
          }
          p, h1, h2, h3, h4, h5, h6 {
            text-align: left;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1em 0;
          }
        </style>
      </head>
      <body>${fullContent}</body>
    </html>
  `;

  return (
    <>
      <Stack.Screen
        options={{
          title: name as string,
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#FFFFFF",
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Pressable onPress={() => setIsDarkMode(!isDarkMode)}>
                <Text style={{ color: "#FFF" }}>
                  {isDarkMode ? "☀️" : "🌙"}
                </Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <View
        style={{ flex: 1, backgroundColor: isDarkMode ? "#000000" : "#FFFFFF" }}
      >
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={{ flex: 1 }}
          onScroll={(event) => {
            // Handle scroll events if needed
            const { contentOffset, contentSize, layoutMeasurement } =
              event.nativeEvent;
            // You can calculate reading progress here
          }}
        />

        {/* Font size controls */}
        <View
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            backgroundColor: isDarkMode ? "#111" : "#eee",
            borderRadius: 8,
            padding: 8,
          }}
        >
          <Pressable onPress={() => setFontSize((f) => f + 1)}>
            <Text style={{ color: isDarkMode ? "#FFF" : "#000", fontSize: 18 }}>
              A+
            </Text>
          </Pressable>
          <View style={{ height: 8 }} />
          <Pressable onPress={() => setFontSize((f) => Math.max(12, f - 1))}>
            <Text style={{ color: isDarkMode ? "#FFF" : "#000", fontSize: 14 }}>
              A-
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
