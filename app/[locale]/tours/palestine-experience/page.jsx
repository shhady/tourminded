import PalestineExperience from "./PalestineExperience";

const title = "The Palestine Experience — 7 Days, 7 Nights";
const description =
  "A Monday-to-Monday route through Jerusalem, Bethlehem, Nablus, Ramallah, Hebron, and Beit Ummar — led by Palestinian guides, with nights in family homes.";

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

const jsonLd = {
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
      "Nablus",
      "Ramallah",
      "Hebron",
      "Beit Ummar",
      "South Hebron Hills",
    ].map((place, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "TouristDestination", name: place },
    })),
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PalestineExperience />
    </>
  );
}
