'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import ProblemSection from '@/components/landing/ProblemSection'
import SolutionSection from '@/components/landing/SolutionSection'
import FlowSection from '@/components/landing/FlowSection'
import ValuePropositionSection from '@/components/landing/ValuePropositionSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const detail = params.get('detail')
    if (error) {
      setAuthError(detail ? `登录失败：${detail}` : `登录失败（${error}）`)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {authError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-4 text-sm shadow-md flex items-start gap-3">
            <span className="mt-0.5 shrink-0">⚠️</span>
            <span className="break-all">{authError}</span>
            <button onClick={() => setAuthError(null)} className="ml-auto shrink-0 text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        </div>
      )}

      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <FlowSection />
        <ValuePropositionSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}
