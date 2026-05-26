import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { MapPin, CalendarDays, Mountain,Bed , Sun,Send,Bookmark,Check, Download, Calendar,ArrowRight,TrendingUp} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { GoogleMap, OverlayViewF, useJsApiLoader } from "@react-google-maps/api";
import { toursService } from "../services/toursService";
import { homeService } from "../services/homeService";
import type { TourDetails, ItineraryDay } from "../types/tour";
import type { HomeTour } from "../types/home";
import { useSavedTours } from "../contexts/SavedToursContext";
import { useAuth } from "../hooks/useAuth";
import SEO from "../components/SEO";
import { supabase } from "../lib/supabaseClient";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOUR DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const tour = {
  title: "Silk Route Trails & Tales",
  tags: ["Cultural", "Heritage", "Photography"],
  location: "Ladakh",
  duration: "9N / 10D",
  difficulty: "Moderate",
  bestSeason: "Summer",
  heroImage: "/T_detail.svg",

  overview:
    "Silk Route Trails & Tales is a cultural journey through Ladakh's ancient trade routes that once connected Central Asia, Tibet, and the Indian subcontinent. This experience goes beyond sightseeing, allowing travelers to explore monasteries, villages, rock art sites, and living traditions shaped by centuries of movement, exchange, and belief. The journey is slow, immersive, and deeply connected to the people and landscapes of the Himalayas.",

  highlights: [
    "Walk along ancient Silk Route paths",
    "Visit historic monasteries and sacred sites",
    "Interact with local village communities",
    "Experience Ladakhi culture, food, and traditions",
    "Learn about trade history and Himalayan heritage",
  ],

  inclusions: [
    "Accommodation during the journey",
    "Local cultural guide",
    "Transportation during the tour",
    "Guided monastery and village visits",
    "Cultural interactions and heritage walks",
  ],

  exclusions: [
    "Personal expenses",
    "Travel insurance",
    "Flights to and from Leh",
    "Anything not mentioned under inclusions",
  ],

  accommodation: {
    title: "Accommodation",
    description:
      "Stay in a mix of locally run guesthouses and traditional homestays. These accommodations offer basic comfort while allowing meaningful interaction with hosts and insight into everyday Ladakhi life.",
    image: null,
  },

  videoSection: {
    title: "Glimpse of Nomadic Life",
    description:
      "The Nomadic Festival aims to celebrate the distinct culture of the Changpa tribe by highlighting their unique heritage including traditional lifestyle, dresses, foods, songs, dances, music and sports.",
    videoUrl: "",
  },

  mapSection: {
    title: "Route & Region Map",
    description:
      "The route follows sections of the ancient Silk Route through Leh, Sham Valley, Lamayuru, Nubra Valley, and surrounding regions, highlighting historically important trade and cultural corridors.",
    googleMapsEmbedUrl: "",
    centerLat: 34.1526,
    centerLng: 77.5771,
  },

  recommendedTours: [
    {
      id: 1,
      title: "Bon & Balti – Back to Roots",
      location: "Ladakh",
      tags: ["Cultural", "Indigenous"],
      duration: "5N / 6D",
      image: null,
    },
    {
      id: 2,
      title: "Glimpse of Ladakh",
      location: "Ladakh",
      tags: ["Cultural", "Introductory"],
      duration: "5N / 6D",
      image: null,
    },
    {
      id: 3,
      title: "Cultural & Heritage Tour",
      location: "Ladakh",
      tags: ["Cultural", "Heritage"],
      duration: "Custom / Flexible",
      image: null,
    },
  ],

  reviews: [
    {
      name: "Aditi Sharma",
      origin: "India",
      date: "March 2024",
      rating: 5,
      review:
        "The Silk Route journey felt like walking through history. Every village, monastery, and story shared by the guide added meaning to the landscapes we saw. It wasn't rushed or touristy — just deeply immersive and thoughtful.",
      avatar: null,
    },
    {
      name: "Lucas Meyer",
      origin: "Germany",
      date: "October 2023",
      rating: 5,
      review:
        "This tour showed me Ladakh beyond the usual routes. The cultural explanations, local interactions, and slow pace made the experience truly special. I returned with a much deeper respect for Himalayan life and heritage.",
      avatar: null,
    },
    {
      name: "Neha Kulkarni",
      origin: "India",
      date: "September 2024",
      rating: 5,
      review:
        "What stood out was the storytelling. From ancient trade routes to everyday village life, everything felt authentic. This wasn't just a trip — it felt like learning Ladakh from the inside.",
      avatar: null,
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ITINERARY DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const defaultItinerary = [
  { day: 1, title: "Arrival in Leh", description: "Arrive in Leh and rest for acclimatization. Evening orientation and introduction to Ladakhi culture.", image: null },
  { day: 2, title: "Leh to Sham Valley", description: "Explore old forts, local markets, old palaces, and Indus riverline. Learn about Ladakh's role as a caravan crossroads.", image: null },
  { day: 3, title: "Trek Along the Lakes", description: "Travel through villages along the lakes today. Visit ancient monasteries and interact with local families.", image: null },
  { day: 4, title: "Sham's Valley to Lamayuru", description: "Visit Lamayuru monastery and nearby heritage sites. Learn about monastic life and sacred landscapes.", image: null },
  { day: 5, title: "Nubra Valley Exploration", description: "Journey across high mountain passes. Explore Nubra's villages and historical Silk Route traces.", image: null },
  { day: 6, title: "Visit Monasteries", description: "Visit monasteries, interact with local communities, and understand the preserved Silk Route's history.", image: null },
  { day: 7, title: "Nubra to Pangong Region", description: "Travel through high-terrain terrain with stops at cultural and scenic points.", image: null },
  { day: 8, title: "Pangong Lake", description: "Follow your journey with reflective stops. Witness the surreal shades of the ancient lake landscape.", image: null },
  { day: 9, title: "Heritage Activities", description: "Take local interactions, photography trips, or explore heritage activities.", image: null },
  { day: 10, title: "Departure", description: "Departure from Leh with a deeper understanding of Ladakh's living heritage.", image: null },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESIGN TOKENS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const COLOR = {
  dark:        "#1a0e04",
  darkBrown:   "#2a1a0e",
  brand:       "#3b1408",
  brandHover:  "#5c2010",
  amber:       "#f59e0b",
  amberHover:  "#d97706",
  green:       "#22c55e",
  red:         "#ef4444",
  textPrimary: "#1a1a1a",
  textMuted:   "#6b7280",
  textFaint:   "#9ca3af",
  bgLight:     "#f9f7f4",
  bgMid:       "#f2f0eb",
  border:      "#ece8e2",
};

const FONT = {
  body: "'Inter',berlin sans fb,sans-serif"
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMALL REUSABLE COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const InfoItem = ({ icon: Icon, label }: any) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.9)", fontSize: "0.875rem" }}>
    <Icon size={15} strokeWidth={1.6} color="rgba(255,255,255,0.9)" />
    <span>{label}</span>
  </div>
);

const HeroPlaceholder = () => (
  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #b0bec5 0%, #78909c 40%, #546e7a 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" opacity="0.45">
      <rect x="4" y="12" width="48" height="34" rx="4" stroke="white" strokeWidth="2.5" fill="none" />
      <circle cx="19" cy="26" r="5" stroke="white" strokeWidth="2.2" fill="none" />
      <path d="M4 38l13-10 9 8 8-7 18 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>Hero Image Placeholder</span>
  </div>
);

const TimelineImgPlaceholder = ({ day }: any) => (
  <div style={{ width: "100%", aspectRatio: "16/10", borderRadius: 8, background: "linear-gradient(135deg, #d6cfc8 0%, #b0a89e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, transition: "transform 0.35s ease" }}>
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" opacity="0.45">
      <rect x="2" y="5" width="24" height="18" rx="2.5" stroke="#3b2a1a" strokeWidth="1.8" fill="none" />
      <circle cx="9" cy="12" r="2.5" stroke="#3b2a1a" strokeWidth="1.6" fill="none" />
      <path d="M2 20l7-6 5 5 4-4 8 7" stroke="#3b2a1a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
    <span style={{ fontSize: "0.58rem", color: "#3b2a1a", opacity: 0.45, letterSpacing: "0.1em", textTransform: "uppercase" }}>Day {day}</span>
  </div>
);

const ImgPlaceholder = ({ aspectRatio = "4/3", size = 40 }) => (
  <div style={{ width: "100%", aspectRatio, borderRadius: 8, background: "linear-gradient(135deg, #d6cfc8 0%, #b0a89e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" opacity="0.4">
      <rect x="3" y="8" width="34" height="24" rx="3" stroke="#3b2a1a" strokeWidth="2" fill="none" />
      <circle cx="13" cy="18" r="3.5" stroke="#3b2a1a" strokeWidth="1.8" fill="none" />
      <path d="M3 28l9-8 7 7 5-5 13 9" stroke="#3b2a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
    <span style={{ fontSize: "0.63rem", color: "#3b2a1a", opacity: 0.45, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Source Serif 4, serif" }}>Image Placeholder</span>
  </div>
);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WHATSAPP REDIRECT FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


  const handleWhatsAppEnquiry = () => {
  const phoneNumber = "919622992881"; 
  const message = "Hello, I would like to enquire about your tours.";
  const encodedMessage = encodeURIComponent(message);

  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank"); 
  };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/* ── 1. HERO ── */
const HeroSection = ({ tourData, bookmarked, onBookmark, onCustomize, isAuthenticated }: any) => {
  const { title, tags, location, duration, difficulty, bestSeason, heroImage } = tourData;
  return (
 <section style={{ 
  position: "relative", 
  width: "100%", 
  aspectRatio: "16 / 9",
  minHeight: 320,
  maxHeight: "82vh",
  display: "flex", 
  alignItems: "flex-end" 
}}>
  {heroImage ? (
    <div style={{ 
      position: "absolute", 
      inset: 0, 
      backgroundImage: `url(${heroImage})`, 
      backgroundSize: "cover", 
      backgroundPosition: "center top" 
    }} />
  ) : (
    <HeroPlaceholder />
  )}

  {/* overlay — FIXED: restored correct gradient styles */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.35) 100%)",
    }}
  />

  {/* Content */}
  <div style={{ 
    position: "relative", 
    zIndex: 10, 
    width: "100%", 
    padding: "0 clamp(0.9rem, 5vw, 5rem) clamp(1rem, 3vw, 2rem)" 
  }}>

    <h1
      className="hero-title"
      style={{ 
        color: "white", 
        fontSize: "clamp(1.1rem, 4vw, 3rem)", 
        fontWeight: 400, 
        fontFamily: "Berlin Sans FB", 
        letterSpacing: "-0.02em", 
        lineHeight: 1.15, 
        marginBottom: "clamp(8px, 2vw, 16px)", 
        textShadow: "0 2px 12px rgba(0,0,0,0.4)" 
      }}
    >
      {title}
    </h1>

    {/* Tags */}
    <div style={{ 
      display: "flex", 
      flexWrap: "wrap", 
      gap: "clamp(4px, 1.5vw, 8px)", 
      marginBottom: "clamp(8px, 2.5vw, 18px)" 
    }}>
      {tags.map((tag: any) => (
        <span
          key={tag}
          style={{ 
            background: COLOR.amber, 
            color: "white", 
            fontSize: "clamp(0.58rem, 1.8vw, 0.70rem)", 
            fontWeight: 300, 
            fontFamily: FONT.body, 
            padding: "clamp(4px, 1.2vw, 8px) clamp(8px, 2vw, 13px)", 
            borderRadius: 999, 
            cursor: "default", 
            letterSpacing: "0.03em", 
            transition: "background 0.3s",
            whiteSpace: "nowrap",
          }}
        >
          {tag}
        </span>
      ))}
    </div>

    {/* Meta info */}
    <div style={{ 
      display: "flex", 
      flexWrap: "wrap", 
      gap: "clamp(3px, 1.5vw, 6px) clamp(8px, 3vw, 22px)", 
      marginBottom: "clamp(10px, 3.5vw, 28px)", 
      fontFamily: FONT.body 
    }}>
      <InfoItem icon={MapPin} label={location} />
      <InfoItem icon={CalendarDays} label={duration} />
      <InfoItem icon={Mountain} label={difficulty} />
      <InfoItem icon={Sun} label={`Best Season: ${bestSeason}`} />
    </div>

    {/* CTA buttons */}
    <div style={{ 
      display: "flex", 
      flexWrap: "wrap", 
      alignItems: "center", 
      gap: "clamp(5px, 2vw, 10px)" 
    }}>
      <button
        onClick={handleWhatsAppEnquiry}
        className="flex items-center gap-2 rounded-xl bg-[#1a0903] text-white font-sans transition-all duration-300 hover:bg-yellow-500 hover:text-black"
        style={{ 
          padding: "clamp(5px, 1.5vw, 8px) clamp(12px, 3vw, 24px)", 
          fontSize: "clamp(0.72rem, 2vw, 1rem)" 
        }}
      >
        <Send size={13} strokeWidth={2} className="transition-colors duration-300" />
        Enquire Now
      </button>

      <button onClick={onCustomize}
        className="rounded-xl border border-white/70 text-white font-sans tracking-tight transition-all duration-300 hover:bg-yellow-500 hover:text-black hover:border-yellow-500"
        style={{ 
          padding: "clamp(5px, 1.5vw, 8px) clamp(12px, 3vw, 24px)", 
          fontSize: "clamp(0.72rem, 2vw, 0.94rem)" 
        }}
      >
        Customize Tour
      </button>

      {isAuthenticated && (
        <button
          onClick={onBookmark}
          title={bookmarked ? "Saved" : "Save tour"}
          className={`flex items-center justify-center rounded-lg border border-white/40 backdrop-blur-sm transition-all duration-300 
            ${bookmarked ? "bg-yellow-500 border-yellow-500" : "bg-white/10 hover:bg-yellow-500 hover:border-yellow-500"} 
            hover:scale-105 active:scale-95`}
          style={{ 
            width: "clamp(30px, 5vw, 40px)", 
            height: "clamp(28px, 4.5vw, 36px)",
            flexShrink: 0,
          }}
        >
          <Bookmark 
            size={15} 
            strokeWidth={1.8} 
            className={`transition-colors duration-300 ${bookmarked ? "fill-black text-black" : "text-white"}`} 
          />
        </button>
      )}
    </div>
  </div>
</section>
  );
};

/* ── 2. OVERVIEW ── */
const OverviewSection = ({ overview }: any) => (
  <section className="bg-white" style={{ padding: "50px clamp(1rem, 5vw, 2.5rem)" }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw, 2rem)", color: "black", fontFamily: "Berlin Sans FB", letterSpacing: "-0.01em", marginBottom: 12 }}>
        Overview
      </h2>
      <p style={{ fontSize: "0.95rem", color: "#6b7280", lineHeight: 1.65, fontFamily: FONT.body }}>
        {overview}
      </p>
    </div>
  </section>
);

/* ── 3. HIGHLIGHTS ── */
const HighlightsSection = ({ highlights }: any) => (
  <section className="bg-[#F3F4F1]" style={{ padding: "56px clamp(1rem, 5vw, 2.5rem)" }}>
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.9rem)", color: "black", fontFamily: "Berlin Sans FB", letterSpacing: "-0.01em", marginBottom: 16 }}>
        Highlights
      </h2>
      {/* highlights-grid class is targeted in index.css for mobile */}
      <div className="highlights-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 64px" }}>
        {highlights.map((item: any, i: any) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "#140804", flexShrink: 0, marginTop: 2 }}>
              <Check size={14} strokeWidth={3} color="white" />
            </div>
            <span style={{ fontSize: "0.9rem", color: "#4a5565", lineHeight: 1.65, fontFamily: FONT.body }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── 4. ITINERARY ── */
const loadSvgAsBase64 = async (src: string): Promise<string | null> => {
  try {
    const res = await fetch(src);
    const svgText = await res.text();
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 300;
        canvas.height = img.naturalHeight || 100;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  } catch {
    return null;
  }
};

const downloadItineraryPDF = async (itinerary: any[], tourTitle = "Itinerary") => {
  // const logoBase64 = await loadSvgAsBase64("/hht_final_logo_send.svg");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  const headerH = 34;

  // ── Header bar ──
  doc.setFillColor(42, 15, 6);
  doc.rect(0, 0, pageW, headerH, "F");

  // Logo on the right side of header
  // if (logoBase64) {
  //   const logoH = 18;
  //   const logoW = logoH * 3; // approximate aspect ratio
  //   doc.addImage(logoBase64, "PNG", pageW - margin - logoW, (headerH - logoH) / 2, logoW, logoH);
  // }

  // Title + subtitle on left
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(tourTitle, margin, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 200, 190);
  doc.text("Heritage Himalaya Trails  •  hhtrails.com", margin, 22);

  // ── "Day-by-Day Itinerary" subheading ──
  const subY = headerH + 12;
  doc.setTextColor(42, 15, 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Day-by-Day Itinerary", margin, subY);

  // ── Amber accent line under subheading ──
  doc.setDrawColor(244, 163, 33);
  doc.setLineWidth(0.8);
  doc.line(margin, subY + 2.5, margin + 48, subY + 2.5);

  // ── Full-width divider ──
  doc.setDrawColor(220, 215, 210);
  doc.setLineWidth(0.3);
  doc.line(margin, subY + 6, pageW - margin, subY + 6);

  let y = subY + 14;

  itinerary.forEach((item: any, idx: number) => {
    const dayLabel = `Day ${item.startDay ?? item.day}${item.endDay ? `–${item.endDay}` : ""}`;
    const title: string = item.title ?? "";
    const description: string = item.description ?? "";

    const descLines: string[] = doc.splitTextToSize(description, contentW - 10);
    const pillW = 24;
    const pillH = 6.5;
    const titleX = margin + pillW + 4;
    const descX = margin + 4;
    const descStartY = y + pillH + 4;
    const blockH = pillH + 4 + descLines.length * 5 + 8;

    // New page if needed
    if (y + blockH > pageH - 22) {
      doc.addPage();
      y = 22;
    }

    // Day pill
    doc.setFillColor(42, 15, 6);
    doc.roundedRect(margin, y, pillW, pillH, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(dayLabel, margin + pillW / 2, y + 4.4, { align: "center" });

    // Title (vertically centered with pill)
    doc.setTextColor(25, 10, 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(title, titleX, y + 4.4);

    // Description
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(descLines, descX, descStartY, { lineHeightFactor: 1.5 });

    y += blockH;

    // Separator (skip last)
    if (idx < itinerary.length - 1) {
      doc.setDrawColor(235, 230, 225);
      doc.setLineWidth(0.2);
      doc.line(margin, y - 3, pageW - margin, y - 3);
    }
  });

  // ── Footer on every page ──
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // footer bar
    doc.setFillColor(248, 246, 242);
    doc.rect(0, pageH - 14, pageW, 14, "F");
    doc.setTextColor(140, 120, 110);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text("Heritage Himalaya Trails", margin, pageH - 5.5);
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 5.5, { align: "right" });
    // footer top border
    doc.setDrawColor(220, 210, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 14, pageW - margin, pageH - 14);
  }

  doc.save(`${tourTitle.replace(/\s+/g, "_")}_Itinerary.pdf`);
};

const sendItineraryWhatsApp = (itinerary: any[], tourTitle = "Itinerary") => {
  const lines: string[] = [`📋 *${tourTitle} — Itinerary*`, ""];
  itinerary.forEach((item: any) => {
    const dayLabel = `Day ${item.startDay ?? item.day}${item.endDay ? `–${item.endDay}` : ""}`;
    lines.push(`*${dayLabel} – ${item.title ?? ""}*`);
    if (item.description) lines.push(item.description);
    lines.push("");
  });
  lines.push("— Heritage Himalaya Trails");
  lines.push("https://hhtrails.com");
  const text = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
};

const ItinerarySection = ({ itinerary, tourTitle }: any) => (
  <section
    className="bg-[#ffffff] border-t border-[#ece8e3] font-sans"
    style={{ padding: "46px clamp(1rem, 4vw, 2.5rem)" }}
  >
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      <h2
        className="text-center"
        style={{
          fontSize: "clamp(1.9rem, 2vw, 2.3rem)",
          color: "black",
          fontFamily: "Berlin Sans FB",
          letterSpacing: "0.02em",
          marginBottom: 40
        }}
      >
        Walk Through the Experience
      </h2>

      {/* Buttons */}
      <div
        className="itin-btn-row"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginBottom: 40,
          flexWrap: "wrap"
        }}
      >
        <button
          onClick={() => sendItineraryWhatsApp(itinerary, tourTitle)}
          className="group flex items-center gap-2 font-semibold px-4 py-2 text-[13px] border border-gray-300 rounded-md text-gray-700 bg-white transition-all duration-300 hover:bg-[#2a0f06] hover:text-white hover:border-[#2a0f06]"
        >
          <FaWhatsapp size={14} />
          Send Itinerary
        </button>

        <button
          onClick={() => { downloadItineraryPDF(itinerary, tourTitle); }}
          className="group flex items-center gap-2 px-4 py-2 text-[13px] font-semibold border border-gray-300 rounded-md text-gray-700 bg-white transition-all duration-300 hover:bg-[#2a0f06] hover:text-white hover:border-[#2a0f06]"
        >
          <Download size={14} strokeWidth={1.8} />
          Download Itinerary
        </button>
      </div>

      {/* ================= DESKTOP TIMELINE ================= */}
      <div className="timeline-desktop" style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            background: "#2a0f06",
            transform: "translateX(-50%)",
            zIndex: 0
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          {itinerary.map((item: any, idx: any) => {
            const isLeft = idx % 2 === 0;

            /* ===== UPDATED IMAGE CARD ===== */
            const TimelineImage = ({ item }: any) => (
              <div
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                  background: "#2a0f06",
                  position: "relative"
                }}
              >
                {/* Main Image */}
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                ) : (
                  <TimelineImgPlaceholder day={item.day} />
                )}

                {/* 🔥 Top Curved Overlay */}
                <img
                  src="/Vector.svg"
                  alt="overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: 35,
                    objectFit: "cover",
                    pointerEvents: "none",
                    zIndex: 2
                  }}
                />

                {/* Bottom Title Bar */}
                <div
                  style={{
                    background: "#2a0f06",
                    color: "white",
                    textAlign: "center",
                    padding: "10px 8px",
                    fontSize: 14,
                    fontWeight: 500
                  }}
                >
                  {item.title}
                </div>
              </div>
            );

            const TimelineText = ({ item }: any) => (
              <div>
                <p style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#2a0f06",
                  marginBottom: 4
                }}>
                  Day {item.startDay ?? item.day}
                  {item.endDay ? `–${item.endDay}` : ""}
                </p>
                <p style={{
                  fontSize: 13,
                  color: "#6b7280",
                  lineHeight: 1.6
                }}>
                  {item.description}
                </p>
              </div>
            );

            return (
              <div
                key={item.day}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 40px 1fr",
                  alignItems: "flex-start",
                  position: "relative",
                  zIndex: 10,
                  marginBottom: 56
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 28 }}>
                  {isLeft
                    ? <div style={{ width: 240 }}><TimelineImage item={item} /></div>
                    : <div style={{ width: 240 }}><TimelineText item={item} /></div>}
                </div>

                <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#2a0f06",
                    border: "3px solid #f5f2ee",
                    outline: "2px solid #2a0f06"
                  }} />
                </div>

                <div style={{ paddingLeft: 28 }}>
                  {!isLeft
                    ? <div style={{ width: 240 }}><TimelineImage item={item} /></div>
                    : <div style={{ width: 240 }}><TimelineText item={item} /></div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MOBILE TIMELINE ================= */}
      <div
        className="timeline-mobile"
        style={{
          display: "none",
          flexDirection: "column",
          position: "relative",
          paddingLeft: 28
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 6,
            top: 0,
            bottom: 0,
            width: 2,
            background: "#2a0f06"
          }}
        />

        {itinerary.map((item: any, idx: any) => (
          <div
            key={item.day}
            style={{
              display: "flex",
              marginBottom: idx < itinerary.length - 1 ? 36 : 0,
              position: "relative"
            }}
          >
            <div
              style={{
                position: "absolute",
                left: -28,
                top: 14,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#2a0f06",
                border: "2px solid #f5f2ee",
                outline: "1.5px solid #2a0f06"
              }}
            />

            {/* Mobile Card (Overlay Applied Here Too) */}
            <div style={{ width: "100%" }}>
              <div style={{
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                position: "relative"
              }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: 180,
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <TimelineImgPlaceholder day={item.day} />
                )}

                <img
                  src="/Vector.svg"
                  alt="overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: 50,
                    objectFit: "cover",
                    pointerEvents: "none"
                  }}
                />

                <div style={{
                  background: "#2a0f06",
                  color: "white",
                  textAlign: "center",
                  padding: "10px 8px",
                  fontSize: 14,
                  fontWeight: 500
                }}>
                  {item.title}
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <p style={{ fontWeight: 600, color: "#2a0f06" }}> 
                  Day {item.startDay ?? item.day}
                  {item.endDay ? `–${item.endDay}` : ""}
                </p>
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  </section>
);

