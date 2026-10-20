import Image from "next/image";
import type { Img } from "@/db/schema";

type Focus = "center" | "portrait" | "soft";
const FOCUS: Record<Focus, string> = { center: "object-center", portrait: "object-portrait", soft: "object-portrait-soft" };

/**
 * Every Cloudinary photo goes through here (GESA-style): next/image `fill` + object-cover inside a
 * sized wrapper. Give the wrapper an aspect ratio via className; pick `focus="portrait"` for people.
 */
export function Photo({ img, alt = "", sizes = "(min-width:1024px) 33vw, 100vw", priority = false, className = "", focus = "soft", zoom = true }:
  { img?: Img | null; alt?: string; sizes?: string; priority?: boolean; className?: string; focus?: Focus; zoom?: boolean }) {
  return (
    <div className={`${className.includes("absolute") ? "" : "relative"} overflow-hidden bg-gradient-to-br from-emerald to-forest ${className}`}>
      {img && <Image src={img.url} alt={img.alt ?? alt} fill sizes={sizes} priority={priority}
        className={`object-cover ${FOCUS[focus]} transition duration-500 ${zoom ? "group-hover:scale-105" : ""}`} />}
    </div>
  );
}
