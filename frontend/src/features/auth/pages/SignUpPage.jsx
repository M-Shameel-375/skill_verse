import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { FaGraduationCap, FaRocket, FaUsers, FaStar, FaCheckCircle } from "react-icons/fa";

const SignUpPage = () => (
  <div className="min-h-screen flex">
    {/* Left Side - Branding */}
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-12 flex-col justify-between">
      <div>
        <Link to="/" className="flex items-center gap-3 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <FaGraduationCap className="text-2xl" />
          </div>
          <span className="text-2xl font-bold">SkillVerse</span>
        </Link>
      </div>

      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-white leading-tight">
          Start Your Learning<br />
          Journey Today
        </h1>
        <p className="text-purple-100 text-lg">
          Join thousands of learners and educators on SkillVerse.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FaCheckCircle className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Free to Get Started</h3>
              <p className="text-purple-200 text-sm">Access free courses and community features</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FaStar className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Learn from Experts</h3>
              <p className="text-purple-200 text-sm">Quality courses from industry professionals</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FaUsers className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Skill Exchange</h3>
              <p className="text-purple-200 text-sm">Trade skills with peers in the community</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FaRocket className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Become an Instructor</h3>
              <p className="text-purple-200 text-sm">Share knowledge and earn money</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-purple-200 text-sm">
        © 2025 SkillVerse. All rights reserved.
      </div>
    </div>

    {/* Right Side - Sign Up Form */}
    <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <FaGraduationCap className="text-2xl text-white" />
            </div>
            <span className="text-2xl font-bold">SkillVerse</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sign up with your email or social account
          </p>
        </div>

        {/* Clerk Sign Up Component */}
        <SignUp 
          path="/sign-up" 
          routing="path" 
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none bg-transparent",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
              socialButtonsBlockButtonText: "text-gray-700 dark:text-gray-300 font-medium",
              dividerLine: "bg-gray-300 dark:bg-gray-600",
              dividerText: "text-gray-500 dark:text-gray-400",
              formFieldLabel: "text-gray-700 dark:text-gray-300",
              formFieldInput: "border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white",
              formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
              footerActionLink: "text-purple-600 hover:text-purple-700 dark:text-purple-400",
              identityPreviewText: "text-gray-700 dark:text-gray-300",
              identityPreviewEditButton: "text-purple-600 dark:text-purple-400",
            },
          }}
        />

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/sign-in" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          By signing up, you agree to our{" "}
          <Link to="/terms" className="text-purple-600 hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link to="/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  </div>
);

export default SignUpPage;
