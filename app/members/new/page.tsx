"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Phone,
  Calendar,
  Save,
  CheckCircle2,
  Users,
  LoaderCircle,
} from "lucide-react";
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

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#14E1E6]";

const labelClass = "text-sm font-medium text-gray-300";

export default function AddMemberPage() {
  const router = useRouter();

  const [today, setToday] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    validFrom: "",
    validUntil: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdMember, setCreatedMember] = useState<Member | null>(null);

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  }

  function generateMembershipNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);

    return `MBR-${year}-${random}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (loading) return;

    if (!form.name.trim()) {
      setError("Nama member wajib diisi.");
      return;
    }

    if (form.validUntil < form.validFrom) {
      setError("Tanggal berakhir harus setelah tanggal mulai.");
      return;
    }

    if (form.dateOfBirth >= form.validFrom) {
      setError("Tanggal lahir harus sebelum tanggal mulai membership.");
      return;
    }

    if (form.dateOfBirth > today) {
      setError("Tanggal lahir tidak boleh di masa depan.");
      return;
    }

    setLoading(true);

    try {
      // Pastikan Admin sudah login
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const membershipNumber = generateMembershipNumber();

      const memberData = {
        membership_number: membershipNumber,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        date_of_birth: form.dateOfBirth,
        valid_from: form.validFrom,
        valid_until: form.validUntil,
      };

      const { data, error: insertError } = await supabase
        .from("members")
        .insert([memberData])
        .select()
        .single();

      if (insertError) {
        console.error("SUPABASE INSERT ERROR:", insertError);

        if (insertError.code === "23505") {
          setError(
            "Email atau Membership Number sudah digunakan. Silakan coba kembali."
          );
        } else if (insertError.code === "42501") {
          setError(
            "Akses ditolak oleh database. Periksa login dan kebijakan RLS Supabase."
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
    setForm({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      validFrom: "",
      validUntil: "",
    });

    setCreatedMember(null);
    setSuccess(false);
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#151515] p-6 text-white md:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/members"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-[#14E1E6]"
        >
          <ArrowLeft size={18} />
          Back to All Members
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#14E1E6]/10 text-[#14E1E6]">
            <UserPlus size={24} />
          </div>

          <h1 className="text-2xl font-bold">Create New Member</h1>

          <p className="mt-2 text-sm text-gray-500">
            Register a new member and create their membership account.
          </p>
        </div>

        {success && createdMember ? (
          <div className="rounded-2xl border border-[#14E1E6]/20 bg-[#1D1D1D] p-8">
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

              <p className="mt-2 text-xl font-bold text-[#14E1E6]">
                {createdMember.membership_number}
              </p>

              <div className="mt-5 space-y-3 text-sm">
                <p>{createdMember.name}</p>
                <p className="text-gray-400">{createdMember.email}</p>
                <p className="text-gray-400">{createdMember.phone}</p>
                <p className="text-gray-400">
                  Valid: {createdMember.valid_from} — {createdMember.valid_until}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/members")}
                className="flex items-center gap-2 rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0]"
              >
                <Users size={17} />
                View All Members
              </button>

              <button
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-300 transition hover:bg-white/5"
              >
                Add Another Member
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-6 md:p-8"
          >
            <div className="mb-6 border-b border-white/10 pb-5">
              <h2 className="font-semibold">Personal Information</h2>
              <p className="mt-1 text-xs text-gray-500">
                Enter the member's personal details.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full Name *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-5 text-gray-500"
                    size={18}
                  />
                  <input
                    id="name"
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address *
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-5 text-gray-500"
                    size={18}
                  />
                  <input
                    id="email"
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-5 text-gray-500"
                    size={18}
                  />
                  <input
                    id="phone"
                    required
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="081234567890"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dateOfBirth" className={labelClass}>
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-5 text-gray-500"
                    size={18}
                  />
                  <input
                    id="dateOfBirth"
                    required
                    type="date"
                    max={today || undefined}
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6 mt-10 border-b border-white/10 pb-5">
              <h2 className="font-semibold">Membership Information</h2>
              <p className="mt-1 text-xs text-gray-500">
                Set the validity period of this membership.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="validFrom" className={labelClass}>
                  Valid From *
                </label>
                <input
                  id="validFrom"
                  required
                  type="date"
                  name="validFrom"
                  value={form.validFrom}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="validUntil" className={labelClass}>
                  Valid Until *
                </label>
                <input
                  id="validUntil"
                  required
                  type="date"
                  name="validUntil"
                  min={form.validFrom || undefined}
                  value={form.validUntil}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            <div className="mt-10 flex flex-col-reverse justify-end gap-3 border-t border-white/10 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/members")}
                disabled={loading}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm text-gray-300 transition hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#14E1E6] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0] disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  );
}
