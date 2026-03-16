"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { calculateAge } from "@/utils/calculate-age"
import { cn } from "@/utils/cn"
import ProtocoleAlertModal from "@/components/protocoles/protocole-alert-modal"
import { toast } from "sonner"

const declarationSchema = z.object({
  // Section A - Patient
  firstName: z.string().min(2, "Minimum 2 caractères"),
  lastName: z.string().min(2, "Minimum 2 caractères"),
  dateOfBirth: z.string().min(1, "Date de naissance requise"),
  sex: z.enum(["homme", "femme"], { error: "Sexe requis" }),
  address: z.string().min(5, "Adresse requise"),
  communeId: z.string().optional(),
  phone: z.string().optional(),
  // Section B - Maladie
  maladieId: z.string().min(1, "Maladie requise"),
  dateDebutSymptomes: z.string().min(1, "Date requise"),
  dateDiagnostic: z.string().min(1, "Date requise"),
  modeConfirmation: z.enum(["clinique", "epidemiologique", "laboratoire"], { error: "Mode de confirmation requis" }),
  resultatLabo: z.string().optional(),
  // Section C - Médical
  etablissementId: z.string().optional(),
  service: z.string().min(1, "Service requis"),
  notesCliniques: z.string().optional(),
})

type DeclarationFormData = z.infer<typeof declarationSchema>

interface Maladie { id: string; nom: string; codeMdo: string }
interface Commune { id: string; nom: string }
interface Etablissement { id: string; nom: string }

