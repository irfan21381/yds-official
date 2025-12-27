import React, { useState } from "react";
import useReveal from "../../hooks/useReveal";
import { submitContactForm } from "@/api/contact";
import { toast } from "sonner";

export default function Contact() {
  const left = useReveal("animate-slide-left");
  const right = useReveal("animate-slide-right");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      await submitContactForm(formData);
      toast.success("Your message has been sent successfully!");
      setFormData({ name: "", email: "", message: "" }); // Clear form
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-start">
        <div ref={left as any}>
          <h3 className="text-2xl font-bold text-slate-900">Contact Us</h3>
          <p className="mt-3 text-slate-600">Reach out for partnerships, internships, or product demos.</p>

          <div className="mt-6 space-y-2 text-slate-700">
            <div>📍 Andhra Pradesh, India</div>
            <div>📞 +91 90593 11467</div>
            <div>✉️ info.yds@zohomail.in</div>
          </div>
        </div>

        <form ref={right as any} className="bg-gray-50 p-6 rounded-xl shadow space-y-3" onSubmit={handleSubmit}>
          <input className="w-full border p-3 rounded" placeholder="Your name" name="name" value={formData.name} onChange={handleChange} disabled={isSubmitting} />
          <input className="w-full border p-3 rounded" placeholder="Email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isSubmitting} />
          <textarea className="w-full border p-3 rounded h-28" placeholder="Message" name="message" value={formData.message} onChange={handleChange} disabled={isSubmitting} />
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-md" disabled={isSubmitting}>Send Message</button>
          </div>
        </form>
      </div>
    </section>
  );
}
