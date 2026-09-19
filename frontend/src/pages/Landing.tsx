import { useState } from "react";
import {
  AppFileIcon,
  CrossIcon,
  DialIcon,
  MessageIcon,
  OkIcon,
  PhoneIcon,
  ScamIcon,
  ShieldIcon,
  SuspiciousIcon,
} from "../components/Icons";
import { InstallCard } from "../components/InstallCard";
import { LanguageSelect } from "../components/LanguageSelect";
import { applyLanguage, dictionaries, loadLanguage, saveLanguage } from "../i18n";
import { apkFor } from "../i18n/apk";
import { familyFor } from "../i18n/family";
import { installFor } from "../i18n/install";
import { landingFor } from "../i18n/landing";
import { LANGUAGES } from "../i18n/languages";
import { listenFor } from "../i18n/listen";
import { lookupFor } from "../i18n/lookup";
import { navFor } from "../i18n/nav";
import type { Language } from "../types";

// Normally the app lives at /check. A preview build (one that is not served from
// a domain root) overrides this with a relative path.
const APP_PATH = import.meta.env.VITE_APP_PATH ?? "/check";

/** The page someone lands on before they trust Ruko with anything.
 *
 * It has one job on a phone — get them into the app — and a second job on a
 * laptop, where a judge or a journalist is reading it: show the whole product
 * at a glance. Hence the same content in two shapes rather than two pages.
 *
 * Every feature name below comes from the app's own translations, so the
 * landing page is in all fifteen languages even though its prose is in three.
 */
