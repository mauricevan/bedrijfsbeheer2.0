# Planning & Agenda

## Overzicht

Volledige kalender module voor planning van werkorders, meetings, vakantie en overige evenementen met medewerker toewijzing.

## Functionaliteiten

### Kalender Weergaven

- ✅ **Volledige kalender module** met meerdere views:
  - **Dag view** - Gedetailleerd overzicht per dag
  - **Week view** - Weekoverzicht met alle evenementen
  - **Maand view** - Maandoverzicht voor lange termijn planning

### Evenementen Beheer

#### Evenement Types

- ✅ **Evenementen toevoegen** met verschillende types:
  - 🔧 **Werkorder** - Geplande werkzaamheden
  - 🤝 **Meeting** - Vergaderingen en afspraken
  - 🏖️ **Vakantie** - Verlof en vrije dagen
  - 📅 **Overig** - Andere evenementen

#### Evenement Details

- ✅ **Medewerker toewijzing** aan evenementen
- ✅ **Klant koppeling** - Koppel evenement aan klant
- ✅ **Start en eind tijd** - Nauwkeurige tijd planning
- ✅ **Beschrijving per evenement** - Extra details en notities

### Navigatie & Usability

- ✅ **Navigatie tussen datums**:
  - Vorige/volgende dag/week/maand
  - Jump naar specifieke datum
- ✅ **"Vandaag" knop** voor quick access naar huidige datum
- ✅ **Visuele kleurcodering** per event type:
  - Werkorders: Blauw
  - Meetings: Groen
  - Vakantie: Paars
  - Overig: Grijs

### Admin Functionaliteiten

- ✅ **Delete functionaliteit** (admin) - Verwijder evenementen indien nodig

---

## Toekomstige Features

- 🔄 **Drag & drop** voor afspraken - Sleep evenementen naar andere tijden
- 🔄 **Project deadlines** - Automatische deadline tracking vanuit projecten
- 🔄 **Leverdata tracking** - Verwachte leverdatums van bestellingen
- 🔄 **Recurring events** - Terugkerende evenementen (dagelijks/wekelijks/maandelijks)
- 🔄 **Notificaties** - Herinneringen voor aankomende evenementen
- 🔄 **Conflict detectie** - Waarschuwing bij dubbele bookings
- 🔄 **Team calendar view** - Overzicht van alle medewerkers tegelijk

---

## Gebruik

### Evenement Toevoegen

1. **Selecteer datum** in kalender
   - Klik op gewenste datum
   - Of gebruik "Nieuw Evenement" knop

2. **Vul evenement details in**:
   - **Type**: Selecteer werkorder, meeting, vakantie of overig
   - **Titel**: Korte beschrijving
   - **Beschrijving**: Uitgebreide details (optioneel)
   - **Start tijd**: Begin tijdstip
   - **Eind tijd**: Eind tijdstip
   - **Medewerker**: Wijs medewerker toe
   - **Klant**: Koppel klant (optioneel)

3. **Opslaan**

### Kalender Navigeren

#### Dag View
- Zie alle evenementen voor één dag
- Gedetailleerde tijdslots
- Ideaal voor dagelijkse planning

#### Week View
- Overzicht van 7 dagen
- Zie beschikbaarheid en conflicten
- Ideaal voor korte termijn planning

#### Maand View
- Overzicht van volledige maand
- Zie bezetting op lange termijn
- Ideaal voor strategische planning

### Navigatie Knoppen

- **◀ Vorige** - Ga naar vorige periode
- **Vandaag** - Spring terug naar huidige datum
- **Volgende ▶** - Ga naar volgende periode

### Evenement Bewerken

1. **Klik op evenement** in kalender
2. **Bekijk details** in popup
3. **Bewerk** indien nodig (admin)
4. **Opslaan** wijzigingen

### Evenement Verwijderen

1. **Klik op evenement**
2. **Klik "Verwijder"** (alleen admin)
3. **Bevestig** verwijdering

---

## Use Cases

### Werkorder Planning

1. **Nieuwe werkorder ontvangen**
2. **Open Planning module**
3. **Selecteer datum voor uitvoering**
4. **Maak werkorder evenement**:
   - Type: Werkorder
   - Wijs medewerker toe
   - Koppel klant
   - Stel tijdslot in
5. **Medewerker ziet werkorder in agenda**

### Verlof Planning

1. **Medewerker vraagt verlof aan**
2. **Admin opent Planning**
3. **Selecteer verlof periode**
4. **Maak vakantie evenement**:
   - Type: Vakantie
   - Selecteer medewerker
   - Vul start en eind datum in
5. **Medewerker is geblokkeerd voor planning**

### Meeting Planning

1. **Klant meeting plannen**
2. **Open kalender**
3. **Zoek beschikbare tijdslot**
4. **Maak meeting evenement**:
   - Type: Meeting
   - Wijs deelnemers toe
   - Koppel klant
   - Voeg beschrijving toe (agenda)
5. **Deelnemers zien meeting in agenda**

---

## Integraties

### Werkorders Module

- Geplande werkorders verschijnen automatisch in kalender
- Status updates worden gesynchroniseerd
- Medewerker toewijzing in sync met workboard

### HRM Module

- Verlof dagen worden automatisch geblokkeerd in planning
- Beschikbaarheid status van medewerkers wordt gerespecteerd
- Medewerker lijst automatisch gesynchroniseerd

### CRM Module

- Klant afspraken koppelbaar aan leads en klanten
- Follow-up datums kunnen direct ingepland worden
- Meeting notities synchroniseren met interacties

---

## Tips

1. **Kleurcodering** - Gebruik kleuren om snel evenement types te herkennen
2. **Week view** - Gebruik week view voor beste overzicht van planning
3. **Medewerker filter** - Filter op specifieke medewerker voor persoonlijke agenda
4. **Buffer tijd** - Plan altijd buffer tijd tussen werkorders
5. **Regelmatig checken** - Check dagelijks de planning voor updates

---

## 🐛 Troubleshooting

### Probleem: Agenda items overlappen

**Symptomen:**
- Twee events op zelfde tijd
- Conflict waarschuwing wordt niet getoond
- Medewerker is dubbelgeboekt

**Oorzaak:**
- Conflict detectie nog niet geïmplementeerd
- Twee admins boeken tegelijk
- Werkorder en vakantie conflict
- Tijdzone probleem

**Oplossing:**
1. Check alle events voor overlap
2. Move een event naar ander moment
3. Verwijder duplicate event
4. Controleer systeem tijd/tijdzone
5. Communiceer met team bij gelijktijdig boeken

---

### Probleem: Herinnering notificaties werken niet

**Symptomen:**
- Geen reminder voor aankomende event
- Notificatie wordt niet getoond
- Badge toont geen items

**Oorzaak:**
- Notificaties module is uitgeschakeld
- Herinnering feature nog niet volledig
- Browser notifications disabled
- Datum/tijd is incorrect

**Oplossing:**
1. Check Admin Instellingen → Notificaties is aan
2. Check browser notification permissions
3. Allow notifications in browser settings
4. Verifieer event datum/tijd
5. Controleer timezone instellingen

---

### Probleem: Export naar kalender faalt

**Symptomen:**
- iCal export werkt niet
- Kan niet synchroniseren met Outlook/Google
- File is leeg of corrupt

**Oorzaak:**
- Export feature nog niet geïmplementeerd
- File format is incorrect
- Browser blokkiert download
- Backend service down

**Oplossing:**
1. Check of export beschikbaar is in deze versie
2. Try in ander browser
3. Check browser download settings
4. Controleer backend logs
5. Copy handmatig in plaats van export

---

### Veelvoorkomende Errors

#### Error: "Event creation failed"
**Oorzaak:** Event kan niet aangemaakt worden
**Oplossing:** Check alle velden zijn ingevuld (type, titel, datum, medewerker)

#### Error: "Time slot unavailable"
**Oorzaak:** Medewerker is al geboekt
**Oplossing:** Selecteer ander tijdslot of ander persoon

#### Error: "Invalid date"
**Oorzaak:** Datum formaat is incorrect
**Oplossing:** Zorg voor correct datumformaat (DD-MM-YYYY)

---

### Navigatie Issues

**Symptomen:** Kalender springt niet naar correct datum, navigation buttons werken niet
**Mogelijke oorzaken:**
- Systeem datum is verkeerd
- Browser cache probleem
- JavaScript error
**Oplossingen:**
1. Controleer systeem datum/tijd
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check browser console (F12)
4. Ververs pagina

---

### View Toggle Issues

**Symptomen:** Dag/week/maand view switchen werkt niet
**Mogelijke oorzaken:**
- JavaScript error
- State management probleem
- Browser compatibility
**Oplossingen:**
1. Use ander browser
2. Check browser console (F12)
3. Clear browser cache
4. Refresh pagina

---

### Medewerker Filter Issues

**Symptomen:** Medewerker filter toont geen resultaten
**Mogelijke oorzaken:**
- Medewerker is niet in systeem
- Events niet aan medewerker gekoppeld
**Oplossingen:**
1. Check HRM module - medewerkers bestaan
2. Voeg medewerker toe aan events
3. Refresh pagina
4. Clear filters

---

### Tips voor Debugging

1. **Open Browser Console** (F12) om errors te zien
2. **Check Network Tab** voor API errors
3. **Refresh de pagina** (F5) bij rare gedrag
4. **Controleer systeem datum** voor date issues
5. **Test in Incognito Mode** om extensies uit te sluiten

## Gerelateerde Modules

- [Werkorders](./workorders.md) - Voor werkorder planning
- [HRM](./hrm.md) - Voor verlof en beschikbaarheid
- [CRM](./crm.md) - Voor klant afspraken

---

## Versie Geschiedenis

- **V4.0** - Volledige kalender module met dag/week/maand views
- **V3.5** - Visuele kleurcodering en navigatie verbeteringen
