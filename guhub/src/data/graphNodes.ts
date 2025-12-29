import type { GalaxyType } from './galaxyData';

export interface GraphNode {
  id: string;
  name: string;
  galaxy: GalaxyType;
  x?: number;
  y?: number;
  z?: number;
  description?: string;
}

// Placeholder nodes - replace with actual interests later
export const nodes: GraphNode[] = [
  // MUSIC GALAXY
  { id: 'm1', name: 'Cocteau Twins', galaxy: 'music', description: 'Dream pop pioneers' },
  { id: 'm2', name: 'Radiohead', galaxy: 'music', description: 'Experimental rock' },
  { id: 'm3', name: 'My Bloody Valentine', galaxy: 'music', description: 'Shoegaze legends' },
  { id: 'm4', name: 'Björk', galaxy: 'music', description: 'Avant-garde pop' },
  { id: 'm5', name: 'Aphex Twin', galaxy: 'music', description: 'Electronic experimentation' },
  { id: 'm6', name: 'Slowdive', galaxy: 'music', description: 'Ethereal soundscapes' },
  { id: 'm7', name: 'FKA twigs', galaxy: 'music', description: 'Art pop innovation' },
  { id: 'm8', name: 'Portishead', galaxy: 'music', description: 'Trip hop atmosphere' },
  { id: 'm9', name: 'Beach House', galaxy: 'music', description: 'Modern dream pop' },
  { id: 'm10', name: 'Sigur Rós', galaxy: 'music', description: 'Post-rock ambience' },

  // PHILOSOPHY GALAXY
  { id: 'p1', name: 'Peter Singer', galaxy: 'philosophy', description: 'Effective altruism' },
  { id: 'p2', name: 'Derek Parfit', galaxy: 'philosophy', description: 'Personal identity' },
  { id: 'p3', name: 'Martha Nussbaum', galaxy: 'philosophy', description: 'Capabilities approach' },
  { id: 'p4', name: 'Thomas Nagel', galaxy: 'philosophy', description: 'Consciousness & ethics' },
  { id: 'p5', name: 'Effective Altruism', galaxy: 'philosophy', description: 'Evidence-based giving' },
  { id: 'p6', name: 'Longtermism', galaxy: 'philosophy', description: 'Future generations' },
  { id: 'p7', name: 'Stoicism', galaxy: 'philosophy', description: 'Ancient wisdom' },
  { id: 'p8', name: 'Utilitarianism', galaxy: 'philosophy', description: 'Greatest good' },
  { id: 'p9', name: 'Animal Liberation', galaxy: 'philosophy', description: 'Non-human rights' },
  { id: 'p10', name: 'Moral Uncertainty', galaxy: 'philosophy', description: 'Ethical humility' },

  // GEOGRAPHY GALAXY
  { id: 'g1', name: 'JetPunk', galaxy: 'geography', description: 'Quiz obsession' },
  { id: 'g2', name: 'Capital Cities', galaxy: 'geography', description: 'All 196 memorized' },
  { id: 'g3', name: 'World Flags', galaxy: 'geography', description: 'Vexillology' },
  { id: 'g4', name: 'Currency Knowledge', galaxy: 'geography', description: 'Global finance' },
  { id: 'g5', name: 'Satellite Imagery', galaxy: 'geography', description: 'Space perspective' },
  { id: 'g6', name: 'Border Studies', galaxy: 'geography', description: 'Political geography' },
  { id: 'g7', name: 'Microstates', galaxy: 'geography', description: 'Tiny nations' },
  { id: 'g8', name: 'Country Shapes', galaxy: 'geography', description: 'Visual memory' },
  { id: 'g9', name: 'Geopolitics', galaxy: 'geography', description: 'Global dynamics' },
  { id: 'g10', name: 'Cartography', galaxy: 'geography', description: 'Map projections' },

  // ANIMALS GALAXY
  { id: 'a1', name: 'Sentience Research', galaxy: 'animals', description: 'Consciousness studies' },
  { id: 'a2', name: 'Cephalopod Intelligence', galaxy: 'animals', description: 'Octopus minds' },
  { id: 'a3', name: 'Corvid Cognition', galaxy: 'animals', description: 'Clever birds' },
  { id: 'a4', name: 'Vegetarianism', galaxy: 'animals', description: 'Ethical eating' },
  { id: 'a5', name: 'Animal Cognition', galaxy: 'animals', description: 'Non-human minds' },
  { id: 'a6', name: 'Welfare Biology', galaxy: 'animals', description: 'Wild suffering' },
  { id: 'a7', name: 'Speciesism', galaxy: 'animals', description: 'Moral boundaries' },
  { id: 'a8', name: 'Insect Sentience', galaxy: 'animals', description: 'Tiny experiences' },
  { id: 'a9', name: 'Marine Life', galaxy: 'animals', description: 'Ocean consciousness' },
  { id: 'a10', name: 'Evolution', galaxy: 'animals', description: 'Adaptive minds' },

  // CULTURE GALAXY
  { id: 'c1', name: 'Identity Exploration', galaxy: 'culture', description: 'Self-discovery' },
  { id: 'c2', name: 'Cultural Hybridity', galaxy: 'culture', description: 'Mixed heritage' },
  { id: 'c3', name: 'Language & Power', galaxy: 'culture', description: 'Linguistic identity' },
  { id: 'c4', name: 'Diaspora Studies', galaxy: 'culture', description: 'Displaced communities' },
  { id: 'c5', name: 'Postcolonialism', galaxy: 'culture', description: 'Legacy analysis' },
  { id: 'c6', name: 'Global South', galaxy: 'culture', description: 'Perspectives' },
  { id: 'c7', name: 'Arbor', galaxy: 'culture', description: 'Cultural mapping project' },
  { id: 'c8', name: 'Literature', galaxy: 'culture', description: 'Narrative identity' },
  { id: 'c9', name: 'Film & Media', galaxy: 'culture', description: 'Visual culture' },
  { id: 'c10', name: 'Social Theory', galaxy: 'culture', description: 'Power structures' },
];
