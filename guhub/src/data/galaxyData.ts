export type GalaxyType = 'music' | 'philosophy' | 'geography' | 'animals' | 'culture';

export interface Galaxy {
  id: GalaxyType;
  name: string;
  color: string;
  description: string;
}

export const galaxies: Record<GalaxyType, Galaxy> = {
  music: {
    id: 'music',
    name: 'Music',
    color: '#ffc0cb', // pink
    description: 'Sonic landscapes and auditory aesthetics'
  },
  philosophy: {
    id: 'philosophy',
    name: 'Philosophy',
    color: '#6b4e71', // blackberry purple
    description: 'Ethics, epistemology, and existential questions'
  },
  geography: {
    id: 'geography',
    name: 'Geography',
    color: '#4a7c59', // forest green
    description: 'Spatial knowledge and cartographic obsessions'
  },
  animals: {
    id: 'animals',
    name: 'Animals',
    color: '#c17c74', // dusty rose/coral
    description: 'Sentience, cognition, and ethical considerations'
  },
  culture: {
    id: 'culture',
    name: 'Culture',
    color: '#8b6f8f', // muted lavender
    description: 'Identity, heritage, and cultural intersections'
  }
};

export const galaxyArray = Object.values(galaxies);
