import { useState } from "react";
import { LanguageToggle } from "../components/LanguageToggle";
import { ScamIcon, OkIcon, SuspiciousIcon, ShieldIcon } from "../components/Icons";
import { dictionaries, loadLanguage, saveLanguage } from "../i18n";
import { landingStrings } from "../i18n/landing";
import type { Language } from "../types";

const APP_PATH = "/check";

/** A dark "signal at night" hero, then paper-warm sections below it. The switch
 *  in surface is deliberate: the hero is the road, the rest is the explanation. */
export default function Landing() {
  const [language, setLanguage] = useState<Language>(loadLanguage);
  const t = dictionaries[language];
  const l = landingStrings[language];

  function changeLanguage(next: Language) {
    setLanguage(next);
    saveLanguage(next);
    document.documentElement.lang = next;
  }

  const doesIcons = [SuspiciousIcon, ScamIcon, OkIcon];

  return (
    <div className="min-h-dvh">
      {/* ---------------------------------------------------------- hero --- */}
      <div className="bg-housing text-white">
        <header className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <span className="flex min-h-[44px] items-center gap-2">
            <ScamIcon className="h-8 w-8 text-[#ff5069]" />
            <span className="text-[1.35rem] font-extrabold tracking-tight">{t.appName}</span>
          </span>
          <div className="[&_[aria-checked='false']]:!text-white/70 [&_[aria-checked='true']]:!bg-white [&_[aria-checked='true']]:!text-[#101d2b] [&>div]:!bg-white/10 [&>div]:!ring-white/20">
            <LanguageToggle value={language} onChange={changeLanguage} label={t.languageLabel} />
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 pt-6 pb-12">
          <p className="ruko-rise text-[0.8rem] font-bold uppercase tracking-[0.2em] text-[#ff8b9c]">
            {l.heroKicker}
          </p>
          <h1
            className="ruko-rise mt-3 text-[2.1rem] leading-[1.12] font-extrabold tracking-tight"
            style={{ "--rise-delay": "60ms" } as React.CSSProperties}
          >
            {l.heroTitle}
          </h1>
          <p
            className="ruko-rise mt-4 text-[1.02rem] leading-relaxed text-white/80"
            style={{ "--rise-delay": "120ms" } as React.CSSProperties}
          >
            {l.heroBody}
          </p>

          <a
            href={APP_PATH}
            className="ruko-rise mt-7 flex min-h-[62px] w-full items-center justify-center rounded-2xl bg-[#c00d24] px-6 text-[1.2rem] font-extrabold text-white shadow-lg"
            style={{ "--rise-delay": "180ms" } as React.CSSProperties}
          >
            {l.heroCta}
          </a>
          <p className="mt-3 text-center text-[0.88rem] text-white/60">{l.heroNote}</p>
        </div>
      </div>

      <main className="mx-auto max-w-3xl space-y-12 px-4 py-12">
        {/* ------------------------------------------------ what it does --- */}
        <section>
          <h2 className="text-[1.5rem] font-extrabold tracking-tight">{l.doesTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {l.does.map((item, i) => {
              const Icon = doesIcons[i];
              return (
                <div key={i} className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
                  <Icon
                    className={`h-9 w-9 ${
                      i === 0 ? "text-amber" : i === 1 ? "text-red" : "text-green"
                    }`}
                  />
                  <h3 className="mt-3 text-[1.1rem] font-extrabold">{item.title}</h3>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* --------------------------------------------- how it decides --- */}
        <section>
          <h2 className="text-[1.5rem] font-extrabold tracking-tight">{l.howTitle}</h2>
          <ol className="mt-4 space-y-3">
            {l.how.map((step, i) => (
              <li key={i} className="flex gap-4 rounded-3xl border border-line bg-surface p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action text-[1.05rem] font-extrabold text-on-action">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[1.1rem] font-extrabold">{step.title}</h3>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ------------------------------------------------- scam types --- */}
        <section className="rounded-3xl border-2 border-amber-line bg-amber-tint p-5">
          <h2 className="text-[1.25rem] font-extrabold text-amber-ink">{l.typesTitle}</h2>
          <p className="mt-2 text-[0.98rem] leading-relaxed text-amber-ink">{l.typesBody}</p>
        </section>

        {/* ---------------------------------------------------- privacy --- */}
        <section>
          <h2 className="flex items-center gap-2 text-[1.5rem] font-extrabold tracking-tight">
            <ShieldIcon className="h-7 w-7" />
            {l.privacyTitle}
          </h2>
          <ul className="mt-4 space-y-2">
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

        <a
          href={APP_PATH}
          className="flex min-h-[62px] w-full items-center justify-center rounded-2xl bg-action px-6 text-[1.15rem] font-extrabold text-on-action"
        >
          {l.openApp}
        </a>
      </main>

      <footer className="border-t border-line bg-surface px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-3 text-center text-[0.88rem] text-muted">
          <p>{t.footerDisclaimer}</p>
          <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
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
          </p>
        </div>
      </footer>
    </div>
  );
}
