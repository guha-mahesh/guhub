/**
 * The topster, hung on the plate.
 *
 * Nothing but the chart. It keeps the crimson ground, the ruled border and
 * the grain so it reads as another page out of the same book, and the image
 * takes as much of the frame as it can without cropping. No torn corner here:
 * it lands exactly where the album titles are.
 */
import Grain from "./Grain";
import "./Noria.css";
import "./Topster.css";

export default function Topster() {
  return (
    <div className="crim topsterPage">
      <div className="topsterFrame">
        <img className="topsterChart" src="/topster.png" alt="topster" />
      </div>

      <Grain />
      <div className="crimPlate" aria-hidden />
      <div className="crimPlateCap" aria-hidden>pl. ii — the topster</div>

      <a className="crimLeave" href="/">back</a>
    </div>
  );
}
