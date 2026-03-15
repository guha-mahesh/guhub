export interface MusicReview {
  slug: string;
  artist: string;
  album: string;
  year: number;
  rating: number; // out of 10
  genre: string[];
  review: string;
  standouts?: string[];
  coverUrl?: string;
  spotifyUrl?: string;
}

export interface MusicList {
  slug: string;
  title: string;
  description: string;
  items: {
    artist: string;
    title: string;
    note?: string;
    spotifyUrl?: string;
  }[];
}

export const reviews: MusicReview[] = [
  {
    slug: "loveless-mbv",
    artist: "My Bloody Valentine",
    album: "Loveless",
    year: 1991,
    rating: 10,
    genre: ["shoegaze", "noise pop"],
    review: `There's no good way to describe what the guitars on Loveless do. "Glide" is close but too gentle. "Collapse" is closer. Shields spent two years and nearly £250k getting that sound — a tremolo technique that makes chords feel simultaneously wet and abrasive, like something between silk and sandpaper that you can't touch.\n\nOnly Shallow opens and it's immediate. You know within 4 seconds you're somewhere else. The drums feel ported in from a different record, which is exactly the point — the dissociation between rhythm and texture is structural, not accidental.\n\nSometimes and Come in Alone are the melodic peaks. Blown are the quieter reveals. The record rewards full-length listens over track selection because the whole thing is calibrated — it's a total environment, not a playlist.\n\nIf you have never heard this loud, you have not heard it.`,
    standouts: ["Only Shallow", "Loomer", "Sometimes", "Come in Alone", "Sometimes"],
    spotifyUrl: "https://open.spotify.com/album/3USQNpGmHqWZ19y7NhGjAO"
  },
  {
    slug: "heaven-or-las-vegas-cocteau",
    artist: "Cocteau Twins",
    album: "Heaven or Las Vegas",
    year: 1990,
    rating: 9,
    genre: ["dream pop", "ethereal wave"],
    review: `The Cocteau Twins made records that treated vocals as texture rather than communication, and Heaven or Las Vegas is the refinement of that. Fraser's voice is used like a synthesizer — it carries mood rather than meaning. Half the lyrics are phonetic, and somehow that makes the emotional content more direct, not less.\n\nIvorea and Fotzepolitic are the standouts for me but the back half of the record (Frou-Frou Foxes, all of it) holds up through repeated listens. Guthrie's guitar processing hasn't dated at all.\n\nThere's a thing this record does where it sounds like a memory of a place that doesn't exist. That's a specific feeling and I've never heard another record that reliably induces it.`,
    standouts: ["Cherry-Coloured Funk", "Iceblink Luck", "Fotzepolitic", "Frou-Frou Foxes in Midsummer Fires"],
    spotifyUrl: "https://open.spotify.com/album/4bFksBFLJiUaOB7nMBFqhp"
  },
  {
    slug: "exmilitary-death-grips",
    artist: "Death Grips",
    album: "Exmilitary",
    year: 2011,
    rating: 9,
    genre: ["experimental hip-hop", "noise rap", "industrial"],
    review: `Free mixtape, functionally perfect. Exmilitary is what happens when someone samples Charles Manson over noise rock beds and Ride the Lightning over no-budget drum machines and somehow it all coheres into something that feels *inevitable*.\n\nMC Ride raps like he's trying to break out of the audio. The samples are confrontational — not background texture but load-bearing walls. Culture Shock is probably the clearest entry point but Klink is when it gets weird in ways that don't resolve.\n\nThe no-label self-release isn't incidental to the aesthetic. The lo-fi constraint is a feature. Every subsequent Death Grips record sounds more expensive and less interesting, which tells you something.`,
    standouts: ["Guillotine", "Culture Shock", "Takyon (Death Yon)", "Klink"],
    spotifyUrl: "https://open.spotify.com/album/5gVnXp5sn3M3tXerSb4DKDN"
  }
];

export const lists: MusicList[] = [
  {
    slug: "shoegaze-entry-points",
    title: "shoegaze: where to start",
    description: "ordered entry points for the genre, not ranked by quality. the goal is getting from nothing to actually hearing it.",
    items: [
      { artist: "My Bloody Valentine", title: "Sometimes", note: "easiest on-ramp. still perfect." },
      { artist: "Slowdive", title: "Alison", note: "melody-forward, less abrasive than MBV." },
      { artist: "Ride", title: "Vapour Trail", note: "more pop structure than most." },
      { artist: "Lush", title: "De-Luxe", note: "lighter touch, jangly." },
      { artist: "Chapterhouse", title: "Pearl", note: "underrated. gets gnarlier." },
      { artist: "Pale Saints", title: "Sight of You", note: "post-punk bleeding into the genre." },
      { artist: "Ulver", title: "Not Saved", note: "contemporary. way late to the party but legitimately good." },
      { artist: "Parannoul", title: "To See the Next Part of the Dream", note: "korean bedroom shoegaze. lo-fi made essential." }
    ]
  },
  {
    slug: "records-that-rewired-me",
    title: "records that actually changed something",
    description: "not best-of lists. these are specifically the ones where i was different after.",
    items: [
      { artist: "My Bloody Valentine", title: "Loveless", note: "showed me texture as primary instrument." },
      { artist: "Death Grips", title: "Exmilitary", note: "that rap could be noise and vice versa." },
      { artist: "Cocteau Twins", title: "Heaven or Las Vegas", note: "melody without syntax." },
      { artist: "Parannoul", title: "To See the Next Part of the Dream", note: "lo-fi as intentional aesthetic, not limitation." },
      { artist: "The Caretaker", title: "Everywhere at the End of Time", note: "hauntology as medium. not listenable in the normal sense." },
      { artist: "Grouper", title: "Dragging a Dead Deer Up a Hill", note: "negative space as composition." }
    ]
  }
];
