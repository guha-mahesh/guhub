# /noria variants

`bizarre-desk` is HEAD: the engraved crimson plate, plus the bird.

Each variant below lives on its own branch with its screenshots committed at
`guhub/docs/shots/`. To run one, switch to it:

```
git checkout v-night && cd guhub && npm run dev
```

| branch | what it is | why it works |
|---|---|---|
| `bizarre-desk` | **HEAD.** Engraved crimson plate. Ruled border, hatched hills, stepped dither sky, tartan in the torn corner, and the bird as a metallic freeze frame with BANG struck across it. | The baseline everything else is a departure from. |
| `v-night` | The same plate after dark. Cold indigo field, a gibbous moon low behind the tree, the horizon the only warm thing left. | Best of the four. The moon sitting *behind* the hill line is what sells the distance, and keeping one warm band on the horizon stops the whole frame going dead. |
| `v-bone` | Inverted: black ink on bone paper. | This is the register Obra Dinn actually used, and the silhouettes are far stronger against light than against dark. The tartan corner becomes the only colour in the frame. |
| `v-storm` | The plate under rain, ruled at a constant angle across the whole frame in two layers at different speeds. | Rain as engraver's hatching rather than as particles. Costs one element and reads as weather immediately. |
| `v-brass` | Brass and soot instead of red. | Warm metal light on a brown-black field. Closest in feel to HEAD while reading as a different material entirely. |
| `v-cloth` | The exact inverse of HEAD: the whole plate is dark tartan, and the torn corner is clean bright plate cut out of it. | The strongest departure of the set. Reads as though the cloth was underneath all along and the plate is what got torn away. Darkest of the five, so the objects read as shapes rather than as detail. |

## Notes for whoever picks one up

Every variant is a palette swap plus at most one new element, so they are cheap
to merge or to cherry-pick from. The thing that made them fiddly is that the
scene had accumulated hardcoded colour literals in three files, and several of
them were stale, so a naive find-and-replace left red patches behind. If you
add a variant, grep for hex literals in `Noria.css` and `NoriaArt.tsx` and
check the rendered result rather than trusting the patch.

`Grain.tsx` paints the whole atmosphere into one canvas. Its ink colour is a
constant at the top of that file and needs changing per variant too.


## State of HEAD, verified in a real browser

All six destinations fly and open: engramme, the hollow, sounds, built, the
bird, who. Camera distances land where the shots specify them.

Frame cost during a camera flight, measured over 175 frames:

| | median | frames over 20ms |
|---|---|---|
| before the performance work | 28.1ms | 175 of 175 |
| now | 16.7ms | 0 |

What actually cost the frames, found by bisecting one layer at a time rather
than guessing: nine masked full-viewport overlays at about 6.5ms, and a
7000x5200 ground plane at about 5ms. The trees, the fifty-odd running
animations and the masks themselves measured as free. The whole atmosphere is
now painted once into a single canvas in `Grain.tsx`, and
`background-attachment: fixed` is gone everywhere, since the page never
scrolls and it was forcing a full-viewport repaint every frame for nothing.
