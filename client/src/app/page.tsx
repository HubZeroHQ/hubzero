import ComingSoon from '@/components/ComingSoon';

export const metadata = {
  title: "HubZero | Launching Soon",
  description: "HubZero is rebuilding from the ground up. HubZero v2 is in active development — launching soon.",
  openGraph: {
    title: "HubZero | Launching Soon",
    description: "HubZero is rebuilding from the ground up. HubZero v2 is in active development — launching soon.",
    url: "https://hubzero.in/",
    siteName: "HubZero",
    images: [
      {
        url: "/og-image.png", // Put your OG image in the public folder
        width: 512,
        height: 512,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HubZero | Launching Soon",
    description: "HubZero is rebuilding from the ground up. HubZero v2 is in active development — launching soon.",
    images: ["/og-image.png"],
  },
};


export default function HomePage() {
  return <ComingSoon />;
}
