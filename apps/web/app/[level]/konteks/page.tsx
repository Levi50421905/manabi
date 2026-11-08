"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  EmptyState,
  PageHeader,
  Section,
  cn,
} from "@manabi/ui";
import {
  AUDIENCE_LABEL,
  CONTEXT_ROMAJI,
  KEIGO_ROMAJI,
  REGISTER_ROMAJI,
  contextCardsByCategory,
  keigoVerbsByLevel,
  levelHref,
  levelMeta,
  registerScenariosByLevel,
  type Audience,
  type ContextCard,
  type KeigoVerb,
  type RegisterScenario,
} from "@manabi/content";
import { SpeakButton } from "@/components/speak-button";
import { useActiveLevel } from "@/lib/level";

const AUDIENCE_TONE: Record<Audience, "neutral" | "accent" | "level" | "success"> = {
  akrab: "neutral",
  teman: "level",
  atasan: "accent",
  asing: "success",
};

function ScenarioCard({ scenario }: { scenario: RegisterScenario }) {
  return (
    <Card>
      <CardBody className="p-4 sm:p-5">
        <h3 className="text-h3 font-semibold text-fg">{scenario.title}</h3>
        <p className="mt-1 text-caption leading-relaxed text-fg-muted">{scenario.situation}</p>

        <ul className="mt-3 divide-y divide-border">
          {scenario.lines.map((line) => (
            <li key={line.audience} className="grid gap-1.5 py-2.5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-3">
              <div>
                <Badge tone={AUDIENCE_TONE[line.audience]}>{AUDIENCE_LABEL[line.audience]}</Badge>
              </div>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p lang="ja" className="font-jp text-body leading-relaxed text-fg">
                      {line.jp}
                    </p>
                    <p className="mt-0.5 text-caption italic text-fg-subtle">
                      {REGISTER_ROMAJI[`${scenario.id}:${line.audience}`] ?? ""}
                    </p>
                  </div>
                  <SpeakButton
                    text={line.jp}
                    size="sm"
                    variant="ghost"
                    label={`Putar: ${line.jp}`}
                  />
                </div>
                <p className="text-caption text-fg-muted">{line.id}</p>
                {line.note ? (
                  <p className="mt-0.5 text-caption leading-relaxed text-fg-subtle">{line.note}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

function KeigoRow({ verb }: { verb: KeigoVerb }) {
  const romaji = KEIGO_ROMAJI[verb.id];
  return (
    <div className="border-t border-border py-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <span lang="ja" className="font-jp-serif text-h3 font-semibold text-fg">
          {verb.dictionary}
        </span>
        <span className="text-caption text-fg-muted">{verb.meaning}</span>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface-muted p-2.5">
          <p className="label-micro">丁寧 · sopan</p>
          <p lang="ja" className="font-jp mt-1 text-sm text-fg">
            {verb.teinei}
          </p>
          {romaji ? <p className="mt-0.5 text-caption italic text-fg-subtle">{romaji.teinei}</p> : null}
        </div>
        <div className="rounded-lg border border-border bg-level-soft p-2.5">
          <p className="label-micro">尊敬 · untuk orang lain</p>
          <p lang="ja" className="font-jp mt-1 text-sm text-fg">
            {verb.sonkeigo}
          </p>
          {romaji ? <p className="mt-0.5 text-caption italic text-fg-subtle">{romaji.sonkeigo}</p> : null}
        </div>
        <div className="rounded-lg border border-border bg-accent-soft p-2.5">
          <p className="label-micro">謙譲 · untuk diri sendiri</p>
          <p lang="ja" className="font-jp mt-1 text-sm text-fg">
            {verb.kenjougo}
          </p>
          {romaji ? <p className="mt-0.5 text-caption italic text-fg-subtle">{romaji.kenjougo}</p> : null}
        </div>
      </div>
      {verb.note ? (
        <p className="mt-2 text-caption leading-relaxed text-fg-subtle">{verb.note}</p>
      ) : null}
    </div>
  );
}

function ContextCardView({ card }: { card: ContextCard }) {
  const romaji = card.romaji ?? CONTEXT_ROMAJI[card.id];
  return (
    <Card className="h-full">
      <CardBody className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-h3 font-semibold leading-snug text-fg">{card.title}</h3>
          <Badge tone={card.confidence === "kuat" ? "success" : "warning"}>
            {card.confidence === "kuat" ? "Berlaku umum" : "Tergantung situasi"}
          </Badge>
        </div>
        <p lang="ja" className="font-jp-serif text-h2 font-semibold leading-tight text-level">
          {card.japanese}
        </p>
        {romaji ? <p className="text-caption italic text-fg-subtle">{romaji}</p> : null}
        <p className="text-sm leading-relaxed text-fg-muted">{card.summary}</p>
        <ul className="mt-auto space-y-1 pt-1">
          {card.points.map((point) => (
            <li
              key={point}
              className="flex gap-2 text-caption leading-relaxed text-fg-muted before:mt-1.5 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-fg-subtle"
            >
              <span>{point}</span>
            </li>
          ))}
        </ul>
        {card.steps?.length ? (
          <div className="rounded-md border border-border bg-surface-muted/60 p-2.5">
            <p className="label-micro">Langkah</p>
            <ol className="mt-1.5 space-y-1">
              {card.steps.map((step, index) => (
                <li key={step} className="flex gap-2 text-caption leading-relaxed text-fg-muted">
                  <span className="tnum grid h-4 w-4 shrink-0 place-items-center rounded bg-surface text-[10px] font-semibold text-fg-subtle">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        {card.caution ? (
          <p className="rounded-md border border-warning/30 bg-warning-soft p-2 text-caption leading-relaxed text-fg">
            {card.caution}
          </p>
        ) : null}
        {card.source ? (
          <a
            href={card.source.url}
            target="_blank"
            rel="noreferrer"
            className="text-caption leading-relaxed text-fg-subtle underline decoration-border underline-offset-2 hover:text-fg"
          >
            Sumber: {card.source.label}
          </a>
        ) : null}
      </CardBody>
    </Card>
  );
}

export default function KonteksPage() {
  const { level } = useActiveLevel();
  const meta = levelMeta(level);

  const scenarios = registerScenariosByLevel(level);
  const verbs = keigoVerbsByLevel(level);
  const habits = contextCardsByCategory(level, "kebiasaan");
  const uniques = contextCardsByCategory(level, "unik");
  const practical = contextCardsByCategory(level, "praktis");

  const header = (
    <PageHeader
      eyebrow={
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="level" mono>
            {level}
          </Badge>
          <span className="label-micro">{meta.name} · Konteks &amp; Etiket</span>
        </div>
      }
      title="Konteks & Etiket"
      japanese="敬語とマナー"
      description="Tata bahasa yang benar belum tentu pas untuk situasinya. Di sini dibahas siapa yang diajak bicara, bentuk sopan tiga lapis, dan kebiasaan yang jarang diajarkan — setiap kalimat Jepang disertai romaji."
      actions={
        <Link href={levelHref(level, "konteks/latihan")}>
          <Button>Latihan</Button>
        </Link>
      }
    />
  );

  if (scenarios.length === 0 && verbs.length === 0 && habits.length === 0 && uniques.length === 0) {
    return (
      <div className="space-y-8 pb-8">
        {header}
        <EmptyState
          glyph="敬"
          title="Materi konteks belum tersedia"
          description="Saat ini materi konteks dan etiket baru disusun untuk level N5."
          action={
            <Link href={levelHref("N5", "konteks")}>
              <Button>Ke konteks N5</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 md:space-y-10">
      {header}

      <Callout tone="info" title="Kenapa ini penting?">
        Kalimat yang benar secara tata bahasa bisa terasa kasar. Bahasa Jepang menyesuaikan bentuk
        bicara dengan <strong>siapa</strong> yang diajak bicara dan <strong>di mana</strong> Anda
        berada. Bagian di bawah disusun sebagai kecenderungan yang lazim, bukan hukum mutlak.
      </Callout>

      <Section
        title="A · Menyesuaikan ucapan dengan lawan bicara"
        glyph="敬"
        description="Kalimat yang sama, empat tingkat kesopanan."
      >
        <div className="space-y-3">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      </Section>

      <Section
        title="B · Tiga lapis kesopanan (敬語)"
        glyph="礼"
        description="丁寧 untuk semua situasi, 尊敬 untuk orang lain, 謙譲 untuk diri sendiri."
      >
        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="space-y-0">
              {verbs.map((verb) => (
                <KeigoRow key={verb.id} verb={verb} />
              ))}
            </div>
          </CardBody>
        </Card>
      </Section>

      <Section
        title="C1 · Biasa bagi orang Jepang, asing bagi kita"
        glyph="慣"
        description="Kebiasaan sehari-hari yang tidak diajarkan sebagai “tata bahasa”."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((card) => (
            <ContextCardView key={card.id} card={card} />
          ))}
        </div>
      </Section>

      <Section
        title="C2 · Hal unik yang membingungkan"
        glyph="異"
        description="Bukan salah tata bahasa, tetapi sering disalahpahami pembelajar."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {uniques.map((card) => (
            <ContextCardView key={card.id} card={card} />
          ))}
        </div>
      </Section>

      <Section
        title="D · Praktis untuk hidup di Jepang"
        glyph="暮"
        description="SIM, rekening bank, ATM, balai kota, sewa rumah, utilitas, rumah sakit, kerja, pos, transportasi, sampah, dan gempa — hal yang harus dilakukan dengan benar, bukan hanya dipahami."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {practical.map((card) => (
            <ContextCardView key={card.id} card={card} />
          ))}
        </div>
      </Section>

      <p className={cn("border-t border-border pt-4 text-caption leading-relaxed text-fg-subtle")}>
        Kartu bertanda <strong>Tergantung situasi</strong> memang berbeda menurut daerah, hubungan,
        dan kebiasaan setempat. Materi ini pegangan awal — perhatikan lawan bicara dan konteksnya.
      </p>
    </div>
  );
}
