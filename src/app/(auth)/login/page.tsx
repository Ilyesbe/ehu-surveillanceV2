"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@/utils/cn"
import { Eye, EyeOff } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
  role: z.enum(["medecin", "epidemiologiste", "admin"], {
    error: "Veuillez sélectionner un rôle",
  }),
})

type LoginForm = z.infer<typeof loginSchema>

const ROLES = [
  { value: "medecin", label: "Médecin Déclarant" },
  { value: "epidemiologiste", label: "Épidémiologiste DSP" },
  { value: "admin", label: "Administrateur" },
] as const

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const selectedRole = watch("role")

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError(null)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        role: data.role,
        redirect: false,
      })
      if (result?.error) {
        setError("Email, mot de passe ou rôle incorrect.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #E8F0FE 0%, #ffffff 100%)" }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-xl"
            style={{ backgroundColor: "#1B4F8A" }}
          >
            EHU
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Se Connecter</h1>
          <p className="text-sm text-gray-500 mt-1">Surveillance Épidémiologique — Oran</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email institutionnel
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="prenom.nom@ehu-oran.dz"
              className={cn(
                "w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all",
                "border-gray-300 focus:border-[#1B4F8A] focus:ring-2 focus:ring-[#1B4F8A]/15",
                errors.email && "border-red-500 bg-red-50"
              )}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={cn(
                  "w-full h-10 px-3 pr-10 rounded-lg border text-sm outline-none transition-all",
                  "border-gray-300 focus:border-[#1B4F8A] focus:ring-2 focus:ring-[#1B4F8A]/15",
                  errors.password && "border-red-500 bg-red-50"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <div className="space-y-2">
              {ROLES.map((role) => (
                <label
                  key={role.value}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    selectedRole === role.value
                      ? "border-[#1B4F8A] bg-[#EEF4FF]"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <input
                    type="radio"
                    value={role.value}
                    checked={selectedRole === role.value}
                    onChange={() => setValue("role", role.value)}
                    className="accent-[#1B4F8A]"
                  />
                  <span className="text-sm font-medium text-gray-700">{role.label}</span>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full h-12 rounded-lg text-white font-medium text-sm transition-all",
              "bg-[#1B4F8A] hover:bg-[#153E6E] active:bg-[#102F54]",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {loading ? "Connexion en cours..." : "Se Connecter"}
          </button>

          <div className="text-center">
            <a href="/forgot-password" className="text-sm text-[#1B4F8A] hover:underline">
              Mot de passe oublié ?
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
