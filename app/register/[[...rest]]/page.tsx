import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-4 gap-6">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white">⚡ TechZone</h1>
      <p className="text-blue-100 text-sm mt-2">Cele mai bune electronice la prețuri imbatabile</p>
    </div>
    <SignUp
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#ffffff",
          colorText: "#1f2937",
          borderRadius: "0.75rem",
          fontFamily: "inherit",
        },
        elements: {
          card: "shadow-2xl border-0 rounded-2xl",
          headerTitle: "text-gray-800 font-bold",
          headerSubtitle: "text-gray-500",
          formButtonPrimary: "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl border-0",
          formFieldInput: "rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-300 text-gray-900",
          footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
          dividerLine: "bg-gray-200",
          dividerText: "text-gray-400",
          socialButtonsBlockButton: "rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 font-medium",
        },
      }}
    />
  </div>
);
}