# Voorraadbeheer (Inventory Management)

🆕 **UITGEBREID MET 3 SKU TYPES & CATEGORIEËN V5.7**

## Overzicht

Uitgebreid voorraadbeheer systeem voor grondstoffen, halffabricaten en eindproducten met geavanceerde zoek- en categoriefunctionaliteiten.

## Functionaliteiten

### Basis Voorraadbeheer

- ✅ **Beheer van grondstoffen, halffabricaten en eindproducten**
- ✅ **SKU-nummers en locatie tracking**
- ✅ **Eén magazijn/opslaglocatie**
- ✅ **Automatische meldingen** bij lage voorraad
- ✅ **Add/Edit/Delete functionaliteit** (admin only)
- ✅ **Quick adjust knoppen** (+10/-10)
- ✅ **Status indicators** (OK/Laag/Niet op voorraad)

### 3 SKU Types per Item (V5.7)

🆕 Elk voorraaditem heeft drie verschillende SKU-codes:

1. **SKU Leverancier** - SKU zoals leverancier deze gebruikt
2. **Automatische SKU** - Automatisch gegenereerd (INV-0001, INV-0002, etc.)
3. **Aangepaste SKU** - Vrij invulbare SKU voor eigen gebruik

### Prijzen & Eenheden

- ✅ **Prijzen per voorraad item** - Verkoopprijs per eenheid
- ✅ **Eenheden beheer** - Stuk, meter, kg, liter, m², doos
- ✅ **Prijs weergave in tabel** - €XX.XX per eenheid
- ✅ **Koppeling met offertes en facturen** - Items kunnen direct geselecteerd worden

### Bewerken & Zoeken

- 🆕 **Dubbelklik om te bewerken** (V5.7) - Dubbelklik op item rij om direct te bewerken
- 🆕 **Uitgebreide zoeken/filteren** (V5.7) - Zoek in alle velden:
  - Naam
  - Alle SKU types
  - Locatie
  - Eenheid
  - Leverancier
  - Categorie
  - Prijzen
  - POS alert notitie

### Categorieën Systeem (V5.7)

🆕 Volledig categorieën beheer systeem:

- ✅ **Handmatig categorieën aanmaken** (naam, beschrijving, kleur)
- ✅ **Categorie dropdown** bij item toevoegen/bewerken
- ✅ **Nieuwe categorie aanmaken** vanuit item formulier
- ✅ **Categorieën beheren** in aparte tab (bewerken, verwijderen)
- ✅ **Categorie kleur badges** in tabel
- ✅ **Automatische selectie** van nieuwe categorie bij aanmaken vanuit item formulier

### Zoekbare Categoriefilter Dropdown (V5.7)

🆕 Geavanceerde filter dropdown:

- ✅ **Type om categorieën te filteren** in dropdown
- ✅ **Real-time filtering** van items op geselecteerde categorie
- ✅ **Combinatie met zoekbalk** mogelijk
- ✅ **Visuele feedback** met kleur badges en item count
- ✅ **"Wis filter" knop** voor snel resetten

### Integraties

- ✅ **Reservedelen voor servicewerk**
- ✅ **Materialen koppelen aan werkbon/project** - volledig geïntegreerd met werkorders
- ✅ **Koppeling met POS** - Real-time voorraad controle bij verkoop

### Toekomstige Features

- 🔄 **Automatisch aanmaken** van inkooporders bij drempel
- 🔄 **Picklijsten genereren** voor assemblage/montage
- 🔄 **Retouren verwerken**
- ❌ **Geen barcode/QR-code** (voorlopig niet)

## Gebruik

### Items Toevoegen

1. Klik op "Nieuw Item" knop
2. Vul naam, SKU's, prijzen en eenheden in
3. Selecteer of maak categorie aan
4. Stel drempelwaarde in voor automatische meldingen
5. Opslaan

### Items Bewerken

- **Dubbelklik** op item rij in tabel
- Of gebruik **Edit** knop in item kaart

### Zoeken & Filteren

1. Gebruik **zoekbalk** voor tekst zoeken in alle velden
2. Gebruik **categorie dropdown** voor filtering op categorie
3. Combineer beide voor specifieke resultaten

## 🐛 Troubleshooting

### Probleem: SKU duplicaat errors

