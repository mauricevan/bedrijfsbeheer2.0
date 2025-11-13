# Rapportages & Analyse

## Overzicht

Uitgebreide rapportage module met realtime dashboards voor verkoop, voorraad, offertes en werkorders.

## Functionaliteiten

### 4 Rapport Types

De module biedt vier verschillende rapporten, elk met eigen focus en metrics.

---

## 1. Verkoop Rapport

### KPI's

- ✅ **Totale omzet** - Totaal verkochte bedrag in geselecteerde periode
- ✅ **Gemiddelde verkoop** - Gemiddelde waarde per transactie
- ✅ **Verkochte items** - Totaal aantal verkochte items

### Top Producten

- ✅ **Top 5 producten** met omzet:
  - Productnaam
  - Aantal verkocht
  - Totale omzet per product
  - Percentage van totale omzet

### Verkoop Timeline

- ✅ **Verkopen per datum** timeline:
  - Grafische weergave van verkopen over tijd
  - Dagelijkse/wekelijkse/maandelijkse breakdowns
  - Trend visualisatie

---

## 2. Voorraad Rapport

### Voorraad KPI's

- ✅ **Totale voorraadwaarde** - Berekend o.b.v. actuele prijzen en aantallen
- ✅ **Lage voorraad items** - Aantal items onder drempelwaarde
- ✅ **Niet op voorraad** alerts - Items met 0 voorraad

### Voorraad Tabel

- ✅ **Volledige voorraad tabel** met status:
  - Productnaam en SKU
  - Actuele voorraad
  - Drempelwaarde
  - Status indicator (OK/Laag/Niet op voorraad)
  - Voorraadwaarde per item
  - Laatste update datum

### Status Categorieën

- ✅ **OK** - Voorraad boven drempelwaarde (groen)
- ✅ **Laag** - Voorraad onder drempelwaarde (oranje)
- ✅ **Niet op voorraad** - 0 voorraad (rood)

---

## 3. Offertes Rapport

### Offerte KPI's

- ✅ **Totale offertes waarde** - Som van alle offertes
- ✅ **Geaccepteerde waarde** - Som van geaccepteerde offertes
- ✅ **Conversie rate** berekening - Percentage geaccepteerde offertes

### Status Breakdown

- ✅ **Status verdeling**:
  - **Draft** - Concept offertes (aantal en waarde)
  - **Sent** - Verzonden offertes (aantal en waarde)
  - **Approved** - Geaccepteerde offertes (aantal en waarde)
  - **Rejected** - Afgewezen offertes (aantal en waarde)
  - **Expired** - Verlopen offertes (aantal en waarde)

### Conversie Metrics

- Percentage berekening: (Geaccepteerd / Totaal Verzonden) × 100%
- Visuele weergave van conversie rate
- Trend analyse over tijd

---

## 4. Werkorders Rapport

### Werkorder KPI's

- ✅ **Totaal orders** - Alle werkorders in systeem
- ✅ **Afgerond count** - Aantal voltooide werkorders
- ✅ **Totaal gewerkte uren** - Som van alle geregistreerde uren
- ✅ **Gemiddelde uren per order** - Automatisch berekend

### Status Breakdown

- ✅ **Status verdeling**:
  - **Pending (In Wacht)** - Aantal en percentage
  - **In Progress (In Uitvoering)** - Aantal en percentage
  - **Completed (Voltooid)** - Aantal en percentage

### Recent Afgeronde Orders

- ✅ **Recent afgeronde orders** met details:
  - Werkorder titel
  - Toegewezen medewerker
  - Gewerkte uren
  - Voltooiingsdatum
  - Klant informatie

---

## Algemene Features

### Dashboard Functies

- ✅ **Realtime dashboards** - Automatische updates bij data wijzigingen
- ✅ **Waarschuwingen bij afwijkingen** - Automatische alerts bij problemen

### Toekomstige Features

- 🔄 **Export naar Excel/PDF** - Download rapporten voor offline gebruik
- 🔄 **Budget overschrijding alerts** - Waarschuwingen bij overschrijding
- 🔄 **Periode selectie** - Filter rapporten op datum bereik
- 🔄 **Vergelijkingen** - Vergelijk periodes met elkaar
- 🔄 **Forecast** - Voorspellingen op basis van historische data
- 🔄 **Custom rapporten** - Maak eigen rapport templates
- 🔄 **Automatische email rapporten** - Dagelijkse/wekelijkse/maandelijkse emails

---

## Gebruik

### Rapport Bekijken

1. **Open Rapportages module**
2. **Selecteer rapport type**:
   - Verkoop
   - Voorraad
   - Offertes
   - Werkorders
3. **Bekijk KPI cards** bovenaan voor quick overview
4. **Scroll voor details** en visualisaties

### Verkoop Rapport Analyseren

1. **Check totale omzet** in KPI card
2. **Bekijk top 5 producten** voor bestsellers
3. **Analyseer timeline** voor trends
4. **Identificeer piek periodes** voor planning

### Voorraad Rapport Monitoren

1. **Check totale waarde** voor inventory investment
2. **Zie lage voorraad alerts** (oranje indicator)
3. **Zie niet op voorraad** (rood indicator)
4. **Neem actie** voor items die aangevuld moeten worden

### Offertes Rapport Optimaliseren

1. **Bekijk conversie rate** - Target: >25%
2. **Analyseer status breakdown**:
   - Veel drafts? → Mogelijk intern bottleneck
   - Veel sent? → Follow-up nodig
   - Veel rejected? → Analyse nodig (prijzen? kwaliteit?)
   - Veel expired? → Sneller reageren
