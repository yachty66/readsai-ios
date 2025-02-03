import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { EPUBService } from "@/services/epub";

export default function ReaderScreen() {
  const { path, name } = useLocalSearchParams();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const loadBook = async () => {
      try {
        setIsLoading(true);
        const { chapters, coverImage, title } = await EPUBService.extractEPUB(
          path as string
        );
        setChapters(chapters);
        setCoverImage(coverImage);
        setBookTitle(title);
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
            color: #fff;
            background: #000;
          }
          * {
            text-align: left !important;
          }
          .cover {
            max-width: 70%;
            margin: 2em auto;
            display: block;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .book-title {
            font-size: 1.5em;
            font-weight: bold;
            margin: 1em 0 2em;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1em 0;
            border-radius: 8px;
          }
          p, div, span, h1, h2, h3, h4, h5, h6 {
            text-align: left !important;
          }
        </style>
      </head>
      <body>
        ${
          coverImage
            ? `<img src="${coverImage}" class="cover" alt="Book cover">`
            : ""
        }
        <h1 class="book-title">${bookTitle || name}</h1>
        ${fullContent}
      </body>
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
