"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  Users,
  LoaderCircle,
} from "lucide-react";

import DatePicker from "@/components/ui/DatePicker";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  membership_number: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  valid_from: string;
  valid_until: string;
  created_at: string;
};

type MemberForm = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  validFrom: string;
  validUntil: string;
};

const initialForm: MemberForm = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  validFrom: "",
  validUntil: "",
};

const inputClass =
  "mt-2 box-border min-h-[50px] w-full min-w-0 rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-base text-white outline-none transition placeholder:text-gray-600 focus:border-[#14E1E6] focus:ring-1 focus:ring-[#14E1E6]/30";

const labelClass = "block text-sm font-medium text-gray-300";

function generateMembershipNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);

  return `MBR-${year}-${random}`;
}

export default function AddMemberPage() {
  const router = useRouter();

  const [today, setToday] = useState("");
  const [form, setForm] = useState<MemberForm>(initialForm);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdMember, setCreatedMember] = useState<Member | null>(null);

  // Mengambil tanggal lokal hanya di browser setelah mount.
  // Ini mencegah error unstable new Date() saat prerender Next.js.
  useEffect(() => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    setToday(`${year}-${month}-${day}`);
  }, []);

  function updateField(name: keyof MemberForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,

      // Jika tanggal mulai digeser melewati tanggal akhir,
      // kosongkan tanggal akhir agar user memilih ulang.
      ...(name === "validFrom" && prev.validUntil && prev.validUntil < value
        ? { validUntil: "" }
        : {}),
    }));

    setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (loading) return;

    // Pastikan tanggal browser sudah tersedia.
    if (!today) {
      setError("Sedang memuat tanggal. Silakan coba kembali.");
      return;
    }

    // Validasi data wajib.
    if (!form.name.trim()) {
      setError("Nama member wajib diisi.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email member wajib diisi.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Nomor telepon wajib diisi.");
      return;
    }

    if (!form.dateOfBirth || !form.validFrom || !form.validUntil) {
      setError("Semua tanggal wajib diisi.");
      return;
    }

    // Validasi tanggal lahir.
    if (form.dateOfBirth > today) {
      setError("Tanggal lahir tidak boleh di masa depan.");
      return;
    }

    if (form.dateOfBirth >= form.validFrom) {
      setError("Tanggal lahir harus sebelum tanggal mulai membership.");
      return;
    }

    // Validasi masa membership.
    if (form.validUntil < form.validFrom) {
      setError("Tanggal berakhir tidak boleh sebelum tanggal mulai.");
      return;
    }

    setLoading(true);

    try {
      // Periksa autentikasi admin.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const memberData = {
        membership_number: generateMembershipNumber(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        date_of_birth: form.dateOfBirth,
        valid_from: form.validFrom,
        valid_until: form.validUntil,
      };

      // Simpan member ke Supabase.
      const { data, error: insertError } = await supabase
        .from("members")
        .insert([memberData])
        .select()
        .single();

      if (insertError) {
        console.error("SUPABASE INSERT ERROR:", insertError);

        if (insertError.code === "23505") {
          setError("Email atau Membership Number sudah digunakan.");
        } else if (insertError.code === "42501") {
          setError(
            "Akses ditolak database. Periksa login dan kebijakan RLS Supabase.",
          );
        } else {
          setError(insertError.message);
        }

        return;
      }

      setCreatedMember(data as Member);
      setSuccess(true);
    } catch (err) {
      console.error("CREATE MEMBER ERROR:", err);

      setError("Terjadi kesalahan saat menyimpan data. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setCreatedMember(null);
    setSuccess(false);
    setError("");
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#151515] p-4 text-white sm:p-6 md:p-10">
      <div className="mx-auto w-full min-w-0 max-w-4xl">
        {/* Back Navigation */}
        <Link
          href="/members"
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-gray-400 transition hover:text-[#14E1E6]"
        >
          <ArrowLeft size={18} />
          Back to All Members
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#14E1E6]/10 text-[#14E1E6]">
            <UserPlus size={24} />
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">Create New Member</h1>

          <p className="mt-2 text-sm text-gray-500">
            Register a new member and create their membership account.
          </p>
        </div>

        {/* Success State */}
        {success && createdMember ? (
          <section className="rounded-2xl border border-[#14E1E6]/20 bg-[#1D1D1D] p-5 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#14E1E6]/10 text-[#14E1E6]">
              <CheckCircle2 size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Member Created Successfully!
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Data member berhasil disimpan ke Supabase PostgreSQL.
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-[#252525] p-5">
              <p className="text-xs text-gray-500">Membership Number</p>

              <p className="mt-2 break-all text-xl font-bold text-[#14E1E6]">
                {createdMember.membership_number}
              </p>

              <div className="mt-5 space-y-3 break-words text-sm">
                <p>{createdMember.name}</p>

                <p className="text-gray-400">{createdMember.email}</p>

                <p className="text-gray-400">{createdMember.phone}</p>

                <p className="text-gray-400">
                  Valid: {createdMember.valid_from} —{" "}
                  {createdMember.valid_until}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/members")}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0]"
              >
                <Users size={17} />
                View All Members
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="min-h-12 rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-300 transition hover:bg-white/5"
              >
                Add Another Member
              </button>
            </div>
          </section>
        ) : (
          /* Create Member Form */
          <form
            onSubmit={handleSubmit}
            className="box-border w-full min-w-0 rounded-2xl border border-white/10 bg-[#1D1D1D] p-4 sm:p-6 md:p-8"
          >
            {/* Personal Information */}
            <div className="mb-6 border-b border-white/10 pb-5">
              <h2 className="font-semibold">Personal Information</h2>

              <p className="mt-1 text-xs text-gray-500">
                Enter the member&apos;s personal details.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              {/* Full Name */}
              <div className="min-w-0">
                <label htmlFor="name" className={labelClass}>
                  Full Name *
                </label>

                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />

                  <input
                    id="name"
                    required
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter full name"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="min-w-0">
                <label htmlFor="email" className={labelClass}>
                  Email Address *
                </label>

                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />

                  <input
                    id="email"
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="example@email.com"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="min-w-0">
                <label htmlFor="phone" className={labelClass}>
                  Phone Number *
                </label>

                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />

                  <input
                    id="phone"
                    required
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="081234567890"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <DatePicker
                label="Date of Birth"
                value={form.dateOfBirth}
                onChange={(value) => updateField("dateOfBirth", value)}
                placeholder="Pilih tanggal lahir"
                maxDate={today || undefined}
                required
              />
            </div>

            {/* Membership Information */}
            <div className="mb-6 mt-9 border-b border-white/10 pb-5 sm:mt-10">
              <h2 className="font-semibold">Membership Information</h2>

              <p className="mt-1 text-xs text-gray-500">
                Set the validity period of this membership.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              {/* Valid From */}
              <DatePicker
                label="Valid From"
                value={form.validFrom}
                onChange={(value) => updateField("validFrom", value)}
                placeholder="Pilih tanggal mulai"
                required
              />

              {/* Valid Until */}
              <DatePicker
                label="Valid Until"
                value={form.validUntil}
                onChange={(value) => updateField("validUntil", value)}
                placeholder="Pilih tanggal berakhir"
                minDate={form.validFrom || undefined}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-6 break-words rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="mt-8 flex flex-col-reverse justify-end gap-3 border-t border-white/10 pt-6 sm:mt-10 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/members")}
                disabled={loading}
                className="min-h-12 rounded-xl border border-white/10 px-6 py-3 text-sm text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !today}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#14E1E6] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Create Member
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
