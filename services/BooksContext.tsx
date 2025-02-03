import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BooksService } from './books';

type BooksContextType = {
  books: Awaited<ReturnType<typeof BooksService.getBooks>>;
  refreshBooks: () => Promise<void>;
};

const BooksContext = createContext<BooksContextType | null>(null);

export function BooksProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Awaited<ReturnType<typeof BooksService.getBooks>>>([]);

  const refreshBooks = useCallback(async () => {
    const loadedBooks = await BooksService.getBooks();
    console.log('Refreshing books:', loadedBooks);
    setBooks(loadedBooks);
  }, []);

  return (
    <BooksContext.Provider value={{ books, refreshBooks }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BooksContext);
  if (!context) throw new Error('useBooks must be used within a BooksProvider');
  return context;
}