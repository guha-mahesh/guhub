/**
 * What each object on the plate is about.
 *
 * One table, read by both renderers: the desktop world hangs these off the
 * thing you click, the phone sets them under the figure on the page. A topic
 * that is not in here does not exist on either.
 */
import type { ReactNode } from "react";
import { WhoBody, ElsewhereBody, BuiltList, SheetBody } from "./noriaContent";

/** The line under the name, printed on the plate and on the title page. */
export const EPIGRAPH = "Gloriare iis quibus frueris.";

export type Topic = {
  /** the engraver's caption for the figure */
  caption: string;
  body: ReactNode;
};

export const TOPIC_BODIES: Record<string, Topic> = {
  who: { caption: "the tree", body: <WhoBody /> },
  elsewhere: { caption: "the wheel", body: <ElsewhereBody /> },
  built: { caption: "the works", body: <BuiltList /> },
  record: { caption: "the scribe", body: <SheetBody /> },
  vulture: { caption: "the bird", body: null },
};
