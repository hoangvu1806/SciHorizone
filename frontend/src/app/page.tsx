import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo_sci.png" alt="SCI Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Paper2Exam</span>
          </div>
          
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-secondary-600 hover:text-primary-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-secondary-600 hover:text-primary-600 transition-colors">How it works</a>
            <a href="#about" className="text-secondary-600 hover:text-primary-600 transition-colors">About</a>
          </nav>
          
          <div>
            <Link href="/create" className="btn btn-primary btn-md">
              Create Exam
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-secondary-900 fade-in">
              Transform Scientific Papers into IELTS/TOEIC Exams
            </h1>
            <p className="text-xl text-secondary-600 mb-10 fade-in">
              Convert academic papers into professional reading comprehension exams with AI-powered technology. 
              Perfect for educators, language trainers, and test prep professionals.
            </p>
            <Link href="/create" className="btn btn-primary btn-lg scale-in">
              Create Your Exam Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 text-secondary-900">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-secondary-900">PDF to Exam Conversion</h3>
              <p className="text-secondary-600">
                Upload any scientific paper in PDF format and convert it into a professional reading comprehension exam.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="card p-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-secondary-900">Multiple Formats</h3>
              <p className="text-secondary-600">
                Choose between IELTS and TOEIC exam formats with customizable difficulty levels.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="card p-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-secondary-900">Export Options</h3>
              <p className="text-secondary-600">
                Download your generated exams as PDF documents or JSON files for further customization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 text-secondary-900">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-5 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3 text-secondary-900">Upload PDF</h3>
              <p className="text-secondary-600">
                Upload your scientific paper in PDF format or provide a URL.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-5 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3 text-secondary-900">Configure Options</h3>
              <p className="text-secondary-600">
                Select exam type, difficulty level, and other customization options.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-5 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3 text-secondary-900">Generate & Download</h3>
              <p className="text-secondary-600">
                Our AI creates the exam and you can download it in your preferred format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to create your exam?</h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Start converting your scientific papers into professional exams today.
          </p>
          <Link href="/create" className="btn bg-white text-primary-600 hover:bg-primary-50 focus-visible:ring-white btn-lg">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo_sci.png" alt="SCI Logo" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-700 bg-clip-text text-transparent">Paper2Exam</span>
              </div>
              <p className="text-secondary-400 max-w-md">
                Converting scientific papers into professional reading comprehension exams with AI technology.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-secondary-400 hover:text-white transition-colors">Home</a></li>
                  <li><a href="#features" className="text-secondary-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="text-secondary-400 hover:text-white transition-colors">How it works</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <ul className="space-y-2">
                  <li className="text-secondary-400">info@paper2exam.com</li>
                  <li className="text-secondary-400">+1 (555) 123-4567</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-secondary-800 mt-8 pt-8 text-center text-secondary-400">
            <p>&copy; {new Date().getFullYear()} Paper2Exam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
