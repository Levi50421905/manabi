/**
 * Romaji untuk halaman Konteks & Etiket.
 *
 * Dipisah dari data utama agar penulisan romaji bisa konsisten dan mudah
 * direview. Kunci memakai id skenario/verba/kartu, bukan teks Jepang, supaya
 * tidak bentrok saat ada kalimat yang mirip.
 */

export const REGISTER_ROMAJI: Record<string, string> = {
  "register:nama:akrab": "namae, nani?",
  "register:nama:teman": "namae, nan te iu no?",
  "register:nama:atasan": "o-namae o ukagatte mo yoroshii desu ka",
  "register:nama:asing": "o-namae wa nan desu ka",

  "register:taberu:akrab": "taberu?",
  "register:taberu:teman": "taberu no?",
  "register:taberu:atasan": "meshiagarimasu ka",
  "register:taberu:asing": "tabemasu ka",

  "register:nanji:akrab": "nanji?",
  "register:nanji:teman": "nanji na no?",
  "register:nanji:atasan": "nanji de gozaimashou ka",
  "register:nanji:asing": "nanji desu ka",

  "register:toire:akrab": "toire itte ii?",
  "register:toire:teman": "toire, itte mo ii?",
  "register:toire:atasan": "o-tearai o karite mo yoroshii desu ka",
  "register:toire:asing": "o-tearai ni itte mo ii desu ka",

  "register:kotowaru:akrab": "gomen, muri",
  "register:kotowaru:teman": "gomen, sono hi wa chotto",
  "register:kotowaru:atasan": "ainiku yotei ga gozaimashite",
  "register:kotowaru:asing": "moushiwake arimasen ga, sono hi wa tsugou ga warui desu",

  "register:denwa:akrab": "moshi moshi",
  "register:denwa:teman": "moshi moshi, genki?",
  "register:denwa:atasan": "osewa ni natte orimasu",
  "register:denwa:asing": "moshi moshi, Tanaka-san no otaku desu ka",
};

export const KEIGO_ROMAJI: Record<
  string,
  { teinei: string; sonkeigo: string; kenjougo: string }
> = {
  "keigo:iku": { teinei: "ikimasu", sonkeigo: "irassharu", kenjougo: "ukagau / mairu" },
  "keigo:kuru": { teinei: "kimasu", sonkeigo: "irassharu", kenjougo: "mairu" },
  "keigo:iru": { teinei: "imasu", sonkeigo: "irassharu", kenjougo: "oru" },
  "keigo:iu": { teinei: "iimasu", sonkeigo: "ossharu", kenjougo: "mousu / moushiageru" },
  "keigo:miru": { teinei: "mimasu", sonkeigo: "goran ni naru", kenjougo: "haiken suru" },
  "keigo:taberu": {
    teinei: "tabemasu / nomimasu",
    sonkeigo: "meshiagaru",
    kenjougo: "itadaku",
  },
  "keigo:suru": { teinei: "shimasu", sonkeigo: "nasaru", kenjougo: "itasu" },
  "keigo:au": { teinei: "aimasu", sonkeigo: "o-ai ni naru", kenjougo: "o-me ni kakaru" },
  "keigo:kiku": { teinei: "kikimasu", sonkeigo: "o-kiki ni naru", kenjougo: "ukagau" },
  "keigo:shiru": {
    teinei: "shitte imasu",
    sonkeigo: "go-zonji desu",
    kenjougo: "zonjite orimasu",
  },
  "keigo:yomu": { teinei: "yomimasu", sonkeigo: "o-yomi ni naru", kenjougo: "haidoku suru" },
  "keigo:kaku": { teinei: "kakimasu", sonkeigo: "o-kaki ni naru", kenjougo: "o-kaki suru" },
  "keigo:matsu": { teinei: "machimasu", sonkeigo: "o-machi ni naru", kenjougo: "o-machi suru" },
  "keigo:kariru": {
    teinei: "karimasu",
    sonkeigo: "o-kari ni naru",
    kenjougo: "haishaku suru",
  },
};

export const CONTEXT_ROMAJI: Record<string, string> = {
  "konteks:tawa": "haha / fufu / gufufu / pu / ho",
  "konteks:ittekimasu": "ittekimasu / itterasshai",
  "konteks:itadakimasu": "itadakimasu / gochisousama",
  "konteks:sumimasen": "sumimasen",
  "konteks:hai": "hai / chotto…",
  "konteks:moshi": "moshi moshi",
  "konteks:o-go": "o-namae / go-renraku",
  "konteks:namae": "namae no yomikata",
  "konteks:daijoubu": "daijoubu desu",
  "konteks:soroeru": "kuuki o yomu / soroeru",
  "konteks:otsukare": "otsukaresama desu",
  "konteks:onomatope": "pokapoka / dokidoki / kirakira",
  "praktis:gomi": "gomi no bunbetsu / gomi no hi",
  "praktis:kenbaiki": "shokken / kenbaiki",
  "praktis:mochikaeri": "tennai de / omochikaeri",
  "praktis:jihanki": "jihanki",
  "praktis:jishin": "jishin / anzen kakuhō",
  "praktis:hinan": "hinanjo / tsunami",
  "praktis:sim": "SIM kādo / eSIM / honnin kakunin",
  "praktis:bank": "kōza kaisetsu / tsūchō / kyasshu kādo",
  "praktis:atm": "o-azukeire / o-hikidashi / furikomi",
  "praktis:yakusho": "tennyūtodoke / jūminhyō / Mainanbā",
  "praktis:chintai": "chintai / shikikin・reikin / hoshōgaisha",
  "praktis:utilities": "denki・gasu・suidō / kaitsū",
};
