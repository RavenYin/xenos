'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-50 border-t border-gray-200 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">X</span>
              </div>
              <span className="text-base font-semibold text-gray-900">Xenos</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs">
              让可信成为 Agent 网络的基础设施
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <h4 className="text-gray-900 font-medium mb-3 text-sm">产品</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#solution" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                    解决方案
                  </Link>
                </li>
                <li>
                  <Link href="/trust" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                    信任网络
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-medium mb-3 text-sm">资源</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://github.com/RavenYin/xenos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
                  >
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/RavenYin/xenos/blob/main/README.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
                  >
                    文档
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-xs">© 2026 Xenos</p>
        </div>
      </div>
    </footer>
  )
}
