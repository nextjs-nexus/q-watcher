"use client";

import { PASSWORD_MIN_LENGTH, PASSWORD_REQUIREMENTS } from "@/lib/password-policy";

import { useActionState } from "react";
import { signUpAction } from "@/actions/auth";

export default function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, { error: null });
  return (
          <form action={formAction} className="flex flex-col space-y-6">
            {state.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#A0B3A8] mb-2">
                Name
              </label>            
              <input 
                type="text" 
                id="name"
                name="name" 
                placeholder="Name" 
                className="w-full px-4 py-3 bg-[#050807] border border-[#B6FF3C]/20 rounded-lg text-white placeholder-[#6B7F75] focus:outline-none focus:ring-2 focus:ring-[#B6FF3C] focus:border-transparent transition" 
                required 
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#A0B3A8] mb-2">
                Email
              </label>  
              <input 
                type="email" 
                id="email"
                name="email" 
                placeholder="your@email.com" 
                className="w-full px-4 py-3 bg-[#050807] border border-[#B6FF3C]/20 rounded-lg text-white placeholder-[#6B7F75] focus:outline-none focus:ring-2 focus:ring-[#B6FF3C] focus:border-transparent transition"
                required 
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#A0B3A8] mb-2">
                Password
              </label>   
              <input
                type="password"
                id="password"
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={128}
                autoComplete="new-password"
                aria-describedby="password-requirements"
                name="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-[#050807] border border-[#B6FF3C]/20 rounded-lg text-white placeholder-[#6B7F75] focus:outline-none focus:ring-2 focus:ring-[#B6FF3C] focus:border-transparent transition"
                required
              />
            </div>
            <p id="password-requirements" className="text-sm text-[#A0B3A8]">
              {PASSWORD_REQUIREMENTS}
            </p>
            <button 
              type="submit" 
              disabled={pending}
              className="w-full py-3 px-4 bg-[#B6FF3C] hover:bg-[#B6FF3C]/80 text-[#050807] font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
            >
                {pending ? "Signing up..." : "Sign Up"}
            </button>
          </form>
  );
}
