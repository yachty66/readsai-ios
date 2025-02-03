import { View } from "react-native";
import { Text } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-light-background dark:bg-dark-background">
      <Text className="text-lg text-light-text dark:text-dark-text">
        No books added yet
      </Text>
    </View>
  );
}
