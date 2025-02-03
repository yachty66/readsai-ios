import { View } from "react-native";
import { Text } from "react-native";

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            color: "#FFFFFF",
            fontWeight: "500",
          }}
        >
          No books added yet
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Add your first book by tapping the + button
        </Text>
      </View>
    </View>
  );
}
