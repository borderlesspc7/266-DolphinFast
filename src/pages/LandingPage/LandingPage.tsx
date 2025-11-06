import React from "react";
import { HeroSection } from "../../components/landing/HeroSection";
import { PartnersSection } from "../../components/landing/PartnersSection";
import { AnnouncementSection } from "../../components/landing/AnnouncementSection";
import { VideoPlayerSection } from "../../components/landing/VideoPlayerSection";
import { ContactForm } from "../../components/landing/ContactForm";
import { Footer } from "../../components/landing/Footer";
import "./LandingPage.css";

export const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <HeroSection />
      <PartnersSection />
      <AnnouncementSection />
      <VideoPlayerSection />
      <ContactForm />
      <Footer />
    </div>
  );
};

