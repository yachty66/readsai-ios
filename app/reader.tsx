import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { EPUBService } from "@/services/epub";

export default function ReaderScreen() {
  const { path, name } = useLocalSearchParams();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const loadBook = async () => {
      try {
        setIsLoading(true);
        const { chapters } = await EPUBService.extractEPUB(path as string);
        setChapters(chapters);
      } catch (error) {
        console.error("Error loading book:", error);
      } finally {
        setIsLoading(false);
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
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1em auto;
            border-radius: 8px;
          }
          figure {
            margin: 1em 0;
            text-align: center;
          }
          figcaption {
            font-size: 0.9em;
            color: ${isDarkMode ? "#aaa" : "#666"};
            margin-top: 0.5em;
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
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isDarkMode ? "#000000" : "#FFFFFF",
              }}
            >
              <ActivityIndicator
                size="large"
                color={isDarkMode ? "#FFFFFF" : "#000000"}
              />
              <Text
                style={{
                  marginTop: 16,
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                  fontSize: 16,
                }}
              >
                Loading book...
              </Text>
            </View>
          ) : (
            <WebView
              ref={webViewRef}
              source={{ html: htmlContent }}
              style={{ flex: 1 }}
              onLoadProgress={({ nativeEvent }) => {
                if (nativeEvent.progress === 1) {
                  setIsLoading(false);
                }
              }}
            />
          )}
        </View>

        {/* Font size controls */}
        {!isLoading && (
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
              <Text
                style={{ color: isDarkMode ? "#FFF" : "#000", fontSize: 18 }}
              >
                A+
              </Text>
            </Pressable>
            <View style={{ height: 8 }} />
            <Pressable onPress={() => setFontSize((f) => Math.max(12, f - 1))}>
              <Text
                style={{ color: isDarkMode ? "#FFF" : "#000", fontSize: 14 }}
              >
                A-
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}
