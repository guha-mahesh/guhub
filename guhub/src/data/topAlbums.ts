// ──────────────────────────────────────────────────────────────────────
// Album lists rendered by /music/:id (TopTracks). Each list has its own
// header copy + ranked album entries + optional rank-1 "joke reveal"
// (used by music/1 for the Carti gag). To add a new list, add another
// key here and pin it in BlogPage.tsx + MusicLanding.tsx.
// ──────────────────────────────────────────────────────────────────────

export interface AlbumEntry {
  rank: number;
  title: string;
  artist: string;
  /** Release year (or composition year for classical works). */
  year?: number;
  review: string;
  /** Full Spotify embed URL (https://open.spotify.com/embed/...). Empty
   *  string is allowed for stubs — the favTrack section just won't render. */
  spotifyEmbed: string;
}

export interface RankOneJoke {
  fake: {
    title: string;
    artist: string;
    year?: number;
    spotifyEmbed: string;
  };
  real: AlbumEntry; // rank field ignored, always rendered as #01
}

export interface AlbumListConfig {
  id: string;
  label: string;        // "[2025 in review]" etc — top header tag
  title: string;        // "TOP ALBUMS" etc
  subtitle: string;
  /** Top of the page back-link label (defaults to "back to music"). */
  backLabel?: string;
  /** Optional rank-1 joke reveal. If absent, rank 1 is treated as a
   *  normal entry (just included as rank: 1 in `albums`). */
  rankOne?: RankOneJoke;
  /** All ranked albums for this list. If `rankOne` is set, rank 1 is
   *  rendered from `rankOne.real`; albums in `albums` with rank > 1
   *  are rendered in descending order above it. */
  albums: AlbumEntry[];
}

