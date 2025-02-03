import { View } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabBarBackground() {
  const colorScheme = useColorScheme();

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
      }}
    />
  );
}