**Symptomen:**
- Error "SKU bestaat al" bij opslaan
- Kan item niet wijzigen
- Automatische SKU nummers worden dubbel gegenereerd

**Oorzaak:**
- SKU is handmatig ingevoerd en bestaat al
- Twee items met zelfde Leverancier SKU
- Database validatie fout
- Cache probleem

**Oplossing:**
1. Check huidige SKU in systeem (Ctrl+F om te zoeken)
2. Gebruik unieke SKU voor elk item
3. Laat Automatische SKU leeg om automatisch te laten genereren
4. Clear browser cache (Ctrl+Shift+Delete)
5. Ververs de pagina (F5)

---

### Probleem: Voorraad tellingen kloppen niet

**Symptomen:**
- Voorraad aantal is anders in POS dan in Inventory
- Tellingen syncen niet met werkorders
- Historische gegevens kloppen niet

**Oorzaak:**
- Gelijktijdige updates (race condition)
- Werkorder niet als voltooid gemarkeerd
- POS transactie niet verwerkt
- Manual adjustment niet opgeslagen

**Oplossing:**
1. Voer handmatige telling uit via "Adjust" knoppen
2. Check werkorders zijn als voltooid gemarkeerd
3. Ververs de pagina (F5) en check opnieuw
4. Controleer POS module voor onverwerkte transacties
5. Check database logs in Admin Instellingen

---

### Probleem: Categorieën worden niet opgeslagen

**Symptomen:**
- Nieuwe categorie kan niet aangemaakt worden
- Bewerken categorie werkt niet
- Categorieën verdwijnen na refresh

**Oorzaak:**
- Geen admin rechten
- Verplichte veld niet ingevuld (naam)
- Database validatie fout
- LocalStorage probleem

**Oplossing:**
1. Check huidige rol in profiel (rechts bovenin) - Admin vereist
2. Zorg dat categorie naam ingevuld is
3. Clear browser cache (Ctrl+Shift+Delete)
4. Ververs de pagina (F5)
5. Check browser console (F12) voor errors

---

### Veelvoorkomende Errors

#### Error: "SKU already exists"
**Oorzaak:** Dit SKU nummer is al in gebruik
**Oplossing:** Wijzig SKU naar unieke waarde of gebruik autogenerated SKU

#### Error: "Category name is required"
**Oorzaak:** Categorie naam veld is leeg
**Oplossing:** Vul categorie naam in voordat je opslaat

#### Error: "Invalid price format"
**Oorzaak:** Prijs bevat ongeldig karakter
**Oplossing:** Gebruik alleen cijfers en komma's (bijv. 19,99)

---

### Dubbelklik Bewerken Issues

**Symptomen:** Dubbelklik werkt niet, edit modal opent niet
**Mogelijke oorzaken:**
- Item is vergrendeld (in bewerking door ander)
- JavaScript error
- Slechte timing

**Oplossingen:**
1. Probeer opnieuw dubbelklikken
2. Use Edit knop in plaats van dubbelklik
3. Check browser console (F12)
4. Clear browser cache

---

### Zoek/Filter Issues

**Symptomen:** Zoeken geeft geen resultaten, category filter werkt niet
**Oorzaak:**
- Zoektekst is te specifiek
- Categorie heeft geen items
- Filter is niet correct ingesteld
**Oplossing:**
1. Probeer breder zoekterm
2. Clear filters en probeer opnieuw
3. Check of items daadwerkelijk aan categorie gekoppeld zijn
4. Ververs pagina (F5)

---

### Tips voor Debugging

1. **Open Browser Console** (F12) om errors te zien
2. **Check Network Tab** voor API errors
3. **Refresh de pagina** (F5) bij rare gedrag
4. **Controleer SKU uniekheid** voor duplicaat problemen
5. **Test in Incognito Mode** om extensies uit te sluiten

## Gerelateerde Modules

- [POS](./pos.md) - Voor verkopen en voorraad aftrek
- [Werkorders](./workorders.md) - Voor materiaalbeheer
- [Accounting](./accounting.md) - Voor prijzen en facturatie
- [Webshop](./webshop.md) - Voor webshop product koppeling

## Versie Geschiedenis

- **V5.7** - 3 SKU types, categorieën systeem, uitgebreide zoeken, dubbelklik bewerken
- **V5.0** - Prijzen per item, eenheden beheer, koppeling met offertes
