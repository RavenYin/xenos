'use client'

import { useState } from 'react'
import Link from 'next/link'

interface NavbarProps {
  isMenuOpen: boolean
  setIsMenuOpen: (value: boolean) => void
}

export default function Navbar({ isMenuOpen, setIsMenuOpen }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">X</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Xenos</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#solution" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
              解决方案
            </Link>
            <Link href="#flow" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
              流程
            </Link>
            <Link href="#value" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
              价值
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/api/auth/login"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              进入 Xenos
            </Link>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100">
            <div className="flex flex-col space-y-2">
              <Link href="#solution" className="text-gray-500 hover:text-gray-900 transition-colors px-2 py-2 text-sm">
                解决方案
              </Link>
              <Link href="#flow" className="text-gray-500 hover:text-gray-900 transition-colors px-2 py-2 text-sm">
                流程
              </Link>
              <Link href="#value" className="text-gray-500 hover:text-gray-900 transition-colors px-2 py-2 text-sm">
                价值
              </Link>
              <Link
                href="/api/auth/login"
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium text-center hover:bg-gray-800 transition-colors mt-2"
              >
                进入 Xenos
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
