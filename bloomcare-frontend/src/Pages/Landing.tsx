import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  FaPills, 
  FaHospital, 
  FaStar, 
  FaTruck, 
  FaShieldAlt, 
  FaCreditCard,
  FaArrowRight,
  FaPrescription,
  FaUserMd,
  FaSearch,
  FaShoppingCart,
  FaStore,
  FaUsers,
  FaAward,
  FaRocket,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHeart
} from 'react-icons/fa';
import { Button } from '../components/common/Button';

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#22c55e] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#22c55e] rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#22c55e]/10 px-4 py-2 rounded-xl text-sm mb-6">
                <FaAward className="w-4 h-4 text-[#22c55e]" />
                <span className="text-[#22c55e] font-medium font-outfit">Trusted Healthcare Platform</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 font-outfit text-black">
                Your Health, <br />
                <span className="text-[#22c55e]">Our Priority</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg font-outfit">
                Order medicines online, find nearby pharmacies, and manage your health with ease. 
                BloomCare connects you with trusted pharmacies at your fingertips.
              </p>
              <div className="flex flex-wrap gap-4">
                {/* Show different CTA based on authentication status */}
                {!isAuthenticated ? (
                  <Link to="/register">
                    <Button 
                      size="lg" 
                      className="bg-[#22c55e] text-white hover:bg-[#16a34a] font-semibold"
                      icon={<FaArrowRight className="w-4 h-4" />}
                      iconPosition="right"
                    >
                      Get Started
                    </Button>
                  </Link>
                ) : (
                  <Link to="/pharmacies">
                    <Button 
                      size="lg" 
                      className="bg-[#22c55e] text-white hover:bg-[#16a34a] font-semibold"
                      icon={<FaArrowRight className="w-4 h-4" />}
                      iconPosition="right"
                    >
                      Find Pharmacies
                    </Button>
                  </Link>
                )}
                <Link to="/pharmacies">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/5"
                  >
                    Browse Pharmacies
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-gray-600 font-outfit">
                <div className="flex items-center gap-2">
                  <FaStore className="w-4 h-4 text-[#22c55e]" />
                  <span>500+ Pharmacies</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPills className="w-4 h-4 text-[#22c55e]" />
                  <span>10K+ Medicines</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaStar className="w-4 h-4 text-[#22c55e]" />
                  <span>4.8 Rating</span>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="relative">
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:border-[#22c55e]/30 transition-all duration-300">
                    <FaPrescription className="w-8 h-8 text-[#22c55e] mx-auto mb-3" />
                    <p className="text-sm font-medium font-outfit text-black">Order Medicines</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:border-[#22c55e]/30 transition-all duration-300">
                    <FaHospital className="w-8 h-8 text-[#22c55e] mx-auto mb-3" />
                    <p className="text-sm font-medium font-outfit text-black">Find Pharmacy</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:border-[#22c55e]/30 transition-all duration-300">
                    <FaUserMd className="w-8 h-8 text-[#22c55e] mx-auto mb-3" />
                    <p className="text-sm font-medium font-outfit text-black">Health Advice</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:border-[#22c55e]/30 transition-all duration-300">
                    <FaTruck className="w-8 h-8 text-[#22c55e] mx-auto mb-3" />
                    <p className="text-sm font-medium font-outfit text-black">Fast Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 font-outfit">
              Why Choose <span className="text-[#22c55e]">BloomCare</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-outfit">
              We make healthcare accessible, affordable, and convenient for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<FaPills className="w-8 h-8" />}
              title="Wide Selection"
              description="Access thousands of medicines from verified pharmacies"
            />
            <FeatureCard 
              icon={<FaTruck className="w-8 h-8" />}
              title="Fast Delivery"
              description="Get your medicines delivered to your doorstep quickly"
            />
            <FeatureCard 
              icon={<FaShieldAlt className="w-8 h-8" />}
              title="100% Authentic"
              description="All medicines are sourced from licensed pharmacies"
            />
            <FeatureCard 
              icon={<FaCreditCard className="w-8 h-8" />}
              title="Secure Payment"
              description="Multiple payment options with bank-grade security"
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS SECTION */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 font-outfit">
              How It <span className="text-[#22c55e]">Works</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-outfit">
              Getting your medicines has never been easier
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              number="1"
              icon={<FaSearch className="w-8 h-8" />}
              title="Search"
              description="Find the medicines you need from our extensive catalog"
            />
            <StepCard 
              number="2"
              icon={<FaShoppingCart className="w-8 h-8" />}
              title="Order"
              description="Add to cart and check out with your preferred payment method"
            />
            <StepCard 
              number="3"
              icon={<FaTruck className="w-8 h-8" />}
              title="Deliver"
              description="Get your medicines delivered safely to your doorstep"
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STATS SECTION */}
      {/* ============================================================ */}
      <section className="py-16 bg-[#22c55e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem number="500+" label="Pharmacies" icon={<FaStore className="w-5 h-5" />} />
            <StatItem number="10K+" label="Medicines" icon={<FaPills className="w-5 h-5" />} />
            <StatItem number="50K+" label="Customers" icon={<FaUsers className="w-5 h-5" />} />
            <StatItem number="4.8" label="Average Rating" icon={<FaStar className="w-5 h-5" />} />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TESTIMONIALS SECTION */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 font-outfit">
              What Our <span className="text-[#22c55e]">Customers Say</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-outfit">
              Real stories from real people who trust BloomCare
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard 
              name="Sarah Johnson"
              role="Customer"
              text="BloomCare has been a lifesaver for my family. Quick delivery and genuine medicines every time."
            />
            <TestimonialCard 
              name="Dr. Michael Chen"
              role="Pharmacist"
              text="As a pharmacist, I appreciate the platform's commitment to quality and patient safety."
            />
            <TestimonialCard 
              name="Emily Davis"
              role="Customer"
              text="The app is so easy to use! I can order my prescriptions in seconds and track delivery."
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA SECTION */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-[#d1f843]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 flex items-center justify-center gap-3 font-outfit">
            <FaRocket className="w-8 h-8" />
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-black/80 text-lg mb-8 max-w-2xl mx-auto font-outfit">
            Join thousands of satisfied customers and start ordering your medicines today.
          </p>
          <Link to={isAuthenticated ? '/pharmacies' : '/register'}>
            <Button 
              size="lg" 
              className="bg-black text-white hover:bg-gray-800 text-lg px-8"
              icon={<FaArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              {isAuthenticated ? 'Browse Pharmacies' : 'Get Started Now'}
            </Button>
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <Footer />
    </div>
  );
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-[#22c55e]/30 transition-all duration-300 group">
      <div className="w-14 h-14 rounded-xl bg-[#22c55e]/10 flex items-center justify-center mb-4 text-[#22c55e] group-hover:bg-[#22c55e] group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-black mb-2 font-outfit">{title}</h3>
      <p className="text-gray-600 text-sm font-outfit">{description}</p>
    </div>
  );
};

interface StepCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, icon, title, description }) => {
  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-lg transition-all duration-300">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#22c55e] rounded-full flex items-center justify-center text-white font-bold text-sm font-outfit">
        {number}
      </div>
      <div className="w-16 h-16 rounded-xl bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-4 text-[#22c55e]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-black mb-2 font-outfit">{title}</h3>
      <p className="text-gray-600 text-sm font-outfit">{description}</p>
    </div>
  );
};

