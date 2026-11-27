/* Sifferfolken – bygg tal med tecken från förr.
   Statisk app, inga beroenden. Tränar MA.1-3.1.3 (talsymbolernas utveckling i
   olika kulturer). Egyptiska hieroglyfer: streck 1, hälben 10, repspiral 100,
   additivt med bas tio. Maya: prick 1, stapel 5. Allt ritas i kod (SVG),
   Kotten är egen SVG, ljud i WebAudio + talsyntes. Uppgiftsgeneratorn är en
   ren funktion som verify.mjs kontrollerar. */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- *
   * 1. Tecknen                                                       *
   * ---------------------------------------------------------------- */
  var INK = "#3b2f22";

  function glyf(v, system) {
    if (system === "maya") {
      if (v === 1) return '<circle cx="50" cy="50" r="26" fill="' + INK + '"/>';
      return '<rect x="6" y="37" width="88" height="26" rx="13" fill="' + INK + '"/>';
    }
    if (v === 1) return '<rect x="42" y="8" width="16" height="84" rx="7" fill="' + INK + '"/>';
    if (v === 10) return '<path d="M20 90 L20 46 A30 30 0 0 1 80 46 L80 90" fill="none" stroke="' + INK + '" stroke-width="16"/>';
    return '<circle cx="50" cy="48" r="27" fill="none" stroke="' + INK + '" stroke-width="11"/>' +
      '<path d="M69 68 L88 89" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/>';
  }

  function glyfSvg(v, system, extraKlass) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true"' + (extraKlass ? ' class="' + extraKlass + '"' : "") + '>' +
      glyf(v, system) + "</svg>";
  }

  function teckenNamn(v, system) {
    if (system === "maya") return v === 1 ? "en prick" : "en stapel";
    if (v === 1) return "ett streck";
    if (v === 10) return "ett hälben";
    return "en repspiral";
  }

  /* ---------------------------------------------------------------- *
   * 2. Uppgifter (ren funktion – verify.mjs prövar den)              *
   * ---------------------------------------------------------------- */
  var RUNDA = [0, 5, 6, 6];
  var TALORD = ["noll", "ett", "två", "tre", "fyra", "fem", "sex", "sju", "åtta",
    "nio", "tio", "elva", "tolv", "tretton", "fjorton", "femton", "sexton",
    "sjutton", "arton", "nitton"];
  var TIOTAL = ["", "tio", "tjugo", "trettio", "fyrtio", "femtio", "sextio",
    "sjuttio", "åttio", "nittio"];
  var HUNDRA = ["", "etthundra", "tvåhundra", "trehundra", "fyrahundra"];

  function talord(n) {
    if (n < 20) return TALORD[n];
    if (n < 100) {
      var t = Math.floor(n / 10), e = n % 10;
      return TIOTAL[t] + (e ? TALORD[e] : "");
    }
    var h = Math.floor(n / 100), r = n % 100;
    return HUNDRA[h] + (r ? " " + talord(r) : "");
  }

  function heltal(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  /* Nivå 1: Egypten 1–9. Nivå 2: Egypten 10–199. Nivå 3: Maya 1–19. */
  function uppgift(niva) {
    niva = niva === 2 || niva === 3 ? niva : 1;
    var tal, system, tecken;
    if (niva === 1) { tal = heltal(2, 9); system = "egypt"; tecken = [1]; }
    else if (niva === 2) {
      tal = Math.random() < 0.22 ? heltal(100, 199) : heltal(11, 99);
      system = "egypt"; tecken = [1, 10, 100];
    } else { tal = heltal(3, 19); system = "maya"; tecken = [1, 5]; }
    return {
      niva: niva, system: system, tal: tal, ord: talord(tal), tecken: tecken,
      fraga: "Bygg " + talord(tal) + "."
    };
  }

  /* Kanoniskt bygge: Egypten har högst nio av varje tecken, Maya högst fyra
     prickar (fem blir en stapel). */
  function antal(sym, v) {
    var n = 0, i;
    for (i = 0; i < sym.length; i++) if (sym[i] === v) n++;
    return n;
  }
  function varde(sym) {
    var s = 0, i;
    for (i = 0; i < sym.length; i++) s += sym[i];
    return s;
  }
  function kanonisk(sym, system) {
    if (system === "maya") return antal(sym, 1) < 5;
    return antal(sym, 1) < 10 && antal(sym, 10) < 10;
  }

  /* Växlingen: tio ett-tecken blir ett tio-tecken, tio tio-tecken blir ett
     hundra, fem prickar blir en stapel. Värdet bevaras. */
  function vaxla(sym, system) {
    var ut = sym.slice(), bytte = null;
    if (system === "maya") {
      while (antal(ut, 1) >= 5) {
        ut = taBortEttor(ut, 5, 1);
        ut.push(5);
        bytte = 5;
      }
      return { sym: ut, bytte: bytte };
    }
    while (antal(ut, 1) >= 10) {
      ut = taBortEttor(ut, 10, 1);
      ut.push(10);
      bytte = 10;
    }
    while (antal(ut, 10) >= 10) {
      ut = taBortEttor(ut, 10, 10);
      ut.push(100);
      bytte = 100;
    }
    return { sym: ut, bytte: bytte };
  }

  function taBortEttor(sym, n, vardeAttTa) {
    var v = vardeAttTa || 1, kvar = n, ut = [], i;
    for (i = 0; i < sym.length; i++) {
      if (sym[i] === v && kvar > 0) { kvar--; continue; }
      ut.push(sym[i]);
    }
    return ut;
  }

  /* ---------------------------------------------------------------- *
   * 3. Kotten (egen SVG, fem uttryck – samma familj)                 *
   * ---------------------------------------------------------------- */
  function kottenSvg(uttryck, klass) {
    var F = "#b07d4b", M = "#8a5f36", O = "#2b2118", mun, ogen = "", extra = "";
    if (uttryck === "hejar") { mun = '<path d="M22 36 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else if (uttryck === "firar") {
      mun = '<path d="M21 34 q9 12 18 0" fill="#fff"/><path d="M21 34 q9 12 18 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>';
      extra = '<path d="M10 12 l3 6M50 12 l-3 6M30 6 v5" stroke="#e8a33d" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
    }
    else if (uttryck === "tanker") { mun = '<path d="M24 37 h11" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round" fill="none"/>'; ogen = '<circle cx="46" cy="24" r="4" fill="none" stroke="' + M + '" stroke-width="1.6" opacity=".5"/>'; }
    else if (uttryck === "funderar") { mun = '<path d="M22 38 q8 -6 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else if (uttryck === "glad") { mun = '<path d="M22 34 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else { mun = '<path d="M22 34 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    var oga = '<circle cx="23" cy="24" r="5.2" fill="#fff"/><circle cx="37" cy="24" r="5.2" fill="#fff"/>' +
      '<circle cx="24" cy="24.6" r="2.5" fill="' + O + '"/><circle cx="36" cy="24.6" r="2.5" fill="' + O + '"/>';
    return '<svg class="' + (klass || "kotten-svg") + '" viewBox="0 0 60 60" aria-hidden="true">' + extra +
      '<path d="M30 6 q9 4 12 12 q9 12 4 24 q-4 12 -16 14 q-12 -2 -16 -14 q-5 -12 4 -24 q3 -8 12 -12z" fill="' + F + '"/>' +
      '<path d="M19 20 q11 -5 22 0M16 30 q14 -5 28 0M16 40 q14 -4 28 0" stroke="' + M + '" stroke-width="1.7" fill="none" opacity=".85" stroke-linecap="round"/>' +
      oga + ogen + mun + "</svg>";
  }

  /* ---------------------------------------------------------------- *
   * 4. Ljud                                                          *
   * ---------------------------------------------------------------- */
  var ac = null, ljudPa = true;
  function ljud(frekvens, längd, typ) {
    if (!ljudPa) return;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = typ || "sine"; o.frequency.value = frekvens;
      g.gain.value = 0.001; o.connect(g); g.connect(ac.destination);
      var t = ac.currentTime;
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + längd);
      o.start(t); o.stop(t + längd + 0.02);
    } catch (e) { }
  }
  function sag(text) {
    if (!ljudPa || !text) return;
          try { if (window.__rost && window.__rost(text, true)) return; } catch (e) { }
        console.warn('saknar mp3:', text);
  }
  function spar(namn, varde) { try { if (window.skolappar && window.skolappar.event) window.skolappar.event(namn, varde); } catch (e) { } }

  /* ---------------------------------------------------------------- *
   * 5. Speltillstånd                                                 *
   * ---------------------------------------------------------------- */
  var S = {
    skarm: "start", niva: 1, runda: 1, item: 0, p: null,
    sym: [], stjärnor: 0, ratt: 0, klar: false, last: 0, varnad: -1
  };

  var W = 1000, H = 620;

  function bander(p) {
    if (p.system === "maya") return [5, 1];
    var b = [];
    if (p.tecken.indexOf(100) >= 0) b.push(100);
    b.push(10, 1);
    return b;
  }

  function maxAntal(v) { return v === 1 ? 9 : 9; }

  function rita() {
    var el = document.getElementById("scen");
    if (!el || !S.p) return;
    el.setAttribute("viewBox", "0 0 " + W + " " + H);
    var p = S.p, bands = bander(p), out = [];
    out.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fff"/>');

    var topp = 24, botten = H - 44;
    var bh = (botten - topp) / bands.length;

    bands.forEach(function (v, bi) {
      var y = topp + bh * bi + bh / 2;
      var n = antal(S.sym, v);
      var maxN = p.system === "maya" ? (v === 5 ? 3 : 4) : 9;
      var s = Math.min(bh * 0.66, (W - 140) / Math.max(maxN, 1) * 0.92, 118);
      var steg = s * 1.16;
      var startX = W / 2 - ((Math.max(n, 1) - 1) * steg) / 2;
      var i;
      /* svag platshållare så brädan visar var tecknen hamnar */
      if (n === 0) {
        out.push('<rect x="' + (W / 2 - s * 0.5) + '" y="' + (y - s * 0.5) + '" width="' + s + '" height="' + s +
          '" rx="' + (s * 0.16) + '" fill="none" stroke="#e3ddd2" stroke-width="3" stroke-dasharray="10 9"/>');
      }
      for (i = 0; i < n; i++) {
        var cx = startX + i * steg;
        out.push('<g transform="translate(' + (cx - s / 2) + ',' + (y - s / 2) + ') scale(' + (s / 100) + ')">' +
          glyf(v, p.system) + "</g>");
      }
      if (bi < bands.length - 1) {
        out.push('<line x1="70" y1="' + (topp + bh * (bi + 1)) + '" x2="' + (W - 70) + '" y2="' + (topp + bh * (bi + 1)) +
          '" stroke="#f0ebe2" stroke-width="2"/>');
      }
    });
    el.innerHTML = out.join("");
  }

  function knapparFor(p) {
    [1, 5, 10, 100].forEach(function (v) {
      var b = document.getElementById("knapp-" + v);
      if (!b) return;
      var visa = p.tecken.indexOf(v) >= 0;
      b.hidden = !visa;
      if (visa) {
        document.getElementById("bit-" + v).innerHTML = glyfSvg(v, p.system);
        document.getElementById("text-" + v).textContent = v === 1 && p.system === "maya" ? "1" : String(v);
        b.setAttribute("aria-label", "Lägg till " + teckenNamn(v, p.system));
      }
    });
  }

  function prickar() {
    var el = document.getElementById("prickar"), n = RUNDA[S.niva], i, s = "";
    for (i = 0; i < n; i++) s += '<i' + (i < S.item ? ' class="klar"' : "") + "></i>";
    el.innerHTML = s;
    document.getElementById("stjarnor").textContent = S.stjärnor ? "★".repeat(Math.min(S.stjärnor, 8)) : "";
  }

  function nyUppgift() {
    S.p = uppgift(S.niva);
    S.sym = [];
    S.klar = false;
    S.varnad = -1;
    document.getElementById("mal-tal").textContent = String(S.p.tal);
    document.getElementById("mal-ord").textContent = S.p.ord;
    document.querySelector(".mal").classList.remove("klar");
    document.getElementById("kotten").innerHTML = kottenSvg("hejar");
    knapparFor(S.p);
    rita();
    uppdateraSumma();
    prickar();
    sag(S.p.fraga + (S.p.system === "maya" ? " Använd prickar och staplar." : " Använd tecknen längst ned."));
    if (S.p.system === "maya") {
      /* visa vad tecknen betyder en gång, med ord */
    }
  }

  function uppdateraSumma() {
    var v = varde(S.sym), el = document.getElementById("summa");
    el.textContent = "Du har " + v;
    el.classList.toggle("for-mycket", v > S.p.tal);
  }

  function laggTill(v) {
    if (S.skarm !== "spel" || S.klar) return;
    ljud(520 + (v === 1 ? 0 : v === 5 ? 90 : 180), 0.06, "triangle");
    S.sym.push(v);
    var r = vaxla(S.sym, S.p.system);
    S.sym = r.sym;
    if (r.bytte) {
      sag(S.p.system === "maya" ? "Fem prickar blir en stapel!" :
        (r.bytte === 100 ? "Tio tio-tecken blir en repspiral!" : "Tio ett-tecken blir ett hälben!"));
      ljud(760, 0.14, "sine");
    }
    rita(); uppdateraSumma(); kolla();
  }

  function angra() {
    if (S.skarm !== "spel" || S.klar || !S.sym.length) return;
    S.sym.pop();
    ljud(300, 0.05, "sine");
    rita(); uppdateraSumma();
  }

  function kolla() {
    var v = varde(S.sym);
    if (v === S.p.tal && kanonisk(S.sym, S.p.system)) { ratt(); return; }
    if (v > S.p.tal && S.varnad !== v) {
      S.varnad = v;
      var b = document.getElementById("brada");
      b.classList.remove("skaka");
      void b.offsetWidth;
      b.classList.add("skaka");
      ljud(210, 0.12, "square");
      sag("För många. Ta bort något.");
      document.getElementById("kotten").innerHTML = kottenSvg("funderar");
    }
  }

  function ratt() {
    S.klar = true; S.ratt++; S.item++; S.stjärnor++;
    document.querySelector(".mal").classList.add("klar");
    document.getElementById("kotten").innerHTML = kottenSvg("firar");
    ljud(660, 0.1, "sine"); setTimeout(function () { ljud(880, 0.14, "sine"); }, 110);
    sag("Rätt! " + S.p.ord);
    prickar();
    spar("level", S.niva);
    var sista = S.item >= RUNDA[S.niva];
    setTimeout(function () {
      if (sista) { nivaKlar(); return; }
      nyUppgift();
    }, 950);
  }

  function nivaKlar() {
    if (S.niva < 3) { visaOverlay(S.niva, false); }
    else { visaOverlay(3, true); }
  }

  function visaOverlay(niva, sista) {
    S.skarm = "overlay";
    var bild = document.getElementById("ov-bild");
    var titel = document.getElementById("ov-titel");
    var text = document.getElementById("ov-text");
    var nasta = document.getElementById("ov-nasta");
    var igen = document.getElementById("ov-igen");
    var g = function (v, system) { return '<span class="ov-glyf">' + glyfSvg(v, system) + "</span>"; };
    if (niva === 1) {
      titel.textContent = "Nivå 1 klar";
      bild.innerHTML = kottenSvg("firar");
      text.innerHTML = "Egyptierna skrev 1 med ett streck. " + g(1, "egypt") +
        " Tio streck blev ett hälben: " + g(10, "egypt") + " – alltså tio.";
    } else if (niva === 2) {
      titel.textContent = "Nivå 2 klar";
      bild.innerHTML = kottenSvg("firar");
      text.innerHTML = "Ett hälben är tio och en repspiral" + g(100, "egypt") +
        " är hundra. Nu skriver du 134 med bara sex tecken.";
    } else {
      titel.textContent = "Alla nivåer klara";
      bild.innerHTML = kottenSvg("firar");
      text.innerHTML = "Mayafolket skrev 1 med en prick" + g(1, "maya") + " och 5 med en stapel" +
        g(5, "maya") + ". Våra siffror byter inte tecken – de byter plats: 24 är 2 tiotal och 4 ental.";
    }
    nasta.hidden = sista;
    nasta.textContent = niva === 1 ? "Nästa folk" : "Sista folket";
    igen.hidden = !sista;
    document.getElementById("overlay").hidden = false;
    spar("round_done", Math.round(100 * S.ratt / RUNDA[niva]));
    klang(niva);
    sag(niva === 1 ? "Nivå ett klar. Nu blir det större tal." :
      niva === 2 ? "Nivå två klar. Nu byter vi folk." : "Alla nivåer klara. Vad duktig du är!");
  }

  function klang(n) {
    var i, f = n === 3 ? [523, 659, 784, 1046] : [523, 659, 784];
    f.forEach(function (fr, k) { setTimeout(function () { ljud(fr, 0.18, "sine"); }, k * 130); });
  }

  function startaNiva(n) {
    S.niva = n; S.item = 0; S.skarm = "spel";
    document.getElementById("spel").hidden = false;
    document.getElementById("overlay").hidden = true;
    document.getElementById("startskarm").hidden = true;
    nyUppgift();
    spar("round_start");
  }

  function rundaKlar() {
    var procent = Math.round(100 * S.ratt / (S.ratt + 0));
    spar("round_done", S.stjärnor);
  }

  /* ---------------------------------------------------------------- *
   * 6. UI                                                            *
   * ---------------------------------------------------------------- */
  function bind() {
    document.getElementById("spela").addEventListener("click", function () {
      S.stjärnor = 0; S.ratt = 0;
      startaNiva(1);
      try { if (ac && ac.state === "suspended") ac.resume(); } catch (e) { }
    });
    [1, 5, 10, 100].forEach(function (v) {
      var b = document.getElementById("knapp-" + v);
      if (b) b.addEventListener("click", function () { laggTill(v); });
    });
    document.getElementById("angra").addEventListener("click", angra);
    document.getElementById("hjalp").addEventListener("click", function () {
      if (!S.p) return;
      sag(S.p.fraga);
      ljud(600, 0.08, "sine");
    });
    document.getElementById("ljud").addEventListener("click", function () {
      ljudPa = !ljudPa;
      if (!ljudPa) { try { if (window.__rostStopp) window.__rostStopp(); } catch (e) { } spar("sound_off"); }
      ritaLjudikon();
      this.setAttribute("aria-pressed", ljudPa ? "false" : "true");
    });
    document.getElementById("ov-nasta").addEventListener("click", function () {
      startaNiva(S.niva + 1);
    });
    document.getElementById("ov-igen").addEventListener("click", function () {
      S.stjärnor = 0; S.ratt = 0;
      startaNiva(1);
    });
    document.getElementById("kotten-hud").innerHTML = kottenSvg("tanker");
    document.getElementById("kotten").innerHTML = kottenSvg("hejar");
    ritaLjudikon();
    window.addEventListener("resize", function () { rita(); });
    window.addEventListener("orientationchange", function () { setTimeout(rita, 250); });
    /* tangentbord: 1/2/3 lägger till tecken, backspace ångrar */
    window.addEventListener("keydown", function (e) {
      if (S.skarm !== "spel" || !S.p) return;
      var k = e.key;
      if (k === "Backspace") { e.preventDefault(); angra(); return; }
      var t = S.p.tecken;
      if (k >= "1" && k <= "9") {
        var i = parseInt(k, 10) - 1;
        if (t[i] != null) laggTill(t[i]);
      }
    });
  }

  function ritaLjudikon() {
    var el = document.getElementById("ljudikon");
    if (!el) return;
    el.innerHTML = '<path d="M4 9h3l4-3v12l-4-3H4z"/>' + (ljudPa
      ? '<path d="M15 8a5 5 0 0 1 0 8"/><path d="M18 5a9 9 0 0 1 0 14"/>'
      : '<path d="M16 9l5 6M21 9l-5 6"/>');
  }

  /* testkrok */
  window.__sifferfolken = {
    S: S, uppgift: uppgift, laggTill: laggTill, angra: angra, rita: rita,
    startaNiva: startaNiva, varde: varde, kanonisk: kanonisk, vaxla: vaxla, talord: talord
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();