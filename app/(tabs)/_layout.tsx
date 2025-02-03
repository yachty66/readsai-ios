import { Tabs, router } from "expo-router";
import React, { useEffect } from "react";
import * as DocumentPicker from "expo-document-picker";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BooksService } from "@/services/books";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Initialize books directory when app starts
  useEffect(() => {
    BooksService.init();
  }, []);

  const handleAddPress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/epub+zip"],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        await BooksService.addBook(result.assets[0]);
        // Navigate to home tab and force refresh
        router.push("/(tabs)/");
      }
    } catch (err) {
      console.log("Document picking error:", err);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === "dark" ? "#FFFFFF" : "#000000",
        tabBarInactiveTintColor: colorScheme === "dark" ? "#FFFFFF" : "#000000",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleAddPress();
          },
        }}
        options={{
          title: "Add",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="plus" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
