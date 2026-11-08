#!/usr/bin/env node
/**
 * Validator bank soal Manabi-Rouge.
 *
 * Pemakaian:
 *   node tools/validate-bank.mjs docs/bank-soal/contoh-bank.json
 *
 * Tanpa dependensi. Memeriksa skema inti, referensi stimulus, kunci jawaban,
 * konsistensi taksonomi, form blueprint, dan aturan mutu yang tidak boleh
 * dilanggar. Exit code 1 jika ada error; warning tidak menggagalkan.
 */

import fs from "node:fs";
import path from "node:path";

const bankPath = process.argv[2] ?? "docs/bank-soal/contoh-bank.json";
const absolute = path.resolve(bankPath);

const errors = [];
const warnings = [];

function fail(where, message) {
  errors.push(`${where}: ${message}`);
}

function warn(where, message) {
  warnings.push(`${where}: ${message}`);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalize(text) {
  return String(text).replace(/\s+/g, "").replace(/[「」『』]/g, "");
}

let bank;
try {
  bank = JSON.parse(fs.readFileSync(absolute, "utf8"));
} catch (error) {
  console.error(`Gagal membaca ${absolute}: ${error.message}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Root
 * ------------------------------------------------------------------ */

const rootRequired = ["schema_version", "bank_version", "generated_at", "taxonomy", "stimuli", "items"];
for (const key of rootRequired) {
  if (!(key in bank)) fail("root", `field wajib "${key}" tidak ada`);
}
if (bank.schema_version !== "1.0.0") fail("root", `schema_version harus "1.0.0"`);
if (!/^[0-9]{4}\.[0-9]{2}\.[0-9]+$/.test(bank.bank_version ?? "")) {
  fail("root", "bank_version harus berformat YYYY.MM.N");
}
if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(bank.generated_at ?? "")) {
  fail("root", "generated_at harus berformat YYYY-MM-DD");
}

/* ------------------------------------------------------------------ *
 * Taksonomi
 * ------------------------------------------------------------------ */

const itemTypes = new Map();
const activeTypes = [];
for (const [index, type] of (bank.taxonomy?.item_types ?? []).entries()) {
  const where = `taxonomy.item_types[${index}]`;
  if (!nonEmpty(type.code)) {
    fail(where, "code kosong");
    continue;
  }
  if (itemTypes.has(type.code)) fail(where, `code duplikat ${type.code}`);
  if (!["jlpt", "jft"].includes(type.exam_family)) fail(where, "exam_family tidak valid");
  if (typeof type.option_count !== "number" || ![3, 4].includes(type.option_count)) {
    fail(where, "option_count harus 3 atau 4");
  }
  if (!Array.isArray(type.levels)) fail(where, "levels harus array");
  if (!nonEmpty(type.label_jp) || !nonEmpty(type.label_id)) fail(where, "label_jp/label_id kosong");
  itemTypes.set(type.code, type);
  if (type.active) activeTypes.push(type.code);
}

/* ------------------------------------------------------------------ *
 * Profil skor
 * ------------------------------------------------------------------ */

const scoringProfiles = new Map();
for (const [index, profile] of (bank.scoring_profiles ?? []).entries()) {
  const where = `scoring_profiles[${index}]`;
  if (!nonEmpty(profile.code)) {
    fail(where, "code kosong");
    continue;
  }
  if (scoringProfiles.has(profile.code)) fail(where, `code duplikat ${profile.code}`);
  const config = profile.config ?? {};
  if (typeof config.max_total !== "number" || config.max_total <= 0) {
    fail(where, "config.max_total tidak valid");
  }
  if (!Array.isArray(config.sections)) fail(where, "config.sections harus array");
  for (const section of config.sections ?? []) {
    if (!nonEmpty(section.key)) fail(where, "section.key kosong");
    if (typeof section.max !== "number" || section.max <= 0) fail(where, "section.max tidak valid");
    if (section.min_pass != null && typeof section.min_pass !== "number") {
      fail(where, "section.min_pass harus angka atau null");
    }
  }
  scoringProfiles.set(profile.code, profile);
}

/* ------------------------------------------------------------------ *
 * Stimulus
 * ------------------------------------------------------------------ */

const stimuli = new Map();
for (const [index, stimulus] of (bank.stimuli ?? []).entries()) {
  const where = `stimuli[${index}]`;
  if (!/^ST-[A-Z0-9-]+$/.test(stimulus.id ?? "")) fail(where, `id tidak valid: ${stimulus.id}`);
  if (stimuli.has(stimulus.id)) fail(where, `id duplikat ${stimulus.id}`);
  if (!["passage", "dialogue", "notice", "email", "table", "image", "announcement", "utterance"].includes(stimulus.kind)) {
    fail(where, `kind tidak valid: ${stimulus.kind}`);
  }
  if (!["N5", "N4", "N3", "N2", "N1", "JFT"].includes(stimulus.level)) {
    fail(where, `level tidak valid: ${stimulus.level}`);
  }
  if (!nonEmpty(stimulus.title)) fail(where, "title kosong");

  if (["dialogue", "announcement", "utterance"].includes(stimulus.kind)) {
    if (!Array.isArray(stimulus.script) || stimulus.script.length === 0) {
      fail(where, "script wajib untuk stimulus audio");
    }
    for (const [lineIndex, line] of (stimulus.script ?? []).entries()) {
      if (!nonEmpty(line.speaker) || !nonEmpty(line.jp)) {
        fail(`${where}.script[${lineIndex}]`, "speaker/jp kosong");
      }
    }
    if (!isPlainObject(stimulus.audio)) fail(where, "audio wajib untuk stimulus audio");
  }

  if (["passage", "notice", "email"].includes(stimulus.kind) && !nonEmpty(stimulus.body)) {
    fail(where, "body wajib untuk stimulus teks");
  }
  if (stimulus.kind === "table") {
    if (!isPlainObject(stimulus.table) || !Array.isArray(stimulus.table.rows)) {
      fail(where, "table wajib untuk stimulus tabel");
    }
  }
  if (isPlainObject(stimulus.audio)) {
    if (![1, 2].includes(stimulus.audio.play_limit)) {
      fail(where, "audio.play_limit harus 1 atau 2");
    }
    if (typeof stimulus.audio.duration_sec !== "number" || stimulus.audio.duration_sec <= 0) {
      fail(where, "audio.duration_sec tidak valid");
    }
  }
  stimuli.set(stimulus.id, stimulus);
}

/* ------------------------------------------------------------------ *
 * Butir
 * ------------------------------------------------------------------ */

const items = new Map();
const stemIndex = new Map();
const statusCounts = new Map();
let dualTagged = 0;

const requiredItemFields = [
  "id",
  "schema_version",
  "status",
  "exam_family",
  "level",
  "test_section",
  "scoring_section",
  "item_type",
  "instruction",
  "stem",
  "options",
  "answer_key",
  "explanation",
  "knowledge_tags",
  "skill_tags",
  "difficulty",
  "accessibility",
  "exposure",
  "provenance",
  "time_estimate_sec",
  "version",
  "created_at",
  "updated_at",
];

const statuses = ["draft", "content_review", "native_review", "pilot", "published", "superseded", "retired"];
const correctScoringBySection = {
  "moji-goi": "language-reading",
  bunpou: "language-reading",
  dokkai: "language-reading",
  choukai: "listening",
  "script-vocab": "jft-sv",
  "conversation-expression": "jft-ce",
  listening: "jft-lc",
  reading: "jft-rc",
};

const featureKeys = [
  "lexical_rarity",
  "kanji_load",
  "syntax_depth",
  "inference",
  "distractor_similarity",
  "processing",
  "register",
];

for (const [index, item] of (bank.items ?? []).entries()) {
  const where = `items[${index}] (${item.id ?? "tanpa-id"})`;

  for (const field of requiredItemFields) {
    if (!(field in item)) fail(where, `field wajib "${field}" tidak ada`);
  }
  if (typeof item.id !== "string" || !/^MR-(N[1-5]|JFT)-[A-Z]{1,3}-[A-Z]{2,3}-[0-9]{4}$/.test(item.id)) {
    fail(where, `id tidak sesuai konvensi: ${item.id}`);
  }
  if (items.has(item.id)) fail(where, `id duplikat ${item.id}`);
  if (item.schema_version !== "1.0.0") fail(where, "schema_version harus 1.0.0");
  if (!statuses.includes(item.status)) fail(where, `status tidak valid: ${item.status}`);
  statusCounts.set(item.status, (statusCounts.get(item.status) ?? 0) + 1);
  if (!["jlpt", "jft"].includes(item.exam_family)) fail(where, "exam_family tidak valid");

  const type = itemTypes.get(item.item_type);
  if (!type) {
    fail(where, `item_type "${item.item_type}" tidak ada di taksonomi`);
  } else {
    if (type.exam_family !== item.exam_family) fail(where, "exam_family tidak cocok dengan taksonomi");
    if (type.section !== item.test_section) fail(where, "test_section tidak cocok dengan taksonomi");
    if (Array.isArray(item.options) && item.options.length !== type.option_count) {
      fail(where, `jumlah opsi ${item.options.length}, taksonomi ${type.option_count}`);
    }
    if (item.exam_family === "jlpt") {
      if (!type.levels.includes(item.level)) {
        fail(where, `level ${item.level} tidak terdaftar untuk ${item.item_type}`);
      }
    } else if (item.level !== null) {
      fail(where, "butir JFT harus level null");
    }
  }

  if (correctScoringBySection[item.test_section] !== item.scoring_section) {
    fail(
      where,
      `scoring_section "${item.scoring_section}" tidak cocok untuk test_section "${item.test_section}"`,
    );
  }

  if (!nonEmpty(item.stem)) fail(where, "stem kosong");
  if (!isPlainObject(item.instruction) || !nonEmpty(item.instruction.id)) {
    fail(where, "instruction.id kosong");
  }

  if (!Array.isArray(item.options) || item.options.length < 3 || item.options.length > 4) {
    fail(where, "options harus 3-4");
  } else {
    const keys = new Set();
    const texts = new Set();
    let correct = 0;
    for (const [optionIndex, option] of item.options.entries()) {
      const optionWhere = `${where}.options[${optionIndex}]`;
      if (!["a", "b", "c", "d"].includes(option.key)) fail(optionWhere, "key tidak valid");
      if (keys.has(option.key)) fail(optionWhere, `key duplikat ${option.key}`);
      keys.add(option.key);
      if (!nonEmpty(option.text)) fail(optionWhere, "text kosong");
      if (texts.has(normalize(option.text))) fail(optionWhere, "text opsi duplikat");
      texts.add(normalize(option.text));
      if (typeof option.is_correct !== "boolean") fail(optionWhere, "is_correct harus boolean");
      if (!nonEmpty(option.rationale)) fail(optionWhere, "rationale kosong");
      if (option.is_correct) correct += 1;
    }
    if (correct !== 1) fail(where, `harus tepat 1 kunci, ditemukan ${correct}`);
    if (Array.isArray(item.answer_key)) {
      if (item.answer_key.length !== 1) fail(where, "answer_key harus berisi 1 kunci");
      const keyed = item.options.find((option) => option.key === item.answer_key[0]);
      if (!keyed || keyed.is_correct !== true) {
        fail(where, "answer_key tidak menunjuk opsi yang is_correct");
      }
    } else {
      fail(where, "answer_key harus array");
    }
  }

  const explanation = item.explanation;
  if (!isPlainObject(explanation)) {
    fail(where, "explanation harus object");
  } else {
    for (const field of ["short", "rule", "contrast", "transfer"]) {
      if (!nonEmpty(explanation[field])) fail(where, `explanation.${field} kosong`);
    }
  }

  if (!Array.isArray(item.knowledge_tags) || item.knowledge_tags.length === 0) {
    fail(where, "knowledge_tags minimal 1");
  } else {
    for (const tag of item.knowledge_tags) {
      if (!["vocab", "kanji", "grammar", "function", "scenario", "particle"].includes(tag.type)) {
        fail(where, `knowledge_tag.type tidak valid: ${tag.type}`);
      }
      if (!nonEmpty(tag.id)) fail(where, "knowledge_tag.id kosong");
    }
  }
  if (!Array.isArray(item.skill_tags) || item.skill_tags.length === 0) {
    fail(where, "skill_tags minimal 1");
  }

  const refs = item.stimulus_refs ?? [];
  if (!Array.isArray(refs)) {
    fail(where, "stimulus_refs harus array");
  } else {
    for (const ref of refs) {
      if (!stimuli.has(ref)) fail(where, `stimulus_ref "${ref}" tidak ditemukan`);
    }
  }

  const needsStimulus = ["R.SH", "R.MD", "R.IR", "L.TB", "L.KP", "L.VE", "L.QR", "B.TG", "L.CV", "L.SH", "L.AN", "R.CT", "R.IS"].includes(item.item_type);
  if (needsStimulus && refs.length !== 1) {
    fail(where, `${item.item_type} harus merujuk tepat 1 stimulus`);
  }
  if (refs.length > 0) {
    const stimulus = stimuli.get(refs[0]);
    if (stimulus) {
      if (item.item_type.startsWith("L.")) {
        if (!["dialogue", "announcement", "utterance"].includes(stimulus.kind)) {
          fail(where, "butir listening harus memakai stimulus audio");
        }
      }
      if (item.item_type.startsWith("R.")) {
        if (!["passage", "notice", "email", "table"].includes(stimulus.kind)) {
          fail(where, "butir reading harus memakai stimulus teks/tabel");
        }
      }
      if (item.item_type === "B.TG" && !["passage", "notice", "email"].includes(stimulus.kind)) {
        fail(where, "B.TG harus memakai stimulus teks");
      }
    }
  }
  if (item.item_type === "B.TG" && (!Number.isInteger(item.blank_index) || item.blank_index < 1)) {
    fail(where, "B.TG harus punya blank_index >= 1");
  }

  const difficulty = item.difficulty;
  if (!isPlainObject(difficulty)) {
    fail(where, "difficulty harus object");
  } else {
    if (!Number.isInteger(difficulty.band) || difficulty.band < 1 || difficulty.band > 5) {
      fail(where, "difficulty.band harus 1-5");
    }
    if (typeof difficulty.prior_logit !== "number") fail(where, "difficulty.prior_logit harus angka");
    const features = difficulty.features ?? {};
    for (const key of featureKeys) {
      if (typeof features[key] !== "number" || features[key] < 0 || features[key] > 3) {
        fail(where, `difficulty.features.${key} harus 0-3`);
      }
    }
    const computed =
      0.2 * (features.lexical_rarity ?? 0) +
      0.15 * (features.kanji_load ?? 0) +
      0.2 * (features.syntax_depth ?? 0) +
      0.2 * (features.inference ?? 0) +
      0.15 * (features.distractor_similarity ?? 0) +
      0.05 * (features.processing ?? 0) +
      0.05 * (features.register ?? 0);
    const rounded = Math.round(computed * 100) / 100;
    const computedBand =
      rounded <= 0.6 ? 1 : rounded <= 1.2 ? 2 : rounded <= 1.8 ? 3 : rounded <= 2.4 ? 4 : 5;
    if (computedBand !== difficulty.band) {
      warn(where, `band ${difficulty.band} tidak cocok dengan skor fitur ${computed.toFixed(2)} (band ${computedBand})`);
    }
    const calibration = difficulty.calibration;
    if (!isPlainObject(calibration) || !Number.isInteger(calibration.n) || calibration.n < 0) {
      fail(where, "difficulty.calibration.n harus integer >= 0");
    }
    if (item.status === "published" && calibration?.n === 0) {
      warn(where, "butir published belum punya data kalibrasi");
    }
  }

  if (!["off", "on-demand", "always"].includes(item.accessibility?.furigana_policy)) {
    fail(where, "accessibility.furigana_policy tidak valid");
  }
  if (typeof item.accessibility?.extended_time_ok !== "boolean") {
    fail(where, "accessibility.extended_time_ok harus boolean");
  }
  if (!isPlainObject(item.exposure)) {
    fail(where, "exposure harus object");
  } else {
    if (typeof item.exposure.form_eligible !== "boolean") fail(where, "exposure.form_eligible harus boolean");
    if (!Number.isInteger(item.exposure.max_exposure_per_user_days) || item.exposure.max_exposure_per_user_days < 0) {
      fail(where, "exposure.max_exposure_per_user_days tidak valid");
    }
    if (!Array.isArray(item.exposure.enemy_ids)) fail(where, "exposure.enemy_ids harus array");
  }
  if (!isPlainObject(item.provenance)) {
    fail(where, "provenance harus object");
  } else {
    for (const field of ["author", "reviewer", "source", "license"]) {
      if (!nonEmpty(item.provenance[field])) fail(where, `provenance.${field} kosong`);
    }
    if (typeof item.provenance.native_review !== "boolean") fail(where, "provenance.native_review harus boolean");
    if (typeof item.provenance.ai_assisted !== "boolean") fail(where, "provenance.ai_assisted harus boolean");
  }
  if (!Number.isInteger(item.time_estimate_sec) || item.time_estimate_sec < 5 || item.time_estimate_sec > 600) {
    fail(where, "time_estimate_sec harus 5-600");
  }

  if (Array.isArray(item.also_valid_for)) {
    dualTagged += item.also_valid_for.length;
    for (const alias of item.also_valid_for) {
      if (!itemTypes.has(alias.item_type)) {
        fail(where, `also_valid_for.item_type tidak ada: ${alias.item_type}`);
      }
    }
  }

  const stemKey = `${item.item_type}|${refs[0] ?? ""}|${normalize(item.stem)}`;
  if (stemIndex.has(stemKey)) {
    fail(where, `stem duplikat dengan ${stemIndex.get(stemKey)}`);
  } else {
    stemIndex.set(stemKey, item.id);
  }

  items.set(item.id, item);
}

/* ------------------------------------------------------------------ *
 * Form blueprint
 * ------------------------------------------------------------------ */

const formIds = new Set();
for (const [index, form] of (bank.form_blueprints ?? []).entries()) {
  const where = `form_blueprints[${index}] (${form.id ?? "tanpa-id"})`;
  if (!nonEmpty(form.id)) fail(where, "id kosong");
  if (formIds.has(form.id)) fail(where, `id duplikat ${form.id}`);
  formIds.add(form.id);
  if (!["jlpt", "jft"].includes(form.exam_family)) fail(where, "exam_family tidak valid");
  if (typeof form.minutes !== "number" || form.minutes <= 0) fail(where, "minutes tidak valid");
  if (!Number.isInteger(form.total_items) || form.total_items <= 0) fail(where, "total_items tidak valid");

  let sectionTotal = 0;
  for (const [sectionIndex, section] of (form.sections ?? []).entries()) {
    const sectionWhere = `${where}.sections[${sectionIndex}]`;
    if (!nonEmpty(section.key)) fail(sectionWhere, "key kosong");
    if (!Number.isInteger(section.items) || section.items <= 0) fail(sectionWhere, "items tidak valid");
    sectionTotal += section.items ?? 0;
    let distributionTotal = 0;
    for (const [typeCode, count] of Object.entries(section.distribution ?? {})) {
      if (!itemTypes.has(typeCode)) fail(sectionWhere, `distribution item_type tidak dikenal: ${typeCode}`);
      if (!Number.isInteger(count) || count < 0) fail(sectionWhere, `distribution ${typeCode} tidak valid`);
      distributionTotal += count ?? 0;
    }
    if (distributionTotal !== section.items) {
      fail(sectionWhere, `distribusi ${distributionTotal} != items ${section.items}`);
    }
  }
  if (sectionTotal !== form.total_items) {
    fail(where, `jumlah seksi ${sectionTotal} != total_items ${form.total_items}`);
  }

  const mix = form.constraints?.difficulty_mix;
  if (isPlainObject(mix)) {
    const mixTotal = Object.values(mix).reduce((sum, value) => sum + value, 0);
    if (Math.abs(mixTotal - 1) > 0.001) fail(where, `difficulty_mix berjumlah ${mixTotal}, harus 1`);
  }

  const profileCode = form.scoring?.profile;
  if (profileCode && !scoringProfiles.has(profileCode)) {
    fail(where, `scoring profile "${profileCode}" tidak ditemukan`);
  }
  if (profileCode && scoringProfiles.has(profileCode)) {
    const profile = scoringProfiles.get(profileCode);
    const formSections = form.scoring?.sections ?? [];
    if (profile.exam_family !== form.exam_family) fail(where, "scoring profile beda exam_family");
    if (form.scoring?.overall_pass !== profile.config.overall_pass) {
      fail(where, "overall_pass tidak cocok dengan profil skor");
    }
    if (formSections.length !== profile.config.sections.length) {
      fail(where, "jumlah seksi skor tidak cocok dengan profil");
    }
    for (const section of formSections) {
      const match = profile.config.sections.find((candidate) => candidate.key === section.key);
      if (!match) fail(where, `seksi skor "${section.key}" tidak ada di profil`);
      else if (match.max !== section.max || match.min_pass !== section.min_pass) {
        fail(where, `seksi skor "${section.key}" tidak cocok dengan profil`);
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 * Ringkasan
 * ------------------------------------------------------------------ */

const byFamily = {};
const byLevel = {};
const byType = {};
for (const item of items.values()) {
  byFamily[item.exam_family] = (byFamily[item.exam_family] ?? 0) + 1;
  const level = item.level ?? "JFT";
  byLevel[level] = (byLevel[level] ?? 0) + 1;
  byType[item.item_type] = (byType[item.item_type] ?? 0) + 1;
}

const missingTypes = activeTypes.filter((code) => !byType[code]);
const duplicateStimuli = [];

console.log(`Bank: ${absolute}`);
console.log(`Butir: ${items.size} · Stimulus: ${stimuli.size} · Form blueprint: ${formIds.size}`);
console.log(`Per family: ${JSON.stringify(byFamily)}`);
console.log(`Per level: ${JSON.stringify(byLevel)}`);
console.log(`Status: ${JSON.stringify(Object.fromEntries(statusCounts))}`);
console.log(`Butir dual-tag (also_valid_for): ${dualTagged}`);
console.log(`Tipe aktif belum ada butir contoh: ${missingTypes.length ? missingTypes.join(", ") : "tidak ada"}`);
if (duplicateStimuli.length) console.log(`Stimulus ganda: ${duplicateStimuli.join(", ")}`);

if (warnings.length) {
  console.log(`\nWarning (${warnings.length}):`);
  for (const message of warnings) console.log(`  - ${message}`);
}

if (errors.length) {
  console.error(`\nError (${errors.length}):`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exitCode = 1;
} else {
  console.log("\nOK: tidak ada error.");
}
