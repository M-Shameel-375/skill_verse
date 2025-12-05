import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { FaGraduationCap, FaUsers, FaCertificate, FaChartLine } from "react-icons/fa";

const SignInPage = () => (
  <div className="min-h-screen flex">
    {/* Left Side - Branding */}
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between">
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
          Welcome Back!<br />
          Continue Your Learning Journey
        </h1>
        <p className="text-blue-100 text-lg">
          Access your courses, track progress, and connect with the community.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <FaUsers className="text-white text-2xl mb-2" />
            <h3 className="text-white font-semibold">Peer Learning</h3>
            <p className="text-blue-200 text-sm">Exchange skills with others</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <FaCertificate className="text-white text-2xl mb-2" />
            <h3 className="text-white font-semibold">Certificates</h3>
            <p className="text-blue-200 text-sm">Earn verified credentials</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <FaChartLine className="text-white text-2xl mb-2" />
            <h3 className="text-white font-semibold">Track Progress</h3>
            <p className="text-blue-200 text-sm">Monitor your growth</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <FaGraduationCap className="text-white text-2xl mb-2" />
            <h3 className="text-white font-semibold">Expert Courses</h3>
            <p className="text-blue-200 text-sm">Learn from the best</p>
          </div>
        </div>
      </div>

      <div className="text-blue-200 text-sm">
        © 2025 SkillVerse. All rights reserved.
      </div>
    </div>

    {/* Right Side - Sign In Form */}
    <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <FaGraduationCap className="text-2xl text-white" />
            </div>
            <span className="text-2xl font-bold">SkillVerse</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Sign In
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Use your email or social account to sign in
          </p>
        </div>

        {/* Clerk Sign In Component */}
        <SignIn 
          path="/sign-in" 
          routing="path" 
          signUpUrl="/sign-up"
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
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              footerActionLink: "text-blue-600 hover:text-blue-700 dark:text-blue-400",
              identityPreviewText: "text-gray-700 dark:text-gray-300",
              identityPreviewEditButton: "text-blue-600 dark:text-blue-400",
            },
          }}
        />

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default SignInPage;