export default function Landing() {
  const [language, setLanguage] = useState<Language>(loadLanguage);
  const t = dictionaries[language];
  const l = landingFor(language);
  const install = installFor(language);
  const nav = navFor(language);
  const listen = listenFor(language);
  const apk = apkFor(language);
  const lookup = lookupFor(language);
  const family = familyFor(language);

  function changeLanguage(next: Language) {
    setLanguage(next);
    saveLanguage(next);
    applyLanguage(next);
  }

  const abilities = [
    { icon: MessageIcon, tone: "text-red", title: t.checkHeading, body: t.checkSubheading, href: APP_PATH },
    { icon: PhoneIcon, tone: "text-red", title: listen.entry, body: listen.entryHint, href: `${APP_PATH}?mode=listen` },
    { icon: AppFileIcon, tone: "text-amber", title: apk.entry, body: apk.entryHint, href: `${APP_PATH}?mode=apk` },
    { icon: DialIcon, tone: "text-amber", title: lookup.heading, body: lookup.sub, href: `${APP_PATH}?mode=lookup` },
    { icon: ShieldIcon, tone: "text-green", title: family.familyTitle, body: family.familyIntro, href: "/guardian" },
    { icon: OkIcon, tone: "text-green", title: t.goldenHourTitle, body: t.goldenHourSub, href: APP_PATH },
  ];

  const doesIcons = [SuspiciousIcon, ScamIcon, OkIcon];

  return (
    <div className="min-h-dvh">
      {/* ------------------------------------------------------- top bar --- */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-housing/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 lg:px-8">
          <span className="flex min-h-[44px] items-center gap-2">
            <ScamIcon className="h-7 w-7 text-[#ff5069]" />
            <span className="text-[1.25rem] font-extrabold tracking-tight">{t.appName}</span>
          </span>

          <nav className="hidden items-center gap-6 text-[0.92rem] font-bold text-white/70 md:flex">
            <a className="hover:text-white" href="#does">{l.navDoes}</a>
            <a className="hover:text-white" href="#how">{l.navHow}</a>
            <a className="hover:text-white" href="#privacy">{l.navPrivacy}</a>
            <a className="hover:text-white" href="/attack">{nav.attack}</a>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSelect value={language} onChange={changeLanguage} label={t.languageLabel} tone="dark" />
            <a
              href={APP_PATH}
              className="hidden min-h-[44px] items-center rounded-xl bg-[#c00d24] px-4 text-[0.95rem] font-extrabold text-white sm:inline-flex"
            >
              {l.openApp}
            </a>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- hero --- */}
      <div className="bg-housing text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-8 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8 lg:pt-16 lg:pb-20">
          <div>
            <p className="ruko-rise text-[0.8rem] font-bold uppercase tracking-[0.2em] text-[#ff8b9c]">
              {l.heroKicker}
            </p>
            <h1
              className="ruko-rise mt-3 text-[2.1rem] leading-[1.1] font-extrabold tracking-tight lg:text-[3.1rem]"
              style={{ "--rise-delay": "60ms" } as React.CSSProperties}
            >
              {l.heroTitle}
            </h1>
            <p
              className="ruko-rise mt-4 max-w-xl text-[1.02rem] leading-relaxed text-white/80 lg:text-[1.1rem]"
              style={{ "--rise-delay": "120ms" } as React.CSSProperties}
            >
              {l.heroBody}
            </p>

            <div
              className="ruko-rise mt-7 flex flex-col gap-3 sm:flex-row"
              style={{ "--rise-delay": "180ms" } as React.CSSProperties}
            >
              <a
                href={APP_PATH}
                className="flex min-h-[62px] flex-1 items-center justify-center rounded-2xl bg-[#c00d24] px-6 text-[1.15rem] font-extrabold text-white shadow-lg sm:flex-none sm:px-8"
              >
                {l.heroCta}
              </a>
              <a
                href="/attack"
                className="flex min-h-[62px] flex-1 items-center justify-center rounded-2xl border-2 border-white/25 px-6 text-[1.05rem] font-bold text-white sm:flex-none sm:px-6"
              >
                {nav.attack}
              </a>
            </div>
            <p className="mt-3 text-[0.88rem] text-white/60">{l.heroNote}</p>
          </div>

          {/* A phone, so the thing being described is also visible. Static
              markup on purpose: it must not wait for an API to look right. */}
          <div className="mx-auto w-full max-w-[19rem]">
            <div className="rounded-[2.2rem] border border-white/15 bg-black/25 p-3 shadow-2xl">
              <div className="overflow-hidden rounded-[1.6rem] bg-page text-ink">
                <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
                  <ScamIcon className="h-5 w-5 text-red" />
                  <span className="text-[0.95rem] font-extrabold">{t.appName}</span>
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-center gap-3 rounded-2xl bg-red-panel px-4 py-3.5 text-white">
                    <div className="flex flex-col gap-1.5 rounded-xl bg-black/25 px-1.5 py-2">
                      <span className="ruko-lamp-live block h-2.5 w-2.5 rounded-full bg-[#ff5069]" />
                      <span className="block h-2.5 w-2.5 rounded-full bg-white/20" />
                      <span className="block h-2.5 w-2.5 rounded-full bg-white/20" />
                    </div>
                    <div>
                      <p className="text-[1.3rem] leading-none font-extrabold">{t.levelScam}</p>
                      <p className="mt-1 text-[0.8rem] text-white/85">{t.levelScamSub}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-line bg-surface p-3">
                    <p className="text-[0.72rem] font-bold uppercase tracking-wider text-muted">
                      {t.whyTitle}
                    </p>
                    <p className="mt-1.5 text-[0.85rem] leading-snug">
                      <span className="ruko-mark">share the OTP</span> ·{" "}
                      <span className="ruko-mark">sbi-kyc-verify.in</span>
                    </p>
                  </div>

                  <div className="rounded-2xl border-2 border-green-line bg-green-tint p-3">
                    <p className="flex items-center gap-1.5 text-[0.8rem] font-bold text-green-ink">
                      <OkIcon className="h-4 w-4" />
                      {t.doNowTitle}
                    </p>
                  </div>
                  <div className="rounded-2xl border-2 border-red-line bg-red-tint p-3">
                    <p className="flex items-center gap-1.5 text-[0.8rem] font-bold text-red-ink">
                      <CrossIcon className="h-4 w-4" />
                      {t.dontDoTitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-14 lg:px-8 lg:py-20">
        {/* ------------------------------------------------ what it does --- */}
        <section id="does" className="scroll-mt-20">
          <h2 className="text-[1.6rem] font-extrabold tracking-tight lg:text-[2rem]">{l.doesTitle}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {l.does.map((item, i) => {
              const Icon = doesIcons[i];
              return (
                <div key={i} className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
                  <Icon className={`h-9 w-9 ${i === 0 ? "text-amber" : i === 1 ? "text-red" : "text-green"}`} />
                  <h3 className="mt-3 text-[1.1rem] font-extrabold">{item.title}</h3>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------- everything it can do --- */}
        <section>
          <h2 className="text-[1.6rem] font-extrabold tracking-tight lg:text-[2rem]">
            {l.typesTitle}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {abilities.map((ability) => {
              const Icon = ability.icon;
              return (
                <a
                  key={ability.title}
                  href={ability.href}
                  className="group flex gap-3 rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-action-soft hover:bg-sunken"
                >
                  <Icon className={`mt-0.5 h-7 w-7 shrink-0 ${ability.tone}`} />
                  <span className="min-w-0">
                    <span className="block text-[1.05rem] font-extrabold">{ability.title}</span>
                    <span className="mt-1 block text-[0.92rem] leading-relaxed text-muted">
                      {ability.body}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* --------------------------------------------- how it decides --- */}
        <section id="how" className="scroll-mt-20">
          <h2 className="text-[1.6rem] font-extrabold tracking-tight lg:text-[2rem]">{l.howTitle}</h2>
          <ol className="mt-5 grid gap-3 lg:grid-cols-3">
            {l.how.map((step, i) => (
              <li key={i} className="rounded-3xl border border-line bg-surface p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-action text-[1.05rem] font-extrabold text-on-action">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-[1.1rem] font-extrabold">{step.title}</h3>
                <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------------------------------------------- languages --- */}
        <section className="rounded-3xl border-2 border-amber-line bg-amber-tint p-6">
          <h2 className="text-[1.25rem] font-extrabold text-amber-ink">
            {LANGUAGES.length} {t.languageLabel.toLowerCase()}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {LANGUAGES.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => changeLanguage(option.code)}
                className={`min-h-[40px] rounded-full border px-3.5 text-[0.92rem] font-bold transition-colors ${
                  option.code === language
                    ? "border-transparent bg-amber-ink text-page"
                    : "border-amber-line text-amber-ink hover:bg-amber-line/30"
                }`}
              >
                {option.endonym}
              </button>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------ privacy --- */}
        <section id="privacy" className="scroll-mt-20 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="flex items-center gap-2 text-[1.6rem] font-extrabold tracking-tight lg:text-[2rem]">
              <ShieldIcon className="h-7 w-7" />
              {l.privacyTitle}
            </h2>
            <div className="mt-4">
              <InstallCard s={install} />
            </div>
          </div>
          <ul className="space-y-2">
            {l.privacyPoints.map((point, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-[0.98rem]"
              >
                <OkIcon className="mt-0.5 h-5 w-5 shrink-0 text-green" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------------ install --- */}
        <section className="flex flex-col items-center gap-6 rounded-3xl bg-housing p-6 text-white sm:flex-row sm:p-8">
          <img
            src="/install-qr.svg"
            alt="QR code that opens Ruko"
            className="h-32 w-32 shrink-0 rounded-2xl bg-white p-2"
          />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 className="text-[1.4rem] font-extrabold tracking-tight">{install.title}</h2>
            <p className="mt-2 text-[0.98rem] leading-relaxed text-white/75">{install.body}</p>
            <a
              href={APP_PATH}
              className="mt-4 inline-flex min-h-[54px] items-center justify-center rounded-2xl bg-[#c00d24] px-7 text-[1.05rem] font-extrabold text-white"
            >
              {l.openApp}
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface px-4 py-10 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center text-[0.9rem] text-muted">
          <p className="max-w-2xl">{t.footerDisclaimer}</p>
          <p className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            <a href="tel:1930" className="inline-flex min-h-[44px] items-center font-bold text-ink">
              {t.footerHelpline}
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] items-center font-bold text-ink"
            >
              {t.footerPortal}
            </a>
            <a href="/guardian" className="inline-flex min-h-[44px] items-center font-bold text-ink">
              {family.familyTitle}
            </a>
            <a href="/attack" className="inline-flex min-h-[44px] items-center font-bold text-ink">
              {nav.attack}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
