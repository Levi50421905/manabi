/**
 * Kredit & sumber data terbuka yang dipakai Manabi.
 * Cantumkan di halaman "Tentang" agar patuh pada lisensi masing-masing sumber.
 */
export interface Credit {
  name: string;
  url: string;
  license: string;
  usage: string;
}

export const SOURCE_CREDITS: Credit[] = [
  {
    name: "JMDict",
    url: "https://www.edrdg.org/jmdict/j_jmdict.html",
    license: "Creative Commons BY-SA 3.0",
    usage: "Arti & bacaan kosakata",
  },
  {
    name: "KanjiVG",
    url: "https://kanjivg.tagaini.net/",
    license: "Creative Commons BY-SA 3.0",
    usage: "Urutan goresan kanji (SVG)",
  },
  {
    name: "Tatoeba",
    url: "https://tatoeba.org/",
    license: "Creative Commons BY 2.0 FR",
    usage: "Contoh kalimat & terjemahan",
  },
  {
    name: "KANJIDIC2",
    url: "https://www.edrdg.org/wiki/index.php/KANJIDIC_Project",
    license: "Creative Commons BY-SA 3.0",
    usage: "Metadata kanji (radikal, goresan, level)",
  },
  {
    name: "Web Speech API",
    url: "https://developer.mozilla.org/docs/Web/API/Web_Speech_API",
    license: "Standar browser",
    usage: "Pelafalan audio (TTS) di MVP",
  },
];
