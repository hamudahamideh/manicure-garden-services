import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactLenis } from "lenis/react";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import Marquee from "@/components/site/Marquee";
import Services from "@/components/site/Services";
import Manifesto from "@/components/site/Manifesto";
import Gallery from "@/components/site/Gallery";
import BeforeAfter from "@/components/site/BeforeAfter";
import Testimonials from "@/components/site/Testimonials";
import EstimateForm from "@/components/site/EstimateForm";
import Footer from "@/components/site/Footer";
import AdminInbox from "@/pages/AdminInbox";
import { Toaster } from "@/components/ui/sonner";

const Landing = () => (
  <ReactLenis root options={{ lerp: 0.08, smoothWheel: true }}>
    <div className="App grain min-h-screen bg-[#0A0D0B] text-white overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Manifesto />
        <Gallery />
        <BeforeAfter />
        <Testimonials />
        <EstimateForm />
      </main>
      <Footer />
      <Toaster position="top-center" theme="dark" richColors />
    </div>
  </ReactLenis>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<AdminInbox />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
