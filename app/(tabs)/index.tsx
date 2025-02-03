import { View, Text, FlatList, Pressable } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { BooksService } from "@/services/books";

export default function HomeScreen() {
  const [books, setBooks] = useState<
    Awaited<ReturnType<typeof BooksService.getBooks>>
  >([]);

  const loadBooks = useCallback(async () => {
    const loadedBooks = await BooksService.getBooks();
    console.log("Loaded books:", loadedBooks);
    setBooks(loadedBooks);
  }, []);

  // Refresh books list whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  const handleClear = async () => {
    await BooksService.clearAllBooks();
    loadBooks();
  };

  if (books.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 24, color: "#FFFFFF", fontWeight: "500" }}>
            No books added yet
          </Text>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
            Add your first book by tapping the + button
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Pressable
          onPress={handleClear}
          style={{
            padding: 16,
            backgroundColor: "#FF3B30",
            borderRadius: 8,
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "500", fontSize: 16 }}>
            Clear All Books
          </Text>
        </Pressable>
      </View>

      <FlatList
        style={{ paddingHorizontal: 16 }}
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 16,
              backgroundColor: "#111111",
              marginBottom: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 16 }}>{item.name}</Text>
            <Text style={{ color: "#666666", fontSize: 12 }}>
              Added: {new Date(item.addedAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
