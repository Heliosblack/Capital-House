import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import FeaturedListings from "@/components/home/FeaturedListings";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedListings />
      </main>
      <Footer />
    </>
  );
}