// ── /music/1 — Top Albums 2025 ────────────────────────────────
const top2025: AlbumListConfig = {
  id: '1',
  label: '[2025 in review]',
  title: 'TOP ALBUMS',
  subtitle: 'ranked by objectivity and every opinion of mine is musical dogma',
  rankOne: {
    fake: {
      title: 'MUSIC',
      artist: 'Playboi Carti',
      year: 2025,
      spotifyEmbed: 'https://open.spotify.com/embed/album/0fSfkmx0tdPqFYkJuNX74a?utm_source=generator',
    },
    real: {
      rank: 1,
      title: 'Seeking Darkness',
      artist: 'Huremic',
      year: 2025,
      review:
        "This album wasn't even out on Spotify till like October. Huremic is parannoul's side project and it's lowk already in my t15 albums. Ts is soooo good bro part 1 & 2 are great but 3 Is the best noise rock which melds into some bells & nice guitar shit holy ppeeeeeak this album is one of my favs ever thank u Parannoul",
      spotifyEmbed: 'https://open.spotify.com/embed/track/6w0Sd0PN2MoweS770BzgkM?utm_source=generator',
    },
  },
  albums: [
    {
      rank: 10,
      title: 'Luminiscent Creatures',
      artist: 'Ichiko Aoba',
      year: 2025,
      review: "This was perhaps the first new album I listened to this year. I'm not hugely into Japanese music, so this was a great change of pace. Overall, I thought it did the slow relaxed occasionally intense vibes really well! IMO not much to say other than that, but I liked it a lot!",
      spotifyEmbed: 'https://open.spotify.com/embed/track/4CkOPXeYKLjeofRoDLIrPF?utm_source=generator',
    },
    {
      rank: 9,
      title: 'Getting Killed',
      artist: 'Geese',
      year: 2025,
      review: "I feel there's always a competition between pretentious people trying to remake older music and pretentious people making overproduced 21st century glitch-slop. I'm usually a huge proponent of the latter (for example, I despised Geordie Greep while glazing Imaginal Disk). Though I have glitch-slop above this album later on in this list, Geese did a great job with this album that I was so reluctant to like. Everyone IK was going crazy about this, so I went in with a closed mind and still liked it quite a bit which is a testament to its quality.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/1g9GiiPPaL7KcDHlDzu7lT?utm_source=generator',
    },
    {
      rank: 8,
      title: 'Apiary',
      artist: 'Gingerbee',
      year: 2025,
      review: "Some sort of midwest emo mixed with samba and screamo. I really like the way they combine screaming with 8-bit and jazz. Only criticism is how boring some of the songs get and that it's also relatively short. Still great!",
      spotifyEmbed: 'https://open.spotify.com/embed/track/5JaWbRRqylF6OeBHlLymla?utm_source=generator',
    },
    {
      rank: 7,
      title: 'Ghostholding',
      artist: 'Venturing',
      year: 2025,
      review: "Didn't think I'd have the same artist on here twice (spoiler alert). This is Jane remover's other project which i was extremely fond of. I didn't realize how much I liked her voice when it's not being distorted like crazy. Though this album has nothing novel about it, I overall think this is one of my favorite minimalist albums to date as I'm usually such a huge fan of overproduction.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/4NGKKYlXp4jRVJrV3gdOma?utm_source=generator',
    },
    {
      rank: 6,
      title: 'K1',
      artist: 'Kmoe',
      year: 2025,
      review: "Another spoiler- the next 3 artists are extremely similar, but I guess that's just where my taste is this year. KMOE is a relatively new artist & I love his whiny ass voice. Idk overall the pros and distortion in general is awesome though not super original. He sounds great!",
      spotifyEmbed: 'https://open.spotify.com/embed/track/6joVOYeKHWl5g744BuB3dg?utm_source=generator',
    },
    {
      rank: 5,
      title: 'Revengeseekerz',
      artist: 'Jane remover',
      year: 2025,
      review: "I was CONFIDENT this would be my AOTY when i was listening to it when it came out. It's genuinely insane how good this album is & it's prolly her best. JRJRJR is lowkey one of the best rage songs ever made icel.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/2AjTT2CBthpsIQtyxzhSr4?utm_source=generator',
    },
    {
      rank: 4,
      title: 'Vanisher, horizon scraper',
      artist: 'Quadeca',
      year: 2025,
      review: "Lowkey feel gross liking ts cus Quadeca is goated but popular amongst smellier folks. I was so ready to dislike this album when it came out but MAN Quadeca is on a crazy run. Scrapyard was good but this album is insane. Good for him.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/7tJ8jCSe5XPIkRluGfZTu3?utm_source=generator',
    },
    {
      rank: 3,
      title: 'I love my computer',
      artist: 'ninajirachi',
      year: 2025,
      review: "Hooooooooly peak this album is so so good thank u for the put on William 1!1! This album is sosososososos good and some of the best prod I've seen in a while. Nina is locked tf in and I genuinely think she has the potential to make a crazy t10 album in the future. All of this is coming from someone who also didn't even listen to the album more than maybe 3x lmao",
      spotifyEmbed: 'https://open.spotify.com/embed/track/5ZbztTcvj6QWWbeYsL4GTa?utm_source=generator',
    },
    {
      rank: 2,
      title: 'Cowards',
      artist: 'Squid',
      year: 2025,
      review: "This album is lowk the only one here that isn't rated crazily on RYM & i'm not too sure why. I found this album from an instagram reel unrelated to music (it was just using a song from the album in the background) and checked it out. What you need to take away from this ranking is Squid > Geese > Swans. I love the lead singers voice soooo much and overall it's just such an interesting sound & concept.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/6JrtUQ97SQqVoMW5bWFd7I?utm_source=generator',
    },
  ],
};