interface StatItemProps {
  number: string;
  label: string;
  icon?: React.ReactNode;
}

const StatItem: React.FC<StatItemProps> = ({ number, label, icon }) => {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-2 font-outfit">
        {icon && <span>{icon}</span>}
        {number}
      </div>
      <div className="text-white/80 text-sm mt-1 font-outfit">
        {label}
      </div>
    </div>
  );
};

interface TestimonialCardProps {
  name: string;
  role: string;
  text: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, text }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className="w-4 h-4 text-[#22c55e]" />
        ))}
      </div>
      <p className="text-gray-700 text-sm mb-4 italic font-outfit">"{text}"</p>
      <div>
        <p className="font-semibold text-black font-outfit">{name}</p>
        <p className="text-xs text-gray-500 font-outfit">{role}</p>
      </div>
    </div>
  );
};

// ============================================================
// FOOTER COMPONENT
// ============================================================

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold mb-4 font-outfit">
              Bloom<span className="text-[#22c55e]">Care</span>
            </h3>
            <p className="text-sm text-gray-400 mb-4 font-outfit">
              Making healthcare accessible, affordable, and convenient for everyone.
            </p>
            <div className="flex gap-3">
              <SocialIcon href="#" icon={<FaFacebookF />} label="Facebook" />
              <SocialIcon href="#" icon={<FaTwitter />} label="Twitter" />
              <SocialIcon href="#" icon={<FaInstagram />} label="Instagram" />
              <SocialIcon href="#" icon={<FaLinkedinIn />} label="LinkedIn" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-outfit">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink to="/pharmacies">Pharmacies</FooterLink>
              <FooterLink to="/medicines">Medicines</FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-outfit">Support</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
              <FooterLink to="/shipping">Shipping Info</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-outfit">Get In Touch</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <FaEnvelope className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>support@bloomcare.com</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <FaMapMarkerAlt className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>123 Health St, Medical City</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p className="font-outfit flex items-center gap-1">
            &copy; {currentYear} BloomCare. All rights reserved.
            <FaHeart className="w-3 h-3 text-[#22c55e] ml-1" />
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-white transition-colors cursor-pointer font-outfit">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer font-outfit">Terms of Service</span>
            <span className="hover:text-white transition-colors cursor-pointer font-outfit">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ href, icon, label }) => {
  return (
    <a 
      href={href} 
      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#22c55e] hover:text-white flex items-center justify-center transition-all duration-200 text-gray-400"
      aria-label={label}
    >
      {icon}
    </a>
  );
};

interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, children }) => {
  return (
    <li>
      <Link to={to} className="text-gray-400 hover:text-[#22c55e] transition-colors font-outfit">
        {children}
      </Link>
    </li>
  );
};