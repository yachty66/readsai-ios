import { View, Text, FlatList, Pressable, Image } from "react-native";
import { useEffect } from "react";
import { BooksService } from "@/services/books";
import { useBooks } from "@/services/BooksContext";
import { router } from "expo-router";

export default function HomeScreen() {
  const { books, refreshBooks } = useBooks();

  useEffect(() => {
    refreshBooks();
  }, []);

  const handleDelete = async (bookId: string) => {
    await BooksService.deleteBook(bookId);
    refreshBooks();
  };

  const handleBookPress = (book: Book) => {
    router.push({
      pathname: "/reader",
      params: {
        path: book.path,
        name: book.name,
      },
    });
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
      <FlatList
        style={{ padding: 16, paddingTop: 60 }}
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleBookPress(item)}
            style={({ pressed }) => ({
              padding: 16,
              backgroundColor: pressed ? "#222222" : "#111111",
              marginBottom: 8,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            })}
          >
            {item.coverImage ? (
              <Image
                source={{ uri: item.coverImage }}
                style={{
                  width: 60,
                  height: 90,
                  borderRadius: 4,
                  backgroundColor: "#333",
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: 60,
                  height: 90,
                  borderRadius: 4,
                  backgroundColor: "#333",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666" }}>📚</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 16, marginBottom: 4 }}>
                {item.title || item.name}
              </Text>
              <Text style={{ color: "#666666", fontSize: 12 }}>
                Added: {new Date(item.addedAt).toLocaleDateString()}
              </Text>
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
              style={({ pressed }) => ({
                padding: 12,
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <Text style={{ fontSize: 18 }}>🗑️</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}
