import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Building, ArrowRight } from "lucide-react";

export default function Register() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    
    // Store user data in localStorage for the assessment session
    localStorage.setItem("trafy_candidate", JSON.stringify(formData));
    
    // In a real app, you would create the candidate in Supabase here
    
    // Navigate to the assessment
    navigate(`/assess/${assessmentId}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
      >
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold text-white">Before we begin</h2>
          <p className="mt-2 text-sm text-white/60">
            Please enter your details to start the assessment. Your score will be emailed to you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/70">Full Name *</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
                <User size={16} />
              </div>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-green-hard focus:outline-none focus:ring-1 focus:ring-green-hard"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/70">Email Address *</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
                <Mail size={16} />
              </div>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-green-hard focus:outline-none focus:ring-1 focus:ring-green-hard"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/70">Phone Number (Optional)</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
                <Phone size={16} />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-green-hard focus:outline-none focus:ring-1 focus:ring-green-hard"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/70">College / Organization (Optional)</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
                <Building size={16} />
              </div>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-green-hard focus:outline-none focus:ring-1 focus:ring-green-hard"
                placeholder="University or Company Name"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button 
              type="submit" 
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-hard py-3 text-sm font-semibold text-white transition-colors hover:brightness-110"
            >
              Continue to Assessment
              <ArrowRight size={16} />
            </button>
            <Link to="/" className="text-center text-xs font-medium text-white/50 hover:text-white">
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