3. **Verbeter proces** op basis van inzichten

### Werkorders Rapport Efficiency

1. **Check gemiddelde uren** per order
2. **Vergelijk** met targets of budgets
3. **Zie status verdeling**:
   - Veel pending? → Mogelijk resource tekort
   - Veel in progress? → Check doorlooptijd
4. **Analyseer afgeronde orders** voor trends

---

## Best Practices

### Dagelijkse Checks

- **Voorraad rapport** - Check lage voorraad alerts
- **Werkorders rapport** - Monitor in progress orders

### Wekelijkse Analyse

- **Verkoop rapport** - Analyseer weekly sales trends
- **Offertes rapport** - Check conversie rate en follow-up

### Maandelijkse Reviews

- **Alle rapporten** - Volledige analyse van maand performance
- **Trends identificeren** - Spot patronen en verbeterpunten
- **Acties definiëren** - Stel verbeterdoelen voor volgende maand

---

## 🐛 Troubleshooting

### Probleem: Export naar PDF/Excel faalt

**Symptomen:**
- Export knop werkt niet
- Download start niet
- Bestand is leeg of corrupt
- Error "Export failed"

**Oorzaak:**
- Export feature nog niet volledig geïmplementeerd
- Browser blokkiert download
- Backend service is offline
- File format probleem

**Oplossing:**
1. Check of export beschikbaar is in deze versie
2. Try in ander browser
3. Check browser download instellingen
4. Check browser console (F12) voor errors
5. Controleer backend service status

---

### Probleem: Filters niet toegepast

**Symptomen:**
- Filter knop werkt niet
- Geselecteerde filter wordt genegeerd
- Data update niet na filter wijziging
- Filters reset na pagina refresh

**Oorzaak:**
- Filter logic niet correct geïmplementeerd
- Cache probleem
- State management issue
- Date picker bug

**Oplossing:**
1. Zorg alle filter velden zijn ingevuld
2. Ververs pagina (F5)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Probeer filters opnieuw
5. Check browser console (F12) voor errors

---

### Probleem: Grafieken laden niet

**Symptomen:**
- Grafieken zijn leeg
- Visualisaties laden niet
- "Loading..." staat stil
- Grafieken tonen foutmelding

**Oorzaak:**
- Chart library laadt niet
- Data voor grafiek is fout/leeg
- Browser script blokkering
- Backend data query failed

**Oplossing:**
1. Ververs pagina (F5)
2. Zorg dat data bestaat (check andere tabs)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Disable ad-blockers/script blockers
5. Check browser console (F12) voor errors

---

### Veelvoorkomende Errors

#### Error: "No data available"
**Oorzaak:** Periode bevat geen data
**Oplossing:** Selecteer andere periode of check of transacties bestaan

#### Error: "Invalid date range"
**Oorzaak:** Start datum is na eind datum
**Oplossing:** Selecteer correct datum bereik

#### Error: "Calculation error"
**Oorzaak:** Data bevat ongeldig formats
**Oplossing:** Check data integriteit in bron modules

---

### KPI Card Issues

**Symptomen:** KPI cards tonen foutieve getallen, totalen kloppen niet
**Mogelijke oorzaken:**
- Data sync vertraging
- Berekening fout
- Filter wordt niet meegenomen
**Oplossingen:**
1. Wacht een moment en refresh
2. Check data in bron modules
3. Controleer filters
4. Ververs pagina

---

### Performance Issues

**Symptomen:** Rapporten laden traag, lange wachttijd
**Mogelijke oorzaken:**
- Veel data in periode
- Database query is traag
- Browser resource tekort
**Oplossingen:**
1. Selecteer kleinere datum bereik
2. Clear browser cache
3. Close andere tabs
4. Use later opnieuw
5. Check internet verbinding

---

### Rapport Type Issues

**Symptomen:** Specifiek rapport werkt niet
**Mogelijke oorzaken:**
- Report type data ontbreekt
- Module is uitgeschakeld
- Bron data is leeg
**Oplossingen:**
1. Check bron modules (POS, Werkorders, Accounting, etc.)
2. Zorg module is ingeschakeld in Admin Settings
3. Verifieer transacties bestaan voor periode
4. Probeer ander rapport type

---

### Tips voor Debugging

1. **Open Browser Console** (F12) om errors te zien
2. **Check Network Tab** voor API errors
3. **Refresh de pagina** (F5) bij rare gedrag
4. **Controleer bron data** voor correctheid
5. **Test in Incognito Mode** om extensies uit te sluiten

## Gerelateerde Modules

- [Voorraadbeheer](./inventory.md) - Voor voorraad details
- [Accounting](./accounting.md) - Voor verkoop en offertes data
- [Werkorders](./workorders.md) - Voor werkorder details
- [POS](./pos.md) - Voor verkoop transacties

---

## Tips

1. **Regelmatig monitoren** - Check rapporten dagelijks voor actuele insights
2. **Trends herkennen** - Let op patronen in verkoop en orders
3. **Proactief handelen** - Gebruik alerts om tijdig actie te nemen
4. **Vergelijk periodes** - Zie groei of achteruitgang over tijd
5. **Data-driven beslissingen** - Gebruik rapporten voor strategische keuzes

---

## Versie Geschiedenis

- **V4.0** - Volledig rapportage systeem met 4 rapport types
- **V3.5** - Status breakdowns en conversie rate berekeningen
