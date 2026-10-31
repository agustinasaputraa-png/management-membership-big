"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Settings,
  CalendarClock,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle2,
  Info,
  Users,
  Clock,
} from "lucide-react";

type WarningDays = 7 | 14 | 30 | 60;

export default function SettingsPage() {
  const [warningDays, setWarningDays] = useState<WarningDays>(30);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // Temporary frontend-only save.
    // Later this will call the NestJS settings API.
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  }

  return (
    <main className="min-h-screen bg-[#151515] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-[#14E1E6]"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14E1E6]/10 text-[#14E1E6]">
              <Settings size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
              <p className="mt-1 text-sm text-gray-400">
                Manage your membership application preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Membership Settings */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1c]">
          <div className="flex items-center gap-3 border-b border-white/10 p-5">
            <CalendarClock size={21} className="text-[#14E1E6]" />

            <div>
              <h2 className="font-semibold">Membership Settings</h2>
              <p className="mt-1 text-xs text-gray-500">
                Configure membership expiry rules.
              </p>
            </div>
          </div>

          <div className="space-y-6 p-5">
            {/* Expiry Warning Period */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Expiry Warning Period
              </label>

              <p className="mb-4 text-sm text-gray-500">
                Set how many days before expiry a member is classified as
                Expiring Soon.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {([7, 14, 30, 60] as WarningDays[]).map((days) => {
                  const active = warningDays === days;

                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setWarningDays(days)}
                      className={`rounded-xl border p-4 text-center transition ${
                        active
                          ? "border-[#14E1E6] bg-[#14E1E6]/10 text-[#14E1E6]"
                          : "border-white/10 bg-[#151515] text-gray-400 hover:border-white/30"
                      }`}
                    >
                      <p className="text-2xl font-bold">{days}</p>
                      <p className="mt-1 text-xs">Days</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#14E1E6]/10 bg-[#14E1E6]/5 p-3">
                <Info size={17} className="mt-0.5 shrink-0 text-[#14E1E6]" />

                <p className="text-xs leading-relaxed text-gray-400">
                  Members whose membership expires within the next{" "}
                  <span className="font-semibold text-[#14E1E6]">
                    {warningDays} days
                  </span>{" "}
                  will be classified as Expiring Soon.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1c]">
          <div className="flex items-center gap-3 border-b border-white/10 p-5">
            <Bell size={21} className="text-[#14E1E6]" />

            <div>
              <h2 className="font-semibold">Notification Settings</h2>
              <p className="mt-1 text-xs text-gray-500">
                Configure membership expiry notifications.
              </p>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            <SettingToggle
              icon={<Bell size={18} />}
              title="Expiry Notifications"
              description="Enable notifications for members approaching expiry."
              checked={notificationsEnabled}
              onChange={setNotificationsEnabled}
            />

            <SettingToggle
              icon={<Users size={18} />}
              title="Email Notifications"
              description="Enable email notification delivery when supported by the backend."
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
          </div>
        </section>

        {/* Access Control */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1c]">
          <div className="flex items-center gap-3 border-b border-white/10 p-5">
            <ShieldCheck size={21} className="text-[#14E1E6]" />

            <div>
              <h2 className="font-semibold">Access Control</h2>
              <p className="mt-1 text-xs text-gray-500">
                Membership application roles.
              </p>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between rounded-xl bg-[#151515] p-4">
              <div>
                <p className="font-medium">Admin</p>
                <p className="mt-1 text-xs text-gray-500">
                  Full access to membership management.
                </p>
              </div>

              <span className="rounded-full border border-[#14E1E6]/20 bg-[#14E1E6]/10 px-3 py-1 text-xs text-[#14E1E6]">
                Full Access
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#151515] p-4">
              <div>
                <p className="font-medium">Staff</p>
                <p className="mt-1 text-xs text-gray-500">
                  Operational access based on assigned permissions.
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                Limited Access
              </span>
            </div>

            <p className="text-xs leading-relaxed text-gray-500">
              These are informational role descriptions. Actual access
              permissions will be enforced by the NestJS backend.
            </p>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-xs text-gray-500">
            Settings changes are currently stored in frontend state only.
          </p>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14E1E6] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0]"
          >
            {saved ? (
              <>
                <CheckCircle2 size={18} />
                Saved
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

function SettingToggle({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-gray-500">{icon}</div>

        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[#14E1E6]" : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
