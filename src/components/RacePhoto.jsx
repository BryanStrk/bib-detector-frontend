// Demo race photo for the viewer's empty/idle state. The bounding-box overlays
// in DetectionViewer are positioned (as percentages) to sit over the runners'
// bibs in this image.
import raceDemo from "../assets/race-demo.jpg";

export default function RacePhoto({ className = "" }) {
  return (
    <img
      src={raceDemo}
      // The parent uses the image's exact aspect ratio, so object-contain
      // shows the photo whole — no crop, no letterboxing — and the
      // percentage-positioned detection overlays land exactly on it.
      className={`${className} object-contain`}
      alt="Race photo: runners crossing the finish line, each wearing a numbered bib."
    />
  );
}