/* ── 5. INCLUSIONS & EXCLUSIONS ── */
const InclusionsSection = ({ inclusions, exclusions }: any) => (
  <section style={{ backgroundColor: "#f3f4f1", padding: "68px clamp(1rem, 5vw, 2.5rem)" }}>
    {/* inc-exc-grid class is targeted in index.css for mobile */}
    <div
      className="inc-exc-grid"
      style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 64px" }}
    >
      <div>
        <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 1.7rem)", fontWeight: 200, color: COLOR.textPrimary, marginBottom: 26, fontFamily: "Berlin Sans FB" }}>
          Inclusions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: FONT.body, gap: 16 }}>
          {inclusions.map((item: any, i: any) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flexShrink: 0, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9.5l4 4 8-8" stroke={COLOR.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.55 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 1.7rem)", fontWeight: 200, color: COLOR.textPrimary, marginBottom: 26, fontFamily: "Berlin Sans FB" }}>
          Exclusions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: FONT.body, gap: 16 }}>
          {exclusions.map((item: any, i: any) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flexShrink: 0, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke={COLOR.red} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.55 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ── 6. ACCOMMODATION ── */
const AccommodationSection = ({ accommodation }: any) => (
  <section style={{ background: "white", padding: "40px clamp(1rem, 5vw, 2.5rem)" }}>
    {/* accom-grid class is targeted in index.css for mobile */}
    <div
      className="accom-grid"
      style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 64px" }}
    >
      <div style={{ overflow: "hidden", borderRadius: 10 }}>
        {accommodation.image ? (
          <img src={accommodation.image} alt={accommodation.title} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 10, display: "block" }} />
        ) : (
          <ImgPlaceholder aspectRatio="4/3" size={10} />
        )}
      </div>
      <div>
        <h2 style={{ fontSize: "clamp(1.8rem, 2.5vw, 1.9rem)", fontWeight: 400, color: COLOR.textPrimary, marginBottom: 20, fontFamily: "Berlin Sans FB" }}>
          {accommodation.title}
        </h2>
        <p style={{ fontSize: "0.97rem", color: COLOR.textMuted, lineHeight: 1.6 }}>
          {accommodation.description}
        </p>
      </div>
    </div>
  </section>
);

function toEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  const shortMatch = url.match(/(?:youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([\w-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
}

/* ── 7. VIDEO ── */
const VideoSection = ({ videoSection }: any) => (
  <section style={{ background: "#1F150F", padding: "68px clamp(1rem, 5vw, 2.5rem)" }}>
    {/* video-grid class is targeted in index.css for mobile */}
    <div
      className="video-grid"
      style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 64px" }}
    >
      {/* video-embed class controls order on mobile via index.css */}
      <div
        className="video-embed"
        style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 10, overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.1)" }}
      >
        {videoSection.videoUrl ? (
          <iframe
            src={toEmbedUrl(videoSection.videoUrl)}
            title={videoSection.title || "Tour Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#c0392b", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(192,57,43,0.55)" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 4l12 6-12 6V4z" fill="white" /></svg>
            </div>
            <span style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.32)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Paste video URL to embed</span>
          </div>
        )}
      </div>

      {/* video-text class controls order on mobile via index.css */}
      <div className="video-text">
        <h2 style={{ fontSize: "clamp(1.8rem, 2.5vw, 1.8rem)", fontWeight: 400, color: "white", marginBottom: 10, lineHeight: 1.25, fontFamily: "Berlin Sans FB" }}>
          {videoSection.title || "Glimpse of Nomadic Life"}
        </h2>
        <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.58)", lineHeight: 1.9, fontWeight: 300, maxWidth: 380 }}>
          {videoSection.description}
        </p>
      </div>
    </div>
  </section>
);

/* ── 8. MAP ── */
const containerStyle = { width: "100%", height: "100%" };

const fallbackLocations = [
  { lat: 34.6307, lng: 77.6100 },
  { lat: 34.6276, lng: 77.6099 },
  { lat: 34.5835, lng: 77.4730 },
  { lat: 34.6053, lng: 77.6188 },
  { lat: 34.5871, lng: 77.4747 },
  { lat: 34.5986, lng: 77.4590 },
  { lat: 34.6193, lng: 77.6212 },
  { lat: 34.6182, lng: 77.6139 },
  { lat: 34.5476, lng: 77.5556 },
  { lat: 34.5736, lng: 77.4811 },
  { lat: 34.5885, lng: 77.4803 },
  { lat: 34.5847, lng: 77.4621 },
  { lat: 34.5886, lng: 77.4706 },
];

const MapSection = ({ mapSection }: { mapSection: any }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const locations = mapSection?.locations || fallbackLocations;
  const center = locations.length > 0 ? locations[0] : { lat: 34.1526, lng: 77.5771 };

  return (
    <section style={{ background: "#F4F4F4", padding: "90px clamp(1rem, 4vw, 1.5rem)" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 400, color: "#2b1b14", marginBottom: 20, letterSpacing: "-0.02em", fontFamily: "Berlin Sans FB" }}>
          {mapSection?.title || "Route & Region Map"}
        </h2>

        {/* map-inner-card class is targeted in index.css for mobile */}
        <div
          className="map-inner-card"
          style={{ background: "#ffffff", borderRadius: 18, padding: "40px 40px 46px", boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}
        >
          <p style={{ textAlign: "center", fontSize: "1rem", color: "#4A5565", lineHeight: 1.8, maxWidth: 760, margin: "0 auto 32px" }}>
            {mapSection?.description || "The route follows sections of the ancient Silk Route through Leh, Sham Valley, Lamayuru, Nubra Valley, and surrounding regions."}
          </p>

          <div style={{ background: "#ffffff", borderRadius: 14, padding: 16 }}>
            {/* map-iframe-wrap class is targeted in index.css for mobile */}
            <div
              className="map-iframe-wrap"
              style={{ borderRadius: 12, overflow: "hidden", height: 420, background: "#e5e3df" }}
            >
              {!isLoaded ? (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#8a8178" }}>Loading Map...</div>
              ) : (
                <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10} options={{ mapTypeControl: false, streetViewControl: false }}>
                  {locations.map((loc: any, index: number) => (
                    <OverlayViewF key={index} position={loc} mapPaneName="overlayMouseTarget">
                      <div style={{ position: "absolute", transform: "translate(-50%, -50%)", width: 32, height: 32, backgroundColor: "#d9381e", borderRadius: "50%", border: "2px solid #ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", cursor: "pointer" }}>
                        <Bed color="white" size={16} />
                      </div>
                    </OverlayViewF>
                  ))}
                </GoogleMap>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── 9. REVIEWS ── */
const ReviewsSection = ({ reviews }: any) => (
  <section style={{ background: COLOR.bgMid, padding: "76px clamp(1rem, 4vw, 2.5rem)" }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <p style={{ fontSize: "1.2rem", color: "#bbb", letterSpacing: "0.18em", marginBottom: 6 }}>···</p>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 400, color: COLOR.textPrimary, fontFamily: "Berlin Sans FB" }}>
          Traveler Stories
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {reviews.map((r: any, i: any) => (
          // review-card class is targeted in index.css for mobile
          <div
            key={i}
            className="review-card"
            style={{ background: "white", borderRadius: 14, padding: "26px 30px", border: `1px solid ${COLOR.border}`, boxShadow: "0 22px 22px rgba(0,0,0,0.04)" }}
          >
            {/* review-header class is targeted in index.css for mobile */}
            <div
              className="review-header"
              style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {r.avatar ? (
                  <img src={r.avatar} alt={r.name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: `hsl(${(i * 73 + 200) % 360}, 35%, 60%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontSize: "1.1rem", fontWeight: 700, fontFamily: "sans-serif" }}>
                    {r.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#09525E", marginBottom: 3, fontFamily: "sans-serif" }}>{r.name}</p>
                  <p style={{ fontSize: "0.74rem", color: "#09525E" }}>{r.origin} · {r.date}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 3, flexShrink: 0, paddingTop: 3 }}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg key={si} width="16" height="16" viewBox="0 0 16 16" fill={si < r.rating ? COLOR.amber : "#e5e7eb"}>
                    <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
                  </svg>
                ))}
              </div>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#09525E", lineHeight: 1.8 }}>{r.review}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── 10. RECOMMENDED TOURS ── */
const RecommendedSection = ({ recommendedTours, currentTitle }: any) => {
  const navigate = useNavigate();
  return (
  <section style={{ background: "#F4F4F4", padding: "50px clamp(1rem, 4vw, 2rem)", marginBottom: -76 }}>
    <div style={{ maxWidth: 1040, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <TrendingUp size={22} strokeWidth={2} color="#2b2b2b" />
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2rem)", fontWeight: 400, color: "#2b1b14", letterSpacing: "-0.02em", fontFamily: "Berlin Sans FB" }}>
            Recommended for You
          </h2>
        </div>
        <p style={{ fontSize: "0.95rem", fontFamily: "sans-serif", color: "#6b7280" }}>
          Because you viewed <span style={{ color: "#2b1b14", fontWeight: 400 }}>{currentTitle}</span>
        </p>
      </div>

      <div
        id="rec-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28, marginTop: 36 }}
      >
        {recommendedTours.map((t: any) => (
          <div
            key={t.id}
            style={{ background: "white", borderRadius: 16, overflow: "hidden", border: "1px solid #e7e5e4", display: "flex", flexDirection: "column", transition: "all 0.3s ease" }}
          >
            <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              {t.image ? (
                <img src={t.image} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} />
              ) : (
                <ImgPlaceholder aspectRatio="4/3" size={36} />
              )}
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "90px", backgroundImage: "url('/Vector.svg')", backgroundSize: "cover", backgroundPosition: "top", backgroundRepeat: "no-repeat", pointerEvents: "none", zIndex: 1 }} />
              <div style={{ position: "absolute", top: 12, left: 16, background: "#f4a62a", color: "white", fontSize: "0.72rem", fontWeight: 400, padding: "6px 14px", borderRadius: 999, zIndex: 2, fontFamily: "sans-serif" }}>
                Recommended
              </div>
            </div>

            <div style={{ padding: "20px 20px 0", flex: 1 }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 400, color: "#2b1b14", marginBottom: 12, lineHeight: 1.4, fontFamily: "Berlin Sans FB" }}>{t.title}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <MapPin size={14} color="#9ca3af" />
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{t.location}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {t.tags.map((tag: any) => (
                  <span key={tag} style={{ background: "#f4a62a", color: "white", fontSize: "0.7rem", fontWeight: 100, padding: "4px 12px", borderRadius: 999, fontFamily: "sans-serif" }}>{tag}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={14} color="#9ca3af" />
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{t.duration}</span>
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <button
                onClick={() => navigate(`/tours/${t.id}`)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2b1b14] text-white text-sm transition-all duration-300 hover:bg-yellow-500 hover:text-black"
                style={{ fontFamily: "Berlin Sans FB", fontWeight: 100, letterSpacing: "0.02em" }}
              >
                View Details
                <ArrowRight size={16} strokeWidth={2} className="transition-colors duration-300" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};

/* ── 11. FIXED BOTTOM CTA BAR ── */
const FixedCTABar = ({ onCustomize }: any) => (
  // fixed-cta-bar class is targeted in index.css for mobile
  <div
    className="fixed-cta-bar"
    style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 999, background: "#1a0e04", padding: "12px clamp(1rem, 4vw, 2.5rem)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: "0 -2px 18px rgba(0,0,0,0.4)", fontFamily: FONT.body, flexWrap: "wrap" }}
  >
    <div>
      <p style={{ color: "white", fontSize: "clamp(0.8rem, 2vw, 1rem)", fontWeight: 300, margin: 0, fontFamily: "Berlin Sans FB" }}>
        Ready to explore the Silk Route?
      </p>
      {/* cta-subtitle class hides this on mobile via index.css */}
      <p className="cta-subtitle" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: 300, margin: 0, marginTop: 2 }}>
        Connect with us to plan your journey
      </p>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      {/* cta-btn class is targeted in index.css for mobile sizing */}
      <button
        onClick={handleWhatsAppEnquiry}
        className="cta-btn flex items-center gap-2 rounded-xl bg-[#1a0903] text-white font-sans transition-all duration-300 hover:bg-yellow-500 hover:text-black border border-white/70"
        style={{ padding: "8px clamp(12px, 3vw, 24px)", fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}
      >
        <Send size={14} strokeWidth={2} />
        Enquire Now
      </button>
      <button
        onClick={onCustomize}
        className="cta-btn rounded-xl border border-white/70 text-white font-sans tracking-tight transition-all duration-300 hover:bg-yellow-500 hover:text-black hover:border-yellow-500"
        style={{ padding: "8px clamp(12px, 3vw, 24px)", fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)" }}
      >
        Customize Tour
      </button>
    </div>
  </div>
);



//function for repeated count 
function groupItineraryDays(days: any[]) {
  if (!days.length) return [];

  const grouped: any[] = [];
  let current = { ...days[0], startDay: days[0].day };

  for (let i = 1; i < days.length; i++) {
    const prev = days[i - 1];
    const curr = days[i];

    const sameGroup =
      curr.title === prev.title ;

    if (sameGroup) {
      current.endDay = curr.day;
    } else {
      grouped.push(current);
      current = { ...curr, startDay: curr.day };
    }
  }

  grouped.push(current);
  return grouped;
}



const CustomizeTourModal = ({ open, onClose, tourTitle }: any) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [month, setMonth] = useState("January");
  const [people, setPeople] = useState("1");
  const [preferences, setPreferences] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!open) return null;

  const interests = [
    { icon: "🏔️", label: "Mountain Trekking" },
    { icon: "🛕", label: "Temple & Monastery Visits" },
    { icon: "🍜", label: "Local Cuisine Tasting" },
    { icon: "🏡", label: "Village Homestay" },
    { icon: "🌅", label: "Sunrise/Sunset Views" },
    { icon: "🧘", label: "Yoga & Meditation" },
    { icon: "🎭", label: "Traditional Festivals" },
    { icon: "🎨", label: "Cultural Workshops" },
    { icon: "📸", label: "Photography Tours" }
  ];

  const toggleInterest = (item: string) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setStatus("error");
      setErrorMessage("Please fill in all contact details.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from('custom_tours')
        .insert([{
          tour_title: tourTitle,
          travel_month: month,
          number_of_people: parseInt(people),
          itinerary_interests: selected,
          additional_preferences: preferences,
          full_name: name,
          email: email,
          phone: phone
        }]);

      if (error) throw error;

      setStatus("success");
      // Optional: auto-close after success
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setSelected([]);
        setPreferences("");
        setName("");
        setEmail("");
        setPhone("");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Failed to submit request. Please try again.");
    }
  };

  return (
    <div
      onClick={onClose}
      className="font-sans fixed inset-0 bg-black/55 z-[2000] flex justify-center sm:justify-end items-center sm:items-stretch px-4 sm:px-0"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] sm:max-w-[480px] h-[92vh] sm:h-full rounded-xl sm:rounded-none p-5 sm:p-6 md:p-7 overflow-y-auto"
        style={{
          background: "#1a0e04",
          color: "white",
          boxShadow: "-10px 0 40px rgba(0,0,0,0.45)"
        }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="font-berlin text-[26px] font-medium">
            ✨ Customize Your Tour
          </h2>

          <button
            onClick={onClose}
            style={{
              background: "#3b1e0f",
              border: "none",
              borderRadius: "50%",
              width: 30,
              height: 30,
              color: "white",
              cursor: "pointer",
              fontSize: 16
            }}
          >
            ×
          </button>
        </div>

        <p className="text-[13px] text-[#c8b9a7] mt-1">
          Create a journey that matches your interests
        </p>

        {/* TRIP BASICS */}
        <div className="mt-6">
          <h3 className="font-berlin text-[24px] mb-2">
            Trip Basics
          </h3>

          <div className="border-b border-[#3a2517] mb-4" />

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Preferred Month */}
            <div className="flex-1">
              <label className="block text-[13px] mb-1 text-[#e6dcd0]">
                Preferred Travel Month
              </label>

              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#e9e9e9] text-black text-[14px]"
              >
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
            </div>

            {/* Number of People */}
            <div className="flex-1">
              <label className="block text-[13px] mb-1 text-[#e6dcd0]">
                Number of People
              </label>

              <select 
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#e9e9e9] text-black text-[14px]"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ITINERARY */}
        <div className="mt-7">
          <h4 className="text-[16px] mb-1">
            📍 Add Your Itinerary
          </h4>

          <p className="text-[12px] text-[#b7a896] mb-3">
            Select the experiences that interest you (you can choose multiple):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {interests.map((item) => {
              const active = selected.includes(item.label);

              return (
                <button
                  key={item.label}
                  onClick={() => toggleInterest(item.label)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full border text-[12px]
                  ${active ? "bg-white/10 border-white/50" : "border-white/35"}
                  `}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ADDITIONAL PREFERENCES */}
        <div className="mt-8">
          <h4 className="text-[18px] font-medium mb-1">
            Additional Preferences
          </h4>

          <p className="text-[13px] text-[#b7a896] mb-3">
            Tell us more about what you'd like to experience:
          </p>

          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="Write your preferred itinerary..."
            className="w-full h-[110px] rounded-xl p-3 bg-white/5 border border-white/30 text-[#f3e9dc] text-[14px]"
          />

          <p className="text-[12px] text-[#9b8a78] mt-2">
            Our team will use this information to craft a personalized itinerary for you.
          </p>
        </div>

        {/* CONTACT */}
        <div className="mt-8">
          <h3 className="font-berlin text-[28px] font-medium mb-2">
            Contact Information
          </h3>

          <div className="border-b border-white/30 mb-4" />

          <div className="mb-4">
            <label className="block text-[14px] mb-1">
              Full Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-[#e8e8e8] text-black rounded-lg px-3 py-2 text-[14px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[14px] mb-1">
                Email
              </label>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="your@email.com"
                className="w-full bg-[#e8e8e8] text-black rounded-lg px-3 py-2 text-[14px]"
              />
            </div>

            <div>
              <label className="block text-[14px] mb-1">
                Phone
              </label>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="+91"
                className="w-full bg-[#e8e8e8] text-black rounded-lg px-3 py-2 text-[14px]"
              />
            </div>
          </div>
          
          {/* Status Messages */}
          {status === 'error' && (
            <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
          )}
          {status === 'success' && (
            <p className="text-green-400 text-sm mb-4">Request submitted successfully! Our team will contact you soon.</p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={status === 'loading'}
            className="px-4 py-2 rounded-lg border border-white/60 text-[#f3e9dc] disabled:opacity-50"
          >
            Cancel
          </button>

          <button 
            onClick={handleSubmit}
            disabled={status === 'loading'}
            className="px-4 py-2 rounded-lg bg-[#e9e9e9] text-[#2b1a0f] font-medium disabled:opacity-75"
          >
            {status === 'loading' ? 'Submitting...' : 'Request Custom Itinerary'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MAX_META_DESCRIPTION_LENGTH = 155;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROOT PAGE COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TourPageUI({
  tourData = tour,
  itinerary = defaultItinerary,
  bookmarked: bookmarkedProp,
  onBookmark: onBookmarkProp,
}: {
  tourData?: typeof tour;
  itinerary?: typeof defaultItinerary;
  bookmarked?: boolean;
  onBookmark?: () => void;
}) {
  const [localBookmarked, setLocalBookmarked] = useState(false);
  const bookmarked = bookmarkedProp !== undefined ? bookmarkedProp : localBookmarked;
  const { isAuthenticated } = useAuth();
  const [showCustomize, setShowCustomize] = useState(false);

  const {
    title,
    overview,
    highlights,
    inclusions = [],
    exclusions = [],
    accommodation = {},
    videoSection = {},
    mapSection = {},
    reviews = [],
    recommendedTours = [],
  } = tourData;

  return (
    <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", minHeight: "100vh", paddingBottom: 72, color: COLOR.textPrimary }}>
      <HeroSection tourData={tourData} bookmarked={bookmarked} onBookmark={onBookmarkProp ?? (() => setLocalBookmarked((b) => !b))} onCustomize={() => setShowCustomize(true)} isAuthenticated={isAuthenticated} />
      <OverviewSection overview={overview} />
      <HighlightsSection highlights={highlights} />
      <ItinerarySection itinerary={itinerary} tourTitle={title} />
      <InclusionsSection inclusions={inclusions} exclusions={exclusions} />
      <AccommodationSection accommodation={accommodation} />
      <VideoSection videoSection={videoSection} />
      <MapSection mapSection={mapSection} />
      <ReviewsSection reviews={reviews} />
      <RecommendedSection recommendedTours={recommendedTours} currentTitle={title} />
      <FixedCTABar onCustomize={() => setShowCustomize(true)}/>
      <CustomizeTourModal open={showCustomize} onClose={() => setShowCustomize(false)} tourTitle={title} />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA-FETCHING WRAPPER (default export — used by router)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function TourDetail() {
  const { id } = useParams<{ id: string }>();
  const { isSaved, toggleSave } = useSavedTours();
  const [apiTourData, setApiTourData] = useState<any>(null);
  const [apiItinerary, setApiItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const [apiTour, apiDetails, apiItin, apiRec] = await Promise.allSettled([
          toursService.getTour(id),
          toursService.getDetails(id),
          toursService.getItinerary(id),
          homeService.recommended(),
        ]);

        const tourData = apiTour.status === 'fulfilled' ? apiTour.value : null;
        if (!tourData) { setFetchError('Tour not found'); return; }

        const details: TourDetails | null = apiDetails.status === 'fulfilled' ? apiDetails.value : null;
        const itinDays: ItineraryDay[] = apiItin.status === 'fulfilled' ? apiItin.value : [];
        const recTours: HomeTour[] = apiRec.status === 'fulfilled' ? apiRec.value : [];

        const mapped: any = {
          title: tourData.title,
          tags: tourData.types,
          location: tourData.region,
          duration: `${tourData.durationNights}N / ${tourData.durationDays}D`,
          difficulty: 'Moderate',
          bestSeason: tourData.season,
          heroImage: tourData.photoUrl,
          overview: details?.overview ?? tour.overview,
          highlights: details?.highlights ?? tour.highlights,
          inclusions: details?.inclusions ?? tour.inclusions,
          exclusions: details?.exclusions ?? tour.exclusions,
          accommodation: {
            title: 'Accommodation',
            description: details?.accommodationDescription ?? tour.accommodation.description,
            image: details?.accommodationMediaUrl ?? tour.accommodation.image,
          },
          videoSection: {
            title: details?.featureTitle ?? 'Feature',
            description: details?.featureDescription ?? tour.videoSection.description,
            videoUrl: details?.featureMediaUrl ?? tour.videoSection.videoUrl,
          },
          mapSection: {
            title: 'Route & Region Map',
            description: details?.routeDescription ?? tour.mapSection.description,
            googleMapsEmbedUrl: details?.routePhotoUrl ?? tour.mapSection.googleMapsEmbedUrl,
            centerLat: tour.mapSection.centerLat,
            centerLng: tour.mapSection.centerLng,
          },
          reviews: tour.reviews,
          recommendedTours: recTours
            .filter((t) => t.id !== id)
            .slice(0, 3)
            .map((t) => ({
              id: t.id,
              title: t.title,
              location: t.region,
              tags: t.types,
              duration: `${t.durationNights}N / ${t.durationDays}D`,
              image: t.photoUrl,
            })),
        };

        const mappedItin =
          itinDays.length > 0
            ? groupItineraryDays(
                itinDays.map((d) => ({
                  day: d.dayNumber,
                  title: d.imageTitle ?? `Day ${d.dayNumber}`,
                  description: d.description,
                  image: d.imageUrl || null
                }))
              )
            : defaultItinerary;

        setApiTourData(mapped);
        setApiItinerary(mappedItin);
      } catch (err) {
        console.error(err);
        setFetchError('Failed to load tour');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  if (!id) return (
    <div className="flex-grow pt-[72px] min-h-screen bg-[#F7F6F2] flex items-center justify-center">
      <p className="text-gray-500 text-sm">Invalid tour.</p>
    </div>
  );

  if (loading) return (
    <div className="flex-grow pt-[72px] min-h-screen bg-[#F7F6F2] flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading tour…</p>
    </div>
  );

  if (fetchError || !apiTourData) return (
    <div className="flex-grow pt-[72px] min-h-screen bg-[#F7F6F2] flex items-center justify-center">
      <p className="text-red-500 text-sm">{fetchError ?? 'Tour not found.'}</p>
    </div>
  );

  return (
    <>
      <SEO
        title={apiTourData.title}
        description={apiTourData.overview
          ? `${String(apiTourData.overview).slice(0, MAX_META_DESCRIPTION_LENGTH)}…`
          : `Explore ${apiTourData.title} – a cultural heritage tour in ${apiTourData.location} with Heritage Himalaya Trails.`}
        image={apiTourData.heroImage || '/Heritage_walk.jpeg'}
      />
      <TourPageUI
        tourData={apiTourData}
        itinerary={apiItinerary ?? defaultItinerary}
        bookmarked={id ? isSaved(id) : false}
        onBookmark={id ? () => void toggleSave(id) : undefined}
      />
    </>
  );
}