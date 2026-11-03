"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "@daypicker/react";
import { id } from "@daypicker/react/locale/id";
import {
  CalendarDays,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type DatePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
};

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function parseLocalDate(value: string): Date | undefined {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return undefined;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  const date = parseLocalDate(value);

  if (!date) return "";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Pilih tanggal",
  minDate,
  maxDate,
  required = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  // Jangan panggil new Date() saat inisialisasi state.
  const [visibleMonth, setVisibleMonth] = useState<Date | undefined>(undefined);

  const selectedDate = parseLocalDate(value);
  const min = parseLocalDate(minDate || "");
  const max = parseLocalDate(maxDate || "");

  // Kalender hanya dibuka setelah visibleMonth diisi.
  const calendarYear = visibleMonth?.getFullYear() ?? 2000;

  const startYear = Math.min(
    calendarYear - 100,
    min?.getFullYear() ?? calendarYear - 100,
  );

  const endYear = Math.max(
    calendarYear + 20,
    max?.getFullYear() ?? calendarYear + 20,
  );

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => startYear + index,
  );

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function openCalendar() {
    // new Date() dipanggil dalam event handler, bukan saat prerender.
    const initialDate = selectedDate || new Date();

    setVisibleMonth(
      new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
    );

    setOpen(true);
  }

  function handleSelect(date: Date | undefined) {
    if (!date) return;

    onChange(toDateString(date));
    setOpen(false);
  }

  function changeMonth(month: number) {
    if (!visibleMonth) return;

    setVisibleMonth(new Date(visibleMonth.getFullYear(), month, 1));
  }

  function changeYear(year: number) {
    if (!visibleMonth) return;

    setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1));
  }

  function navigateMonth(amount: number) {
    if (!visibleMonth) return;

    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1),
    );
  }

  return (
    <div className="relative w-full min-w-0">
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="ml-1 text-[#14E1E6]">*</span>}
      </label>

      {/* DATE INPUT BUTTON */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openCalendar}
        className="mt-2 flex min-h-[50px] w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-left text-sm text-white outline-none transition hover:border-[#14E1E6]/50 focus:border-[#14E1E6] focus:ring-1 focus:ring-[#14E1E6]/30"
      >
        <span className="flex min-w-0 items-center gap-3">
          <CalendarDays size={19} className="shrink-0 text-[#14E1E6]" />

          <span
            className={value ? "truncate text-white" : "truncate text-gray-500"}
          >
            {value ? formatDate(value) : placeholder}
          </span>
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* CALENDAR MODAL */}
      {open && visibleMonth && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="date-picker-card w-full max-w-[370px] rounded-2xl border border-white/10 bg-[#1D1D1D] p-5 shadow-2xl"
          >
            {/* HEADER */}
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-base font-semibold text-white">{label}</p>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedDate ? formatDate(value) : "Silakan pilih tanggal"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup kalender"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {/* MONTH AND YEAR SELECTOR */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs text-gray-500">
                  Pilih Bulan
                </label>

                <select
                  value={visibleMonth.getMonth()}
                  onChange={(event) => changeMonth(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#252525] px-3 py-3 text-sm text-white outline-none focus:border-[#14E1E6]"
                >
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-gray-500">
                  Pilih Tahun
                </label>

                <select
                  value={visibleMonth.getFullYear()}
                  onChange={(event) => changeYear(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#252525] px-3 py-3 text-sm text-white outline-none focus:border-[#14E1E6]"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* MONTH NAVIGATION */}
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">
                {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigateMonth(-1)}
                  aria-label="Bulan sebelumnya"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[#14E1E6] hover:bg-white/10"
                >
                  <ChevronLeft size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => navigateMonth(1)}
                  aria-label="Bulan berikutnya"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[#14E1E6] hover:bg-white/10"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>

            {/* DAY PICKER */}
            <div className="custom-calendar">
              <DayPicker
                mode="single"
                locale={id}
                lang="id"
                selected={selectedDate}
                month={visibleMonth}
                onMonthChange={setVisibleMonth}
                onSelect={handleSelect}
                disabled={[
                  ...(min ? [{ before: min }] : []),
                  ...(max ? [{ after: max }] : []),
                ]}
                weekStartsOn={1}
                showOutsideDays
                hideNavigation
                className="membership-daypicker"
              />
            </div>

            {/* FOOTER */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="rounded-lg px-3 py-2 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white"
              >
                Hapus tanggal
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[#14E1E6] px-5 py-2.5 text-xs font-semibold text-black hover:bg-[#0fcbd0]"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
