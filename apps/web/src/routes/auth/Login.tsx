import { GalleryVerticalEnd } from "lucide-react"
import LoginForm from '@/components/auth/LoginForm'
import vintusureLogo from '../../assets/vintusure-logo.jpeg'

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={vintusureLogo}
          alt="VintuSure Logo"
          className="h-full w-full object-cover"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2">
                                    <a href="#" className="flex items-center gap-2 font-medium text-white">
                            <div className="bg-primary text-primary-foreground flex size-6 sm:size-8 items-center justify-center rounded-lg shadow-lg">
                                <GalleryVerticalEnd className="size-4 sm:size-5" />
                            </div>
                            <span className="text-lg sm:text-xl font-semibold">VintuSure</span>
                        </a>
          </div>
          
          {/* Optional: Add navigation links here */}
                              <div className="hidden md:flex items-center gap-4">
                        <a href="/signup" className="text-white/80">
                            Don't have an account?
                        </a>
                    </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-sm sm:max-w-md">
            <LoginForm />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 md:p-8 text-center">
          <p className="text-white/60 text-xs sm:text-sm">
            © 2024 VintuSure. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
} 