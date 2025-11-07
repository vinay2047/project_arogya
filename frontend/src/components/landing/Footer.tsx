"use client";
import { contactInfo, footerSections, socials } from "@/lib/constant";
import { Stethoscope } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

const Footer = () => {
  return (
    <footer className="bg-teal-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Brand section */}
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to text-teal-50 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent">
                  Jivika
                </div>
              </div>

              <p className="text-blue-100 mb-6 text-lg leading-relaxed">
                Your trusted healthcare partner providing quality medical
                consultations with certified doctors online, anytime, anywhere.
              </p>

              <div className="space-y-3 mb-6">
                {contactInfo.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-blue-100"
                  >
                    <item.icon className="w-4 h-4 text-teal-300" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Links section */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerSections.map((section, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-white mb-4 text-lg">
                      {section.title}
                    </h3>
                    <ul className="space-y-3">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a
                            href={link.href}
                            className="text-blue-200 hover:text-white transition-colors duration-200 text-sm hover:underline"
                          >
                            {link.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter section */}
        <div className="py-8 border-t border-teal-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-semibold text-white mb-2">Stay Updated</h4>
              <p className="text-blue-200 text-sm">
                Get health tips and product updates delivered to your inbox.
              </p>
            </div>

            <form
              className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for subscribing!");
              }}
            >
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-lg bg-teal-800 border border-teal-700 text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent min-w-[280px]"
              />
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-lg whitespace-nowrap"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div className="py-6 border-t border-teal-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="text-blue-200 text-sm">
              <p>&copy; 2025 Jivika Health, Inc. All rights reserved.</p>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-blue-200 text-sm">Follow us:</span>
              <div className="flex space-x-3">
                {socials.map(({ name, icon: Icon, url }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-teal-700/50 hover:bg-teal-800 rounded-full flex items-center justify-center transition-colors duration-200"
                    aria-label={`Follow us on ${name}`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
