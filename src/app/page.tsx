"use client"

import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Home() {
  const { user } = useAuthContext();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/vinture.jpeg"
          alt="VintuSure Car Background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 lg:p-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#bb877a] rounded-full"></div>
          <span className="text-[#bb877a] font-bold text-xl lg:text-2xl">
            VintuSure
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {!user ? (
            <>
              <Link
                href="/auth/signin"
                className="text-[#bb877a] hover:text-white transition-colors duration-200 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-[#bb877a] text-white px-6 py-2 rounded-lg hover:bg-[#a67669] transition-colors duration-200 font-medium"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="bg-[#bb877a] text-white px-6 py-2 rounded-lg hover:bg-[#a67669] transition-colors duration-200 font-medium"
            >
              Dashboard
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-[#bb877a] mb-6 leading-tight">
            Modern Insurance
            <br />
            <span className="text-white">Management</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-[#bb877a] mb-8 max-w-2xl mx-auto leading-relaxed">
            Streamline your motor third party insurance operations with our comprehensive 
            management system. Built for Zambia, powered by modern technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!user ? (
              <>
                <Link
                  href="/auth/signup"
                  className="bg-[#bb877a] text-white px-8 py-4 rounded-lg hover:bg-[#a67669] transition-colors duration-200 font-semibold text-lg w-full sm:w-auto text-center"
                >
                  Get Started
                </Link>
                <Link
                  href="/auth/signin"
                  className="border-2 border-[#bb877a] text-[#bb877a] px-8 py-4 rounded-lg hover:bg-[#bb877a] hover:text-white transition-colors duration-200 font-semibold text-lg w-full sm:w-auto text-center"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="bg-[#bb877a] text-white px-8 py-4 rounded-lg hover:bg-[#a67669] transition-colors duration-200 font-semibold text-lg w-full sm:w-auto text-center"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 py-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#bb877a] text-center mb-12">
            Why Choose VintuSure?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#bb877a] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#bb877a] mb-2">Secure & Reliable</h3>
              <p className="text-[#bb877a] opacity-90">
                Built with Firebase security and enterprise-grade reliability
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#bb877a] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#bb877a] mb-2">Lightning Fast</h3>
              <p className="text-[#bb877a] opacity-90">
                Optimized performance with real-time updates and instant access
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#bb877a] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#bb877a] mb-2">AI-Powered</h3>
              <p className="text-[#bb877a] opacity-90">
                Intelligent features with Vertex AI integration for smart insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 lg:px-8 border-t border-[#bb877a]/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#bb877a] opacity-80">
            © 2024 VintuSure. All rights reserved. Built for Zambia's insurance industry.
          </p>
        </div>
      </footer>
    </div>
  );
}
