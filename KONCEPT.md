# Sifferfolken – bygg tal med tecken från förr

**Ett mål:** barnet bygger ett tal med ett historiskt talsystem och upptäcker att
symbolerna betyder olika mycket (1, 10, 100 / 1 och 5) och att tio ett blir ett tio.

**Målgrupp:** åk 2–4 (7–10 år). Katalogcellen är tom: ingen av 77 appar handlar om
talsymbolernas historia.

**Kärnmekanik (touch först):** en bricka med tecken längst ned (streck, hälben, rep /
prick, stapel). Ett tryck lägger till ett tecken på brädan, "Ångra" tar bort det sista.
Brädan visar bygget grupperat per tecken; "Du har 12" räknas om vid varje tryck.
När antalet stämmer med målet tänds stjärnan.

**Nivåer:** 1) Egypten 1–9 (bara ett-tecknet). 2) Egypten 10–199 (ett, tio, hundra).
3) Maya 1–19 (prick = 1, stapel = 5). Automatisk växling: tio ett-tecken blir ett
tio-tecken, fem prickar blir en stapel – samma regel, olika bas.

**5-minuterssession:** 5 + 6 + 6 uppgifter, stjärna per rätt, nivåskärm med en
"museumskort"-rad om folket och tecknen.

**Belöning barnet kan berätta om:** "Jag byggde 34 med egyptiska tecken – tio är ett
hälben" och till slut jämförelsen: våra siffror byter inte tecken, de byter plats.

**Vad barnet lär:** additiv notation med tiopotenser (Egypten) och med fem som
mellanbas (Maya), samt varför vårt positionssystem är annorlunda.

**Lgr22 (ordagrant, Skolverket):** MA.1-3.1.3 – "Symboler för tal och symbolernas
utveckling i några olika kulturer genom historien."

**Fakta och källor:** egyptiska hieroglyfer för 1 (streck), 10 (hälben) och 100
(repspiral), additivt med bas tio, upp till nio av varje tecken; mayafolkets prick = 1,
stapel = 5, snäckskal = 0, additivt inom varje position. Källa anges i appen:
Nationellt centrum för matematikutbildning (NCM), Nämnaren 2011:2 och 2010.

**Varför iPad:** allt ryms på en skärm, tre stora teckenbrickor i tumstorlek, ingen text
som måste läsas (talet läses upp), inget som går att förlora.

## Testplan (mätbara krav)
1. `node verify.mjs`: 0 fel – varje uppgift har rätt antal tecken som mål, teckenbrickorna
   räcker för målet, växlingen (10 ett → 1 tio, 5 prickar → 1 stapel) bevarar värdet,
   nivåerna bygger på varandra, alla tecken finns i teckentabellen.
2. 0 px scroll (`scrollHeight-innerHeight`, `scrollWidth-innerWidth`) i 1024×768,
   768×1024, 390×844 och 1440×900, både startskärm och spel.
3. Minsta tryckyta ≥ 72 px på iPad, ≥ 56 px på telefon.
4. Hel runda spelad med `Input.dispatchTouchEvent`: 5/5, 6/6, 6/6, stjärnor och
   nivåskärm; ett avsiktligt för högt bygge ska säga "för många" utan att låsa.
5. Allt som sägs finns också som text (mutor på klassrums-iPad).
6. check_app 15/15.