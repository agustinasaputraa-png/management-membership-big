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
  MapPin,
  CreditCard,
  Globe,
  Tag,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  membership_number: string;
  name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  valid_from: string | null;
  valid_until: string | null;
  address: string | null;
  gender: string | null;
  postal_code: string | null;
  nationality: string | null;
  identity_number: string | null;
  membership_status: string | null;
  marketing: string | null;
  created_at: string;
};

type MemberForm = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  validFrom: string;
  validUntil: string;
  address: string;
  gender: string;
  postalCode: string;
  nationality: string;
  identityNumber: string;
  membershipStatus: string;
  marketing: string;
};

const initialForm: MemberForm = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  validFrom: "",
  validUntil: "",
  address: "",
  gender: "",
  postalCode: "",
  nationality: "INDONESIA",
  identityNumber: "",
  membershipStatus: "",
  marketing: "",
};

const inputClass =
  "mt-2 box-border min-h-[50px] w-full min-w-0 rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-base text-white outline-none transition placeholder:text-gray-600 focus:border-[#14E1E6] focus:ring-1 focus:ring-[#14E1E6]/30";
const labelClass = "block text-sm font-medium text-gray-300";

function parseDateInput(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

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
  hint = "Opsional · Format DD/MM/YYYY atau YYYY-MM-DD",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label} <span className="text-gray-600">(Optional)</span>
      </label>
      <div className="relative">
        <CalendarDays
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          size={18}
        />
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="DD/MM/YYYY"
          className={`${inputClass} pl-11`}
        />
      </div>
      <p className="mt-2 text-xs text-gray-600">{hint}</p>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder = "",
  icon,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  type?: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label} <span className="text-gray-600">(Optional)</span>
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${inputClass} ${icon ? "pl-11" : ""}`}
        />
      </div>
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

  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setToday(`${year}-${month}-${day}`);
  }, []);

  function updateField(name: keyof MemberForm, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
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

    const parseOptionalDate = (value: string, label: string) => {
      if (!value.trim()) return { value: null as string | null, error: "" };
      const parsed = parseDateInput(value);
      return parsed
        ? { value: parsed, error: "" }
        : {
            value: null,
            error: `${label} tidak valid. Gunakan DD/MM/YYYY atau YYYY-MM-DD.`,
          };
    };

    const dob = parseOptionalDate(form.dateOfBirth, "Tanggal lahir");
    const from = parseOptionalDate(form.validFrom, "Tanggal mulai");
    const until = parseOptionalDate(form.validUntil, "Tanggal berakhir");

    if (dob.error || from.error || until.error) {
      setError(dob.error || from.error || until.error);
      return;
    }
    if (dob.value && dob.value > today) {
      setError("Tanggal lahir tidak boleh di masa depan.");
      return;
    }
    if (dob.value && from.value && dob.value >= from.value) {
      setError("Tanggal lahir harus sebelum tanggal mulai membership.");
      return;
    }
    if (from.value && until.value && until.value < from.value) {
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
        phone: form.phone.trim() || null,
        date_of_birth: dob.value,
        valid_from: from.value,
        valid_until: until.value,
        address: form.address.trim() || null,
        gender: form.gender.trim() || null,
        postal_code: form.postalCode.trim() || null,
        nationality: form.nationality.trim() || null,
        identity_number: form.identityNumber.trim() || null,
        membership_status: form.membershipStatus.trim() || null,
        marketing: form.marketing.trim() || null,
      };

      const { data, error: insertError } = await supabase
        .from("members")
        .insert([memberData])
        .select()
        .single();

      if (insertError) {
        console.error("SUPABASE INSERT ERROR:", insertError);
        if (insertError.code === "23505") {
          setError("Membership Number sudah digunakan. Silakan coba lagi.");
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
      <div className="mx-auto w-full min-w-0 max-w-5xl">
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
              <div className="mt-5 space-y-2 break-words text-sm">
                <p>{createdMember.name}</p>
                <p className="text-gray-400">{createdMember.email || "-"}</p>
                <p className="text-gray-400">{createdMember.phone || "-"}</p>
                <p className="text-gray-400">
                  Address: {createdMember.address || "-"}
                </p>
                <p className="text-gray-400">
                  Gender: {createdMember.gender || "-"}
                </p>
                <p className="text-gray-400">
                  Date of Birth: {createdMember.date_of_birth || "-"}
                </p>
                <p className="text-gray-400">
                  Valid: {createdMember.valid_from || "-"} —{" "}
                  {createdMember.valid_until || "-"}
                </p>
                <p className="text-gray-400">
                  Postal Code: {createdMember.postal_code || "-"}
                </p>
                <p className="text-gray-400">
                  Nationality: {createdMember.nationality || "-"}
                </p>
                <p className="text-gray-400">
                  Identity Number: {createdMember.identity_number || "-"}
                </p>
                <p className="text-gray-400">
                  Membership Status: {createdMember.membership_status || "-"}
                </p>
                <p className="text-gray-400">
                  Marketing: {createdMember.marketing || "-"}
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
                Nama wajib diisi. Kolom lainnya boleh dikosongkan.
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
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Enter full name"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <TextField
                id="email"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                placeholder="Email (opsional)"
                icon={<Mail size={18} />}
              />
              <TextField
                id="phone"
                label="Phone Number"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="081234567890"
                icon={<Phone size={18} />}
              />
              <DateTextField
                id="dateOfBirth"
                label="Date of Birth"
                value={form.dateOfBirth}
                onChange={(value) => updateField("dateOfBirth", value)}
                hint="Boleh kosong · Contoh: 06/11/1995"
              />
              <TextField
                id="gender"
                label="Gender"
                value={form.gender}
                onChange={(value) => updateField("gender", value)}
                placeholder="Male / Female"
              />
              <TextField
                id="nationality"
                label="Nationality"
                value={form.nationality}
                onChange={(value) => updateField("nationality", value)}
                placeholder="INDONESIA"
                icon={<Globe size={18} />}
              />
              <TextField
                id="identityNumber"
                label="Identity Number"
                value={form.identityNumber}
                onChange={(value) => updateField("identityNumber", value)}
                placeholder="Nomor KTP / identitas"
                icon={<CreditCard size={18} />}
              />
              <TextField
                id="postalCode"
                label="Postal Code"
                value={form.postalCode}
                onChange={(value) => updateField("postalCode", value)}
                placeholder="Kode pos"
              />
              <div className="min-w-0 md:col-span-2">
                <label htmlFor="address" className={labelClass}>
                  Address <span className="text-gray-600">(Optional)</span>
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  placeholder="Alamat lengkap"
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>

            <div className="mb-6 mt-9 border-b border-white/10 pb-5 sm:mt-10">
              <h2 className="font-semibold">Membership Information</h2>
              <p className="mt-1 text-xs text-gray-500">
                Periode dan informasi membership dapat dikosongkan jika belum
                tersedia.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <DateTextField
                id="validFrom"
                label="Valid From"
                value={form.validFrom}
                onChange={(value) => updateField("validFrom", value)}
                hint="Boleh kosong · Tanggal mulai membership"
              />
              <DateTextField
                id="validUntil"
                label="Valid Until"
                value={form.validUntil}
                onChange={(value) => updateField("validUntil", value)}
                hint="Boleh kosong · Tanggal berakhir membership"
              />
              <TextField
                id="membershipStatus"
                label="Membership Status"
                value={form.membershipStatus}
                onChange={(value) => updateField("membershipStatus", value)}
                placeholder="Contoh: PAID / FREE"
                icon={<Tag size={18} />}
              />
              <TextField
                id="marketing"
                label="Marketing"
                value={form.marketing}
                onChange={(value) => updateField("marketing", value)}
                placeholder="Sumber / PIC marketing"
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