export default function DeclarationForm() {
  const router = useRouter()
  const [maladies, setMaladies] = useState<Maladie[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [age, setAge] = useState<number | null>(null)
  const [pendingCasId, setPendingCasId] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [declenchement, setDeclenchement] = useState<any>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<DeclarationFormData>({
    resolver: zodResolver(declarationSchema),
  })

  const dateOfBirth = watch("dateOfBirth")
  const modeConfirmation = watch("modeConfirmation")

  useEffect(() => {
    if (dateOfBirth) {
      try { setAge(calculateAge(dateOfBirth)) } catch { setAge(null) }
    }
  }, [dateOfBirth])

  useEffect(() => {
    fetch("/api/maladies").then(r => r.json()).then(setMaladies).catch(console.error)
    fetch("/api/communes").then(r => r.json()).then(setCommunes).catch(console.error)
    fetch("/api/etablissements").then(r => r.json()).then(setEtablissements).catch(console.error)
  }, [])

  const onSubmit = async (data: DeclarationFormData) => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        patient: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          sex: data.sex,
          address: data.address,
          communeId: data.communeId || null,
          phone: data.phone || null,
        },
        maladieId: data.maladieId,
        dateDebutSymptomes: data.dateDebutSymptomes,
        dateDiagnostic: data.dateDiagnostic,
        modeConfirmation: data.modeConfirmation,
        resultatLabo: data.resultatLabo || null,
        etablissementId: data.etablissementId || null,
        service: data.service,
        notesCliniques: data.notesCliniques || null,
      }
      const res = await fetch("/api/cas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erreur lors de la déclaration")
      }
      const cas = await res.json()
      toast.success("Déclaration enregistrée avec succès")
      if (cas.declenchement) {
        // Show protocol modal before redirecting
        setDeclenchement(cas.declenchement)
        setPendingCasId(cas.id)
      } else {
        router.push(`/declarations/${cas.id}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError: boolean) => cn(
    "w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all",
    hasError
      ? "border-red-400 bg-red-50 focus:border-red-500"
      : "border-gray-200 focus:border-[#1B4F8A] focus:ring-2 focus:ring-[#1B4F8A]/10"
  )

  const selectedMaladie = maladies.find(m => m.id === watch("maladieId"))

  return (
    <>
    {declenchement && (
      <ProtocoleAlertModal
        declenchement={declenchement}
        maladieName={selectedMaladie?.nom ?? ""}
        onClose={() => {
          setDeclenchement(null)
          if (pendingCasId) router.push(`/declarations/${pendingCasId}`)
        }}
      />
    )}
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">

      {/* Section A */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 flex items-center gap-3" style={{ backgroundColor: "#1B4F8A" }}>
          <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center">A</span>
          <h2 className="text-white font-semibold text-sm">Informations Patient</h2>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Prénom *</label>
            <input {...register("firstName")} className={inputClass(!!errors.firstName)} placeholder="Ahmed" />
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
            <input {...register("lastName")} className={inputClass(!!errors.lastName)} placeholder="Benali" />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date de Naissance *</label>
            <input {...register("dateOfBirth")} type="date" className={inputClass(!!errors.dateOfBirth)} />
            {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Âge (calculé)</label>
            <div className="h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center text-sm text-gray-500">
              {age !== null ? `${age} ans` : "—"}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sexe *</label>
            <select {...register("sex")} className={inputClass(!!errors.sex)}>
              <option value="">Sélectionner...</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
            {errors.sex && <p className="text-xs text-red-500 mt-1">{errors.sex.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
            <input {...register("phone")} className={inputClass(false)} placeholder="0555 xx xx xx" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Adresse *</label>
            <input {...register("address")} className={inputClass(!!errors.address)} placeholder="Rue, commune, wilaya" />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Commune</label>
            <select {...register("communeId")} className={inputClass(false)}>
              <option value="">Sélectionner une commune...</option>
              {communes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Section B */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 flex items-center gap-3" style={{ backgroundColor: "#1B4F8A" }}>
          <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center">B</span>
          <h2 className="text-white font-semibold text-sm">Informations Maladie</h2>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Maladie *</label>
            <select {...register("maladieId")} className={inputClass(!!errors.maladieId)}>
              <option value="">Sélectionner une maladie...</option>
              {maladies.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.codeMdo})</option>)}
            </select>
            {errors.maladieId && <p className="text-xs text-red-500 mt-1">{errors.maladieId.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date Début Symptômes *</label>
            <input {...register("dateDebutSymptomes")} type="date" className={inputClass(!!errors.dateDebutSymptomes)} />
            {errors.dateDebutSymptomes && <p className="text-xs text-red-500 mt-1">{errors.dateDebutSymptomes.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date Diagnostic *</label>
            <input {...register("dateDiagnostic")} type="date" className={inputClass(!!errors.dateDiagnostic)} />
            {errors.dateDiagnostic && <p className="text-xs text-red-500 mt-1">{errors.dateDiagnostic.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Mode de Confirmation *</label>
            <div className="flex gap-4">
              {(["clinique", "epidemiologique", "laboratoire"] as const).map(mode => (
                <label key={mode} className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all flex-1 justify-center text-sm",
                  modeConfirmation === mode ? "border-[#1B4F8A] bg-[#EEF4FF] text-[#1B4F8A] font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}>
                  <input type="radio" value={mode} {...register("modeConfirmation")} className="sr-only" />
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </label>
              ))}
            </div>
            {errors.modeConfirmation && <p className="text-xs text-red-500 mt-1">{errors.modeConfirmation.message}</p>}
          </div>
          {modeConfirmation === "laboratoire" && (
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Résultat Laboratoire</label>
              <textarea {...register("resultatLabo")} rows={3} className={cn(inputClass(false), "h-auto py-2 resize-none")} placeholder="Détails du résultat laboratoire..." />
            </div>
          )}
        </div>
      </div>

      {/* Section C */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 flex items-center gap-3" style={{ backgroundColor: "#1B4F8A" }}>
          <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center">C</span>
          <h2 className="text-white font-semibold text-sm">Informations Médicales</h2>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Établissement de Santé</label>
            <select {...register("etablissementId")} className={inputClass(false)}>
              <option value="">Sélectionner...</option>
              {etablissements.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Service *</label>
            <input {...register("service")} className={inputClass(!!errors.service)} placeholder="ex: Médecine interne" />
            {errors.service && <p className="text-xs text-red-500 mt-1">{errors.service.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes Cliniques</label>
            <textarea {...register("notesCliniques")} rows={4} className={cn(inputClass(false), "h-auto py-2 resize-none")} placeholder="Observations cliniques, antécédents pertinents..." maxLength={2000} />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-60"
          style={{ backgroundColor: "#27AE60" }}
        >
          {loading ? "Enregistrement..." : "Valider la Déclaration"}
        </button>
      </div>
    </form>
    </>
  )
}
