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
    name: 'music of-sorts',
    color: '#ffc0cb',
    description: 'Sonic landscapes and auditory aesthetics'
  },
  philosophy: {
    id: 'philosophy',
    name: 'ethics of-sorts',
    color: '#6b4e71',
    description: 'Ethics, epistemology, and existential questions'
  },
  geography: {
    id: 'geography',
    name: 'geography of-sorts',
    color: '#4a7c59',
    description: 'Spatial knowledge and cartographic obsessions'
  },
  animals: {
    id: 'animals',
    name: 'animals of-sorts',
    color: '#c17c74',
    description: 'Sentience, cognition, and ethical considerations'
  },
  culture: {
    id: 'culture',
    name: 'culture of-sorts',
    color: '#8b6f8f',
    description: 'Identity, heritage, and cultural intersections'
  }
};

export const galaxyArray = Object.values(galaxies);
