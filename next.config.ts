import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // AI Provider Configuration
    AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
    
    // OpenAI Configuration
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_OPENAI_MODEL: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
    
    // Gemini Configuration
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXT_PUBLIC_GEMINI_MODEL: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-pro',
    
    // Common Configuration
    NEXT_PUBLIC_MAX_CHAT_HISTORY: process.env.NEXT_PUBLIC_MAX_CHAT_HISTORY || '50',
    NEXT_PUBLIC_AI_FALLBACK_ENABLED: process.env.NEXT_PUBLIC_AI_FALLBACK_ENABLED || 'true',
  },
  // Optimize for Vercel deployment
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'recharts']
  }
};

export default nextConfig;
