import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
const FILM =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260820_010308_b1636845-4c15-4ab6-b0c9-9a29bfb0c6e3.mp4";
/** Existing Acsess film, paused when offscreen or motion is reduced. */
export function Landscape() {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      if (visible && !reduced.matches && !paused) void video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      update();
    });
    observer.observe(video);
    reduced.addEventListener("change", update);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", update);
    };
  }, [paused]);
  return (
    <>
      <video
        ref={ref}
        className="a-landscape"
        src={FILM}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        className="a-film-toggle"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? "Play background film" : "Pause background film"}
      >
        {paused ? <Play size={16} /> : <Pause size={16} />}
      </button>
    </>
  );
}