// ── /music/2 — Top 25 (All Time) ─────────────────────────────
const top25: AlbumListConfig = {
  id: '2',
  label: '[all time]',
  title: 'TOP 25 ALBUMS',
  subtitle: 'the ones I keep coming back to',
  albums: [
    {
      rank: 1,
      artist: 'Cocteau Twins',
      title: 'Heaven or Las Vegas',
      year: 1990,
      review:
        "Aaaaaand yeah Elizabeth Fraser & Robin Guthrie win this list. If you were to compile every positive comment in this entire page and attribute it to this album, it would begin to explain my love for it. Then if you attributed every positive comment that you could imagine, it would start getting closer. I don't know what they put in this album nor any of their other albums, but it is pristine. It has very little area for improvement if any at all. There's not a whole lot I can say that isn't just empty praise from a pretentious character but it is absolutely ABSURD how they sound on this album and every melody they cultivate.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/0Coai3QxvjCXWMhVN1hpgE?utm_source=generator',
    },
    {
      rank: 2,
      artist: 'Magdalena Bay',
      title: 'Imaginal Disk',
      year: 2024,
      review:
        "Ooooookaaaay yea these next two albums would come as little to no surprise to anyone who knows me and might as well be interchangeable. These albums are as synonymous to me as anything material could be. Conceptually, this album is a ten, musically this album is a 10, production-wise this album is unmatched, variety-wise this album is a 10, consistency this album is a 10, on every possible metric you can pull out: this album is a 10. I was so incredibly obnoxious about this album for close to 2 years, and now I am silently obnoxious abt it. I've seen them live twice and I think my wallet will cave if they announce a concert near me again. Also Matt went to northeastern aha",
      spotifyEmbed: 'https://open.spotify.com/embed/track/24UCrwqWBR3bw3EIgjzXTt?utm_source=generator',
    },
    {
      rank: 3,
      artist: 'Animal Collective',
      title: 'Merriweather Post Pavilion',
      year: 2009,
      review:
        "Yea this is just the best psychedelia album by a couple magnitudes. This album is beyond incredible and to some extent perfect. Every single song is practically equal in quality. It's perfectly consistent throughout the entire album almost to a creepy extent & it always feels euphoric to listen through. Also the album cover is sick.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/6dRAwuJNZ79vGXvcYuPaM8?utm_source=generator',
    },
    {
      rank: 4,
      artist: 'The 1975',
      title: 'i like it when you sleep, for you are so beautiful yet so unaware of it',
      year: 2016,
      review:
        "I guess it was inevitable that a 1975 album is on here. I think it's safe to say this is my favorite band which feels funny because they didn't make my favorite song nor my favorite album. Even still, the 1975 has been a staple in my life for many years. I honestly don't think any of their albums are THAT different in quality from all the others. They just each capture a different kind of sound that the band is capable of, and out of those sounds, I suppose this album captures them the most consistently.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/035QPHPAcqApSGMMcogT45?utm_source=generator',
    },
    {
      rank: 5,
      artist: 'Sigur Rós',
      title: 'Ágætis byrjun',
      year: 1999,
      review:
        "Wow that was like 3 shoe gaze bands in a row. It's okay we return to Icelandic post rock. Jónsi is so awesome. It was so weird figuring out that the HTTYD end credit songs that I like so much were actually sung by the same guy as the guy who sings in Ágætis byrjun. The concept driving this album definitely shows in the instrumentation and sparse songs. I love a song that climaxes like crazy and there's more than a couple on this album. Flugufrelsarinn is particularly great. I find this album particularly awesome on flights as it's great as a way to fall asleep.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/2f4zQEtyo2gja8Kok7sNEc?utm_source=generator',
    },
    {
      rank: 6,
      artist: 'Parannoul',
      title: 'To See the Next Part of the Dream',
      year: 2021,
      review:
        "As you might remember from my review of the Huremic album, I mentioned aliases. That's because Parannoul and Huremic are the same person and therefore are represented twice in my list but I digress. Parannoul, like candy claws, has his own shoe gaze sound within shoe gaze. I can tell a parannoul song from a mile away due to the way he mixes the drums. It's a huge tell but also so satisfying to hear. Also this is absolutely my favorite album cover of all time. Incredibly satisfying and I'd love to have this on vinyl at some point.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/46H9VQlQW2Aqf4zVY60cYR?utm_source=generator',
    },
    {
      rank: 7,
      artist: 'my bloody valentine',
      title: 'Loveless',
      year: 1991,
      review:
        "This album is no longer available on Spotify which was a huge punch to the face since it's kind of just *the* shoegaze album. Whether this is the objective best shoegaze album of all time is of course up for debate, but it's difficult for anyone to argue that any album had more impact on defining the genre as this one. Not slowdive, not HANL, not even cocteau twins.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/1kAQmY7yNW6LFdDftDbe1X?utm_source=generator',
    },
    {
      rank: 8,
      artist: 'Candy Claws',
      title: 'Ceres and Calypso in the Deep Time',
      year: 2013,
      review:
        "what a CONCEPT: 'a time-traveling young woman (Calypso) and her companion, magical, seal-like beast made of bones and snow (Ceres), as they explore the Earth during the prehistoric Mesozoic Era'. This album is so full of these truly crazy shoegaze elements that you never hear in shoegaze. Also Ceres and Calypso are just really fun names haha.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/42UEtDZUSpcCOWtmdBPccJ?utm_source=generator',
    },
    {
      rank: 9,
      artist: 'The Marías',
      title: 'CINEMA',
      year: 2021,
      review:
        "I usually don't love the notion of being like 'I was there before they got popular' but it really stings to see how expensive the Marias tickets are now loll. This album used to be my favorite at one point and i still love it. There's an incredibly strong opening half finishing with this insane song.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/0ZpgDIYEJ7H2g8zkIEDQJz?utm_source=generator',
    },
    {
      rank: 10,
      artist: 'The Radio Dept.',
      title: 'Pet Grief',
      year: 2006,
      review:
        "The Radio Dept does this specific sound associated with so many people (Slowdive, Sufjan Stevens, Airiel) the best. The 3 artists I listed there are pretty different from one another but I think you'll find the similarities between them and TRD to be quite evident. This album also just has like insane song after insane song I honestly don't have that much more to say about it. It's genuinely just crazy lol. Also it's a lot older than you'd expect from listening to them.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/3Qty8a5A5Q4rBofUmYgOt8?utm_source=generator',
    },
    {
      rank: 11,
      artist: 'Japanese Breakfast',
      title: 'Jubilee',
      year: 2021,
      review:
        "I remember only hearing about japanese breakfast because I would mention The Japanese House at some point. This album is just so packed with catchy song after catchy song. The song below 'Posing For Cars' is probably in my top 5 of all time & I'd definitely check out the latter half since the first half is relatively boring. ig like 2:40 onward, really does this album and song justice. Top 3 closer of all time",
      spotifyEmbed: 'https://open.spotify.com/embed/track/525BSr4N8jG8MpWbFTd6A9?utm_source=generator',
    },
    {
      rank: 12,
      artist: 'Ethel Cain',
      title: "Preacher's Daughter",
      year: 2022,
      review:
        "concept albums get lost on me, but I used to be super into the plot of this one given how it's a little bit of a cult classic (though it's pretty mainstream now lol). Lots of insane highs in this album. I think at least 75% of the songs in this album, at one point, have been both my favorite song on the album and my top listened song of a month. Just really strong hits all around. I really liked her EPs before this album too but Idk the drone stuff she makes nowadays just isn't for me.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/5l79pLYX6NwTa6FiT8Eoyo?utm_source=generator',
    },
    {
      rank: 13,
      artist: 'Lana Del Rey',
      title: 'NFR',
      year: 2019,
      review: '',
      spotifyEmbed: 'https://open.spotify.com/embed/track/4qUtC2BwFC154Ha8YQRrkk?utm_source=generator',
    },
    {
      rank: 14,
      artist: 'Death Grips',
      title: 'The Money Store',
      year: 2012,
      review:
        "Man i really didn't want to like this album. something about death grips fans really pushed me away, but it's undeniable that this is one of the best albums of all time. MC Ride is just crazy as is Zach Hill. There's this quality that both Cocteau Twins and Death Grips share where you can hear a melody in its pure sense without any super specific instrumentation and still somewhat derive that it's one of these two.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/5PXyH5bb5fbVfO8LjByhBb?utm_source=generator',
    },
    {
      rank: 15,
      artist: '王菲',
      title: 'Fuzao',
      year: 1996,
      review:
        "Faye Wong's voice and stylings are sooo reminiscent of Elizabeth Fraser; however, they were both popular at similar times so I think it genuinely is just some form of convergent evolution in sound given that they both have such unique stylings and voices that managed to sound similar to one another, even across a language barrier (I guess if you could even consider what Liz says as 'language' lol). This album is so fun I love every little styling and sound and weird tonality Faye does. incredible but honestly my fav song (the one below) doesn't actually sound too much like Liz, but you hear it a lot in other albums.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/4lzrWjF6IgJr659sQteyyM?utm_source=generator',
    },
    {
      rank: 16,
      artist: 'Lift to Experience',
      title: 'The Texas-Jerusalem Crossroads',
      year: 2001,
      review:
        "This album is so immensely bizarre. A concept album written by a band from Denton, Tx about if the second coming of Jesus happened in Texas. I believe Josh T. Pearson (lead singer) said in an interview he was really going insane with his faith while writing this album and it genuinely does feel that way with regard to how much of a mix between being in this weird Post Rock band and being a man of immense faith. The album cover is atrocious in a way that makes the songs that follow insanely contrasting. I'd fast forward the song below to 4:25 if you want a representative snippet.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/3dE1PagNQuFXL2zHBzcQqv?utm_source=generator',
    },
    {
      rank: 17,
      artist: 'Huremic',
      title: 'Seeking Darkness',
      year: 2025,
      review:
        "Another 2025 album, my favorite actually. I always feel so pretentious when I show people this album because it genuinely sounds like I like it just to like it and be contrarian. I try to keep a 1 album per artist rule on my lists; that said, I tend to make exceptions when the artist creates multiple different aliases since it's at least different in Spotify's eyes ig lol. This album is an experience to listen to. I remember trying to beat The Darker Side on Mario Odyssey when I first listened to this album and it was great. Idk I just really like texture and this album has an element to it that makes you feel like you're in some sort of tropical rainforest at nighttime.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/6w0Sd0PN2MoweS770BzgkM?utm_source=generator',
    },
    {
      rank: 18,
      artist: 'Earl Sweatshirt',
      title: 'Some Rap Songs',
      year: 2018,
      review:
        "Speaking of short albums from #25, this album is even more potent. So many songs that are under 3 minutes, but this album is just insane. I remember walking between from my class back to my apartment & by the time I got back, the album was already mostly done. JPEGMafia is genuinely trash and Earl is kinda just better than him in every plane.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/4HJ4L8hpX9YjTwipKTYwaW?utm_source=generator',
    },
    {
      rank: 19,
      artist: 'Steely Dan',
      title: 'Aja',
      year: 1977,
      review:
        "Definitely a huge outlier on this list in general. Yacht rock as a concept pissed me off in highschool for no apparent reason, but this entire album is just so pristine. Every instrument sounds perfect and there's so much going on. Particularly in 'I got the news' is the instrumentation so fun.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/2i7C9LQOm08rwJYDsyhsuT?utm_source=generator',
    },
    {
      rank: 20,
      artist: "Carissa's Wierd",
      title: 'Songs About Leaving',
      year: 2002,
      review:
        "That duster album is so mid i dont get why people like it so much. Slowcore is a genre I really just don't meld with so that makes the fact that this album is on this list all the more impressive. I always love when there are soft male and female vocals simultaneously in certain contexts. It always has this specific sound to it that i enjoy idk. This entire album is really good def recommend.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/3FmLbfanuf7XgtBypPWWcS?utm_source=generator',
    },
    {
      rank: 21,
      artist: 'The Japanese House',
      title: 'In the End It Always Does',
      year: 2023,
      review:
        "My first concert was actually a Japanese House Opener. I went just to see Amber and left after she opened. This album is so awesome, I have it signed on vinyl, I constantly go back to it. The only reason it isn't higher is because I've sort of moved away from this kind of music. The 1975 being a top 3 band for me, Amber tends to have a similar yet distinct sound to them that I love going to. I feel like there was a clear flow from Kate Bush -> Imogen Heap -> Caroline Polachek -> The Japanese House though I suppose people would argue there was a different successor to Caroline Polachek but I digress.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/1HfsmNlg8xxhOr9N2i4Q0n?utm_source=generator',
    },
    {
      rank: 22,
      artist: 'Machine Girl',
      title: 'WLFGRL',
      year: 2014,
      review:
        "I like this album a lot. It's sort of in the same larger sphere of music that I listen to but in its own little corner of which I haven't explored too much in. That said, I still really like it and particularly love the album art!",
      spotifyEmbed: 'https://open.spotify.com/embed/track/4WyZjSNcHtSOMHffFPh3Ws?utm_source=generator',
    },
    {
      rank: 23,
      artist: 'Percy Grainger',
      title: 'Lincolnshire Posy',
      year: 1937,
      review:
        "I guess i use the word album loosely so I suppose Symphony would be the more fitting term. Lincolnshire Posy was a piece I actually got to play in highschool and I was pretty surprised to learn that Grainger actually liked the saxophone as opposed to most classical composers which led to a more enjoyable experience playing it. I adore this symphony and all 6 movements. If I were to rank the movements themselves, I guess my order would be IV, III, I, II, VI, and V.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/69aKH3pr9ovKI1Xs0sJCwU?utm_source=generator',
    },
    {
      rank: 24,
      artist: 'Squid',
      title: 'Cowards',
      year: 2025,
      review:
        "Another album from 2025, idk i guess i just really liked the year! This album is a lot like another album from 2022 that I REALLY don't like called Ants from Up There by Black Country, New Road. That album is considered sacred amongst folks even more pretentious than myself. Yet, I find it boring and much prefer this Squid album! Oddly enough my favorite song off this album is called Building 650. I later found out a few months after finishing this album that I would be working at 650 California St which was a pleasant coincidence.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/6JrtUQ97SQqVoMW5bWFd7I?utm_source=generator',
    },
    {
      rank: 25,
      artist: 'yeule',
      title: 'evangelic girl is a gun',
      year: 2025,
      review:
        "I think you'll find (throughout this list) my taste to be extremely new-gen. I tend to favor albums released recently just due to my love for overproduced glitchpop or similar. Evangelic Girl is a Gun is an overall amazing album. I normally like longer albums but a pretty simple album with potent songs is always a pleasure. It's a nice thing to just be able to play an album and not have to feel like you're committing to an hour long thing. There's so much variety within such a specific space being done and Yeule's vocals are as always incredible.",
      spotifyEmbed: 'https://open.spotify.com/embed/track/3uzjBwojjxmH5XLqlsgLmU?utm_source=generator',
    },
  ],
};

export const topAlbumsLists: Record<string, AlbumListConfig> = {
  '1': top2025,
  '2': top25,
};
