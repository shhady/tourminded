import PalestineExperience from "./PalestineExperience";

const title = "The Palestine Experience — 7 Days, 7 Nights";
const description =
  "A Palestinian-led, Monday-to-Monday journey through Jerusalem, Bethlehem, Hebron, Nablus, Ramallah, and Jericho — ending with three nights in a family home in Beit Ummar.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/en/tours/palestine-experience",
  },
  openGraph: {
    title,
    description,
    type: "website",
    images: [
      {
        url: "/frames/palestine/frame-260.jpg",
        width: 1280,
        height: 720,
        alt: "Travelers at an overlook facing the Separation Wall at sunset",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/frames/palestine/frame-260.jpg"],
  },
};

const tripJsonLd = {
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  name: "The Palestine Experience — 7 Day / 7 Night Tour",
  description,
  touristType: "Cultural and community travel",
  provider: {
    "@type": "TravelAgency",
    name: "Watermelon Tours",
    url: "https://watermelontours.com",
  },
  itinerary: {
    "@type": "ItemList",
    itemListElement: [
      "Jerusalem",
      "Bethlehem",
      "Hebron",
      "Nablus",
      "Ramallah",
      "Jericho",
      "Beit Ummar",
      "South Hebron Hills",
    ].map((place, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "TouristDestination", name: place },
    })),
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      question: "Is it safe to travel to Jerusalem and the West Bank?",
      answer:
        "Yes. Major destinations like Jerusalem, Bethlehem, Ramallah, Jericho, and Hebron welcome travelers every day. Our guides live here and follow real-time updates, choosing the safest routes and adjusting plans if needed. If anything changes on the ground, you'll be informed immediately.",
    },
    {
      question: "Can I customize my tour?",
      answer:
        "Yes, every tour can be tailored to your interests. Whether you want more history, more food, more politics, or a more spiritual experience, your guide will adjust the itinerary to match your style.",
    },
    {
      question: "Where does my money go?",
      answer:
        "This journey is designed to support Palestinian people directly. Your payment supports Palestinian guides, drivers, host families, community organizations, local businesses, craftspeople, and the people welcoming you into their homes and villages.",
    },
    {
      question: "What should I wear?",
      answer:
        "Several parts of the journey take place in conservative Palestinian communities and at religious sites. Both men and women should wear modest clothing that covers the chest, shoulders, upper arms, and knees. Long trousers, long skirts, and dresses below the knee are appropriate. Shorts should not be worn during the guided program.",
    },
    {
      question: "Are meals included?",
      answer:
        "Home-cooked meals with your host families are an important part of the experience. Other included meals will be listed clearly in your booking information. Please tell us in advance about allergies, dietary restrictions, or religious requirements.",
    },
  ].map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tripJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PalestineExperience />
    </>
  );
}
