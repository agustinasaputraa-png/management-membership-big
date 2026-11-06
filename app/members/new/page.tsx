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
  CalendarDays,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  membership_number: string;
  name: string;
  email: string | null;
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

/**
 * Menerima format DD/MM/YYYY atau YYYY-MM-DD.
 * Mengembalikan YYYY-MM-DD untuk disimpan ke Supabase.
 */
function parseDateInput(input: string): string | null {
  const value = input.trim();
  let year = 0;
  let month = 0;
  let day = 0;

  const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const ymd = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dmy) {
    day = Number(dmy[1]);
    month = Number(dmy[2]);
    year = Number(dmy[3]);
  } else if (ymd) {
    year = Number(ymd[1]);
    month = Number(ymd[2]);
    day = Number(ymd[3]);
  } else {
    return null;
  }

  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Validasi kalender agar tanggal seperti 31/02/2026 ditolak.
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function generateMembershipNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);

  return `MBR-${year}-${random}`;
}

function DateTextField({
  id,
  label,
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  hint = "Format: DD/MM/YYYY",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label} *
      </label>

      <div className="relative">
        <CalendarDays
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          size={18}
        />
        <input
          id={id}
          required
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-describedby={`${id}-hint`}
          className={`${inputClass} pl-11`}
        />
      </div>

      <p id={`${id}-hint`} className="mt-2 text-xs text-gray-600">
        {hint}
      </p>
    </div>
  );
}

export default function AddMemberPage() {
  const router = useRouter();

  const [today, setToday] = useState("");
  const [form, setForm] = useState<MemberForm>(initialForm);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdMember, setCreatedMember] = useState<Member | null>(null);

  // Ambil tanggal lokal setelah halaman ter-mount agar aman untuk prerender.
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
    }));

    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (loading) return;

    if (!today) {
      setError("Sedang memuat tanggal. Silakan coba kembali.");
      return;
    }

    if (!form.name.trim()) {
      setError("Nama member wajib diisi.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Nomor telepon wajib diisi.");
      return;
    }

    const dateOfBirth = parseDateInput(form.dateOfBirth);
    const validFrom = parseDateInput(form.validFrom);
    const validUntil = parseDateInput(form.validUntil);

    if (!dateOfBirth || !validFrom || !validUntil) {
      setError(
        "Format tanggal tidak valid. Gunakan DD/MM/YYYY atau YYYY-MM-DD.",
      );
      return;
    }

    if (dateOfBirth > today) {
      setError("Tanggal lahir tidak boleh di masa depan.");
      return;
    }

    if (dateOfBirth >= validFrom) {
      setError("Tanggal lahir harus sebelum tanggal mulai membership.");
      return;
    }

    if (validUntil < validFrom) {
      setError("Tanggal berakhir tidak boleh sebelum tanggal mulai.");
      return;
    }

    setLoading(true);

    try {
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
        email: form.email.trim() ? form.email.trim().toLowerCase() : null,
        phone: form.phone.trim(),
        date_of_birth: dateOfBirth,
        valid_from: validFrom,
        valid_until: validUntil,
      };

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
        <Link
          href="/members"
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-gray-400 transition hover:text-[#14E1E6]"
        >
          <ArrowLeft size={18} />
          Back to All Members
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#14E1E6]/10 text-[#14E1E6]">
            <UserPlus size={24} />
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">Create New Member</h1>

          <p className="mt-2 text-sm text-gray-500">
            Register a new member and create their membership account.
          </p>
        </div>

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
                {createdMember.email && (
                  <p className="text-gray-400">{createdMember.email}</p>
                )}
                <p className="text-gray-400">{createdMember.phone}</p>
                <p className="text-gray-400">
                  Date of Birth: {createdMember.date_of_birth}
                </p>
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
          <form
            onSubmit={handleSubmit}
            className="box-border w-full min-w-0 rounded-2xl border border-white/10 bg-[#1D1D1D] p-4 sm:p-6 md:p-8"
          >
            <div className="mb-6 border-b border-white/10 pb-5">
              <h2 className="font-semibold">Personal Information</h2>
              <p className="mt-1 text-xs text-gray-500">
                Enter the member&apos;s personal details.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
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
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Enter full name"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label htmlFor="email" className={labelClass}>
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    id="email"
                    type="text"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="Email (opsional)"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

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
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    placeholder="081234567890"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <DateTextField
                id="dateOfBirth"
                label="Date of Birth"
                value={form.dateOfBirth}
                onChange={(value) => updateField("dateOfBirth", value)}
                hint="Contoh: 06/11/1995"
              />
            </div>

            <div className="mb-6 mt-9 border-b border-white/10 pb-5 sm:mt-10">
              <h2 className="font-semibold">Membership Information</h2>
              <p className="mt-1 text-xs text-gray-500">
                Set the validity period of this membership.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <DateTextField
                id="validFrom"
                label="Valid From"
                value={form.validFrom}
                onChange={(value) => updateField("validFrom", value)}
                hint="Tanggal mulai membership"
              />

              <DateTextField
                id="validUntil"
                label="Valid Until"
                value={form.validUntil}
                onChange={(value) => updateField("validUntil", value)}
                hint="Tanggal berakhir membership"
              />
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-6 break-words rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
              >
                {error}
              </div>
            )}

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
