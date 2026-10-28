import React from "react";
import { Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck } from "lucide-react";
import { PublicEnquiryForm } from "@/components/public-site/PublicEnquiryForm";
import { getWhatsAppClickToChatUrl } from "@/lib/whatsapp-service";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Contact Us & Request a Quote | MSB PHARMACHEM",
  description:
    "Get in touch with MSB PHARMACHEM in Kukatpally, Hyderabad. Call +91 8008335333 or email mohank9@gmail.com for commercial API quotations, COAs, and raw material sourcing.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const categories = await prisma.productCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#00488F] uppercase tracking-wider">
            Commercial Communications
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact MSB PHARMACHEM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Connect with our sales and sourcing desk in Kukatpally, Hyderabad. We provide fast technical specifications, COA documents, and competitive quotes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Contact Info & WhatsApp */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Corporate Headquarters
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#00488F] shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered Address</span>
                    <span className="text-slate-800 font-medium leading-relaxed block mt-0.5">
                      Plot No. 128, Kamala Prasanna Nagar, Allwyn Colony, Kukatpally, Hyderabad – 500072, Telangana, India
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Direct Telephone</span>
                    <a
                      href="tel:+918008335333"
                      className="text-slate-900 font-bold hover:text-emerald-600 transition-colors block mt-0.5 text-sm"
                    >
                      +91 8008335333
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-700 shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Official Commercial Email</span>
                    <a
                      href="mailto:mohank9@gmail.com"
                      className="text-slate-900 font-bold hover:text-blue-600 transition-colors block mt-0.5"
                    >
                      mohank9@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Business Hours</span>
                    <span className="text-slate-800 font-medium block mt-0.5">
                      Monday – Saturday: 9:30 AM – 6:30 PM IST
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Card */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Instant WhatsApp Communication</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Need an urgent price quotation or batch COA? Send a direct message to our sales manager on WhatsApp.
                </p>
                <a
                  href={getWhatsAppClickToChatUrl({})}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-2 px-4 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Start WhatsApp Chat Now
                </a>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1F33] text-white space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Quality & Compliance Assurance</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                All enquiries are treated with commercial confidentiality. Materials are accompanied by verified manufacturer test reports and regulatory documents upon order confirmation.
              </p>
            </div>
          </div>

          {/* Right: Interactive Commercial RFQ Form Template Card */}
          <div className="lg:col-span-7">
            <PublicEnquiryForm categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
}
