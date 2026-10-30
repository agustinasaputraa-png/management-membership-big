"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Phone,
  Calendar,
  Save,
} from "lucide-react";

export default function AddMemberPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    validFrom: "",
    validUntil: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (form.validUntil < form.validFrom) {
      setError("Tanggal berakhir harus setelah tanggal mulai.");
      return;
    }

    if (form.dateOfBirth && form.dateOfBirth >= form.validFrom) {
      setError("Tanggal lahir harus sebelum tanggal mulai membership.");
      return;
    }

    // TODO: Kirim data ke backend NestJS.
    // Saat ini belum disimpan ke database.

    setSuccess(true);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#14E1E6]";

  const labelClass = "text-sm font-medium text-gray-300";

  return (
    <div className="min-h-screen bg-[#151515] p-6 text-white md:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-[#14E1E6]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#14E1E6]/10 text-[#14E1E6]">
            <UserPlus size={24} />
          </div>

          <h1 className="text-2xl font-bold">Add New Member</h1>
          <p className="mt-2 text-sm text-gray-500">
            Register a new member and set their membership period.
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <Save size={24} />
            </div>

            <h2 className="text-xl font-semibold text-white">
              Form berhasil divalidasi!
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Data belum disimpan ke database. Integrasi API NestJS akan kita
              kerjakan berikutnya.
            </p>

            <button
              onClick={() => {
                setSuccess(false);
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  dateOfBirth: "",
                  validFrom: "",
                  validUntil: "",
                });
              }}
              className="mt-6 rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black"
            >
              Add Another Member
            </button>
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
                <label className={labelClass}>Full Name *</label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-5 text-gray-500"
                    size={18}
                  />
                  <input
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
                <label className={labelClass}>Email Address *</label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-5 text-gray-500"
                    size={18}
                  />
                  <input
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
                <label className={labelClass}>Phone Number *</label>
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-5 text-gray-500"
                    size={18}
                  />
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+62 812 3456 7890"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Date of Birth *</label>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-5 text-gray-500"
                    size={18}
                  />
                  <input
                    required
                    type="date"
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
                <label className={labelClass}>Valid From *</label>
                <input
                  required
                  type="date"
                  name="validFrom"
                  value={form.validFrom}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Valid Until *</label>
                <input
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
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="mt-10 flex flex-col-reverse justify-end gap-3 border-t border-white/10 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm text-gray-300 transition hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#14E1E6] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0]"
              >
                <Save size={18} />
                Save Member
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
