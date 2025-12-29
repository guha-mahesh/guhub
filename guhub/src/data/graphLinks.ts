export interface GraphLink {
  source: string;
  target: string;
  strength?: number;
  description?: string;
}

// Placeholder connections - these create the network structure
export const links: GraphLink[] = [
  // MUSIC INTERNAL CONNECTIONS
  { source: 'm1', target: 'm3', strength: 0.9, description: 'Dream pop lineage' },
  { source: 'm3', target: 'm6', strength: 0.85, description: 'Shoegaze family' },
  { source: 'm6', target: 'm9', strength: 0.8, description: 'Ethereal evolution' },
  { source: 'm1', target: 'm9', strength: 0.75, description: 'Dream pop continuum' },
  { source: 'm2', target: 'm4', strength: 0.7, description: 'Experimental spirits' },
  { source: 'm4', target: 'm7', strength: 0.8, description: 'Art pop innovation' },
  { source: 'm5', target: 'm2', strength: 0.6, description: 'Electronic experimentation' },
  { source: 'm8', target: 'm2', strength: 0.65, description: 'Atmospheric mood' },
  { source: 'm10', target: 'm1', strength: 0.7, description: 'Ethereal landscapes' },

  // PHILOSOPHY INTERNAL CONNECTIONS
  { source: 'p1', target: 'p9', strength: 1.0, description: 'Animal ethics' },
  { source: 'p1', target: 'p5', strength: 0.95, description: 'EA founder' },
  { source: 'p5', target: 'p6', strength: 0.85, description: 'Future focus' },
  { source: 'p2', target: 'p10', strength: 0.8, description: 'Moral reasoning' },
  { source: 'p3', target: 'p1', strength: 0.7, description: 'Ethical theory' },
  { source: 'p8', target: 'p1', strength: 0.9, description: 'Utilitarian ethics' },
  { source: 'p7', target: 'p4', strength: 0.6, description: 'Philosophy of mind' },

  // GEOGRAPHY INTERNAL CONNECTIONS
  { source: 'g1', target: 'g2', strength: 0.95, description: 'Quiz categories' },
  { source: 'g1', target: 'g3', strength: 0.95, description: 'Quiz content' },
  { source: 'g1', target: 'g4', strength: 0.9, description: 'Knowledge testing' },
  { source: 'g2', target: 'g3', strength: 0.85, description: 'National symbols' },
  { source: 'g5', target: 'g8', strength: 0.8, description: 'Visual recognition' },
  { source: 'g6', target: 'g9', strength: 0.9, description: 'Political geography' },
  { source: 'g7', target: 'g2', strength: 0.7, description: 'Exhaustive knowledge' },
  { source: 'g10', target: 'g5', strength: 0.75, description: 'Map making' },

  // ANIMALS INTERNAL CONNECTIONS
  { source: 'a1', target: 'a2', strength: 0.9, description: 'Consciousness research' },
  { source: 'a1', target: 'a3', strength: 0.85, description: 'Cognition studies' },
  { source: 'a1', target: 'a8', strength: 0.75, description: 'Sentience boundaries' },
  { source: 'a4', target: 'a7', strength: 0.95, description: 'Ethical choices' },
  { source: 'a5', target: 'a2', strength: 0.8, description: 'Intelligence research' },
  { source: 'a5', target: 'a3', strength: 0.8, description: 'Cognitive abilities' },
  { source: 'a6', target: 'a1', strength: 0.85, description: 'Welfare concerns' },
  { source: 'a9', target: 'a2', strength: 0.7, description: 'Ocean intelligence' },
  { source: 'a10', target: 'a5', strength: 0.75, description: 'Evolutionary cognition' },

  // CULTURE INTERNAL CONNECTIONS
  { source: 'c1', target: 'c2', strength: 0.95, description: 'Identity formation' },
  { source: 'c2', target: 'c4', strength: 0.9, description: 'Diaspora experience' },
  { source: 'c3', target: 'c1', strength: 0.85, description: 'Language & self' },
  { source: 'c4', target: 'c5', strength: 0.8, description: 'Colonial legacy' },
  { source: 'c5', target: 'c6', strength: 0.9, description: 'Global perspective' },
  { source: 'c7', target: 'c1', strength: 0.85, description: 'Cultural mapping' },
  { source: 'c8', target: 'c1', strength: 0.7, description: 'Narrative identity' },
  { source: 'c9', target: 'c10', strength: 0.75, description: 'Cultural analysis' },

  // CROSS-GALAXY CONNECTIONS
  { source: 'p1', target: 'a4', strength: 0.95, description: 'Ethics to practice' },
  { source: 'p1', target: 'a1', strength: 0.9, description: 'Animal ethics basis' },
  { source: 'p9', target: 'a7', strength: 1.0, description: 'Anti-speciesism' },
  { source: 'c7', target: 'm1', strength: 0.7, description: 'Music in identity' },
  { source: 'c1', target: 'p1', strength: 0.6, description: 'Ethical identity' },
  { source: 'g5', target: 'a10', strength: 0.65, description: 'Biodiversity mapping' },
  { source: 'p5', target: 'a6', strength: 0.8, description: 'EA & animal welfare' },
  { source: 'm4', target: 'c2', strength: 0.6, description: 'Art & identity' },
  { source: 'g9', target: 'c5', strength: 0.75, description: 'Geopolitics & colonialism' },
  { source: 'c3', target: 'c6', strength: 0.85, description: 'Global south voices' },
];
