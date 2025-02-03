import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";

const BOOKS_DIRECTORY = `${FileSystem.documentDirectory}books/`;
const BOOKS_INDEX_FILE = `${FileSystem.documentDirectory}books-index.json`;

type Book = {
  id: string;
  name: string;
  path: string;
  addedAt: string;
};

export const BooksService = {
  // Initialize the books directory
  init: async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(BOOKS_DIRECTORY);
      console.log("Books directory info:", dirInfo);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(BOOKS_DIRECTORY, {
          intermediates: true,
        });
        console.log("Created books directory at:", BOOKS_DIRECTORY);

        // Create empty index file
        await FileSystem.writeAsStringAsync(
          BOOKS_INDEX_FILE,
          JSON.stringify([])
        );
        console.log("Created empty index file at:", BOOKS_INDEX_FILE);
      }
    } catch (error) {
      console.error("Error initializing books directory:", error);
    }
  },

  // Add a new book
  addBook: async (pickedFile: DocumentPicker.DocumentResult["assets"][0]) => {
    try {
      const timestamp = Date.now();
      const bookId = `book-${timestamp}`;
      const fileExtension = pickedFile.name.split(".").pop();
      const newPath = `${BOOKS_DIRECTORY}${bookId}.${fileExtension}`;

      console.log("File details:", {
        originalUri: pickedFile.uri,
        name: pickedFile.name,
        size: pickedFile.size,
        newPath,
      });

      // Copy file to permanent storage
      await FileSystem.copyAsync({
        from: pickedFile.uri,
        to: newPath,
      });

      // Verify file was copied
      const newFileInfo = await FileSystem.getInfoAsync(newPath);
      console.log("New file info:", newFileInfo);

      // Create book metadata
      const newBook: Book = {
        id: bookId,
        name: pickedFile.name,
        path: newPath,
        addedAt: new Date().toISOString(),
      };

      await BooksService.addToIndex(newBook);

      // Verify index file after update
      const books = await BooksService.getBooks();
      console.log("Updated books list:", books);

      return newBook;
    } catch (error) {
      console.error("Error adding book:", error);
      throw error;
    }
  },

  // Get all books
  getBooks: async (): Promise<Book[]> => {
    try {
      const indexExists = await FileSystem.getInfoAsync(BOOKS_INDEX_FILE);
      if (!indexExists.exists) {
        return [];
      }

      const content = await FileSystem.readAsStringAsync(BOOKS_INDEX_FILE);
      return JSON.parse(content);
    } catch (error) {
      console.error("Error getting books:", error);
      return [];
    }
  },

  // Private method to manage the index file
  addToIndex: async (newBook: Book) => {
    try {
      const books = await BooksService.getBooks();
      books.unshift(newBook);
      await FileSystem.writeAsStringAsync(
        BOOKS_INDEX_FILE,
        JSON.stringify(books)
      );
    } catch (error) {
      console.error("Error updating index:", error);
      throw error;
    }
  },

  clearAllBooks: async () => {
    try {
      // Delete all files in books directory
      const dirContents = await FileSystem.readDirectoryAsync(BOOKS_DIRECTORY);
      for (const file of dirContents) {
        await FileSystem.deleteAsync(`${BOOKS_DIRECTORY}${file}`);
      }

      // Reset index file to empty array
      await FileSystem.writeAsStringAsync(BOOKS_INDEX_FILE, JSON.stringify([]));

      console.log("Cleared all books");
    } catch (error) {
      console.error("Error clearing books:", error);
    }
  },
};
