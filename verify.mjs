// Kontrollerar den rena generatorn och växlingen i public/app.js:
//  – nivå 1 ger 2–9 med bara ett-tecknet, nivå 2 ger 11–199 med 1/10/100,
//    nivå 3 ger 3–19 med 1 och 5 (maya),
//  – talordet stämmer mot en oberoende tabell för 0–199,
//  – frågan innehåller talordet,
//  – ett kanoniskt bygge (rätt antal av varje tecken) ger alltid exakt talet,
//  – växlingen bevarar värdet och lämnar ett kanoniskt bygge,
//  – teckenbrickorna räcker för varje mål.
//   node verify.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("./public/app.js", import.meta.url), "utf8");
const start = src.indexOf("var RUNDA = [");
const end = src.indexOf("* 3. Kotten");
if (start < 0 || end < 0) throw new Error("hittar inte den rena generatorn i app.js");
const ren = src.slice(start, src.lastIndexOf("/*", end));
const G = eval("(function(){" + ren + "\nreturn {uppgift:uppgift, talord:talord, vaxla:vaxla, varde:varde, kanonisk:kanonisk, antal:antal, taBortEttor:taBortEttor};})()");

// Oberoende tabell 0–199, skriven för hand (inte samma kodväg).
const E = ["noll", "ett", "två", "tre", "fyra", "fem", "sex", "sju", "åtta", "nio",
  "tio", "elva", "tolv", "tretton", "fjorton", "femton", "sexton", "sjutton", "arton", "nitton"];
const T = ["", "tio", "tjugo", "trettio", "fyrtio", "femtio", "sextio", "sjuttio", "åttio", "nittio"];
const H = ["", "etthundra", "tvåhundra", "trehundra", "fyrahundra"];
const facit = (n) => n < 20 ? E[n] : n < 100 ? T[Math.floor(n / 10)] + (n % 10 ? E[n % 10] : "")
  : H[Math.floor(n / 100)] + (n % 100 ? " " + facit(n % 100) : "");

let seed = 20261125;
Math.random = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

let fel = 0;
const kolla = (c, m, p) => { if (!c) { fel++; if (fel <= 25) console.log("FEL", m, JSON.stringify(p)); } };
const sedda = { 1: new Set(), 2: new Set(), 3: new Set() };

for (let n = 0; n <= 199; n++) kolla(G.talord(n) === facit(n), "fel talord för " + n + ": " + G.talord(n));

for (let k = 0; k < 30000; k++) {
  for (const niva of [1, 2, 3]) {
    const p = G.uppgift(niva);
    sedda[niva].add(p.tal);
    kolla(p.niva === niva, "fel nivå", p.niva);
    kolla(p.ord === facit(p.tal), "fel ord", p);
    kolla(p.fraga === "Bygg " + facit(p.tal) + ".", "fel fråga", p);
    kolla(p.tal > 0, "talet är noll eller negativt", p);

    if (niva === 1) {
      kolla(p.system === "egypt", "nivå 1 ska vara egyptisk", p);
      kolla(p.tal >= 2 && p.tal <= 9, "nivå 1 utanför 2–9", p);
      kolla(p.tecken.length === 1 && p.tecken[0] === 1, "nivå 1 ska bara ha ett-tecknet", p);
    } else if (niva === 2) {
      kolla(p.system === "egypt", "nivå 2 ska vara egyptisk", p);
      kolla(p.tal >= 11 && p.tal <= 199, "nivå 2 utanför 11–199", p);
      kolla(p.tecken.join(",") === "1,10,100", "nivå 2 ska ha 1, 10 och 100", p);
    } else {
      kolla(p.system === "maya", "nivå 3 ska vara maya", p);
      kolla(p.tal >= 3 && p.tal <= 19, "nivå 3 utanför 3–19", p);
      kolla(p.tecken.join(",") === "1,5", "nivå 3 ska ha 1 och 5", p);
    }

    // Bygg målet tecken för tecken med bara brickornas tecken, via växlingen.
    let sym = [];
    let guard = 0;
    while (G.varde(sym) < p.tal && guard++ < 400) {
      sym = G.vaxla(sym.concat([1]), p.system).sym;
    }
    kolla(G.varde(sym) === p.tal, "kanoniskt bygge ger inte talet", { p, sym });
    kolla(G.kanonisk(sym, p.system), "bygget är inte kanoniskt", { p, sym });
    if (p.system === "maya") kolla(G.antal(sym, 1) < 5, "fem prickar kvar", sym);
    else kolla(G.antal(sym, 1) < 10 && G.antal(sym, 10) < 10, "tio av ett tecken kvar", sym);

    // Teckenbrickorna måste räcka: varje siffra i talet kan byggas.
    if (p.system === "egypt") {
      const ental = p.tal % 10, tiotal = Math.floor(p.tal / 10) % 10, hundra = Math.floor(p.tal / 100);
      kolla(ental <= 9 && tiotal <= 9 && hundra <= 4, "siffra utanför vad brickorna klarar", p);
    }
  }
}

// Växlingen: slumpade sekvenser, värdet bevaras och resultatet är kanoniskt.
for (let k = 0; k < 20000; k++) {
  const system = k % 2 ? "maya" : "egypt";
  const möjliga = system === "maya" ? [1, 5] : [1, 10, 100];
  let sym = [];
  for (let i = 0; i < 40; i++) sym.push(möjliga[Math.floor(Math.random() * möjliga.length)]);
  const före = G.varde(sym);
  const efter = G.vaxla(sym, system).sym;
  kolla(G.varde(efter) === före, "växlingen ändrade värdet", { system, sym, efter });
  kolla(G.kanonisk(efter, system), "växlingen gav inte kanoniskt bygge", { system, efter });
  if (system === "maya") {
    kolla(G.antal(efter, 1) + 5 * G.antal(efter, 5) === före, "maya-värdet stämmer inte", efter);
  } else {
    kolla(G.antal(efter, 1) + 10 * G.antal(efter, 10) + 100 * G.antal(efter, 100) === före, "egypt-värdet stämmer inte", efter);
  }
}

// Nivåerna ska spänna över sina intervall.
const krävs = { 1: [2, 9], 2: [11, 199], 3: [3, 19] };
for (const n of [1, 2, 3]) {
  const min = Math.min(...sedda[n]), max = Math.max(...sedda[n]);
  kolla(min === krävs[n][0], "nivå " + n + " når inte nedre gränsen", min);
  kolla(max === krävs[n][1], "nivå " + n + " når inte övre gränsen", max);
  kolla(sedda[n].size === krävs[n][1] - krävs[n][0] + 1, "nivå " + n + " saknar tal", sedda[n].size);
}
// Nivå 2 måste ge både tvåsiffriga tal och hundratal.
let tvåsiffriga = 0, hundratal = 0;
for (let k = 0; k < 5000; k++) { const t = G.uppgift(2).tal; if (t < 100) tvåsiffriga++; else hundratal++; }
kolla(tvåsiffriga > 1000 && hundratal > 200, "nivå 2 blandar inte tvåsiffriga och hundratal", { tvåsiffriga, hundratal });

// Kotten ska finnas med fem uttryck i app.js.
for (const u of ["hejar", "firar", "tanker", "funderar", '"glad"']) {
  kolla(src.includes(u), "Kotten-uttryck saknas: " + u);
}

if (fel) { console.log("\n" + fel + " fel"); process.exit(1); }
console.log("0 fel – " + (30000 * 3) + " uppgifter, 20000 växlingar, 200 talord kontrollerade.");