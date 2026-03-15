export interface Book {
  title: string;
  author: string;
  startDate?: string;
  finishDate?: string;
  status: 'reading' | 'finished' | 'want';
  rating?: number; // 1-5
  note?: string;
  coverUrl?: string;
  genre?: string[];
}

export const books: Book[] = [
  {
    title: "Gödel, Escher, Bach",
    author: "Douglas Hofstadter",
    status: "reading",
    startDate: "2026-01",
    note: "The recursive transition networks chapter. RTNs as a lens on syntax was what got me — the idea that a grammar rule and a program loop are the same thing wearing different clothes.",
    genre: ["philosophy", "math", "cs"]
  },
  {
    title: "The World as Will and Representation",
    author: "Arthur Schopenhauer",
    status: "finished",
    finishDate: "2025-11",
    rating: 5,
    note: "The will-as-substrate argument hit different than I expected. Not a pessimist read — more like a reclassification of what matters.",
    genre: ["philosophy"]
  },
  {
    title: "The Precipice",
    author: "Toby Ord",
    status: "finished",
    finishDate: "2025-09",
    rating: 4,
    note: "Makes the x-risk framing concrete in a way that's hard to dismiss. The existential risk table alone is worth it.",
    genre: ["philosophy", "ea", "sci"]
  },
  {
    title: "Blood Meridian",
    author: "Cormac McCarthy",
    status: "want",
    genre: ["fiction"]
  }
];
