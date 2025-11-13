# Notificaties Systeem

## Overzicht

Uitgebreid notificaties systeem voor real-time meldingen over belangrijke gebeurtenissen in het systeem.

## Functionaliteiten

### Notificaties Bel in Header

- ✅ **Notificaties bel** in header - Altijd zichtbaar in navigatie
- ✅ **Badge counter** - Aantal ongelezen meldingen wordt getoond
- ✅ **Real-time updates** - Counter wordt automatisch bijgewerkt

### Dropdown met Meldingen

- ✅ **Dropdown menu** - Klik op bel om meldingen te zien
- ✅ **Ongelezen meldingen** - Zie alle nieuwe meldingen in één overzicht
- ✅ **Chronologische volgorde** - Nieuwste meldingen bovenaan

### Notificatie Types

Het systeem ondersteunt 4 verschillende types meldingen met unieke styling:

#### 🔵 Info

- **Kleur**: Blauw
- **Gebruik**: Algemene informatie, updates
- **Voorbeelden**:
  - Nieuwe klant toegevoegd
  - Werkorder voltooid
  - Offerte verzonden

#### ⚠️ Warning (Waarschuwing)

- **Kleur**: Oranje/Geel
- **Gebruik**: Waarschuwingen, aandachtspunten
- **Voorbeelden**:
  - Lage voorraad waarschuwing
  - Factuur vervalt binnenkort
  - Werkorder al 3 dagen in wacht

#### ❌ Error (Fout)

- **Kleur**: Rood
- **Gebruik**: Fouten, problemen
- **Voorbeelden**:
  - Niet op voorraad
  - Betaling mislukt
  - Database verbinding verloren

#### ✅ Success (Succes)

- **Kleur**: Groen
- **Gebruik**: Succesvolle acties, bevestigingen
- **Voorbeelden**:
  - Factuur succesvol verzonden
  - Betaling ontvangen
  - Werkorder voltooid

### Notificatie Acties

#### Markeren als Gelezen

- ✅ **Individueel markeren** - Klik op notificatie om als gelezen te markeren
- ✅ **Visuele indicatie** - Ongelezen notificaties hebben andere styling
- ✅ **Auto-markering** - Bij klikken wordt notificatie automatisch gelezen

#### Alles Markeren als Gelezen

- ✅ **"Alles markeren als gelezen" knop** - Markeer alle notificaties in één keer
- ✅ **Badge reset** - Counter gaat naar 0
- ✅ **Bevestiging** - Directe visuele feedback

### Notificaties Paneel in Dashboard

- ✅ **Notificaties paneel** - Speciaal paneel op dashboard
- ✅ **Overzicht** - Zie meest recente notificaties direct bij opstarten
- ✅ **Quick access** - Snel inzicht in belangrijke meldingen

### Badge in Sidebar

- ✅ **Badge bij nieuwe meldingen** - Visuele indicator in sidebar
- ✅ **Opvallend** - Rode badge trekt aandacht
- ✅ **Verdwijnt** - Bij markeren als gelezen

---

## Automatische Notificaties

Het systeem genereert automatisch notificaties voor belangrijke gebeurtenissen:

### Voorraad Gerelateerd

- ✅ **Automatische meldingen bij lage voorraad**:
  - Trigger: Voorraad onder drempelwaarde
  - Type: Warning
  - Actie: Link naar voorraad item

### Offertes Gerelateerd

- ✅ **Meldingen bij offerte acceptatie**:
  - Trigger: Klant accepteert offerte
  - Type: Success
  - Actie: Link naar offerte

### Facturen Gerelateerd (Toekomstig)

- 🔄 **Factuur vervaldatum waarschuwingen**:
  - Trigger: Factuur vervalt binnen 3 dagen
  - Type: Warning
  - Actie: Link naar factuur

- 🔄 **Factuur verlopen**:
  - Trigger: Factuur vervaldatum gepasseerd
  - Type: Error
  - Actie: Link naar factuur + "Stuur herinnering" knop

### Werkorders Gerelateerd (Toekomstig)

- 🔄 **Werkorder toegewezen**:
  - Trigger: Admin wijst werkorder toe aan medewerker
  - Type: Info
  - Actie: Link naar werkorder

- 🔄 **Werkorder voltooid**:
  - Trigger: Medewerker voltooit werkorder
  - Type: Success
  - Actie: Link naar werkorder + "Maak factuur"

### CRM Gerelateerd (Toekomstig)

- 🔄 **Follow-up herinnering**:
  - Trigger: Follow-up datum bereikt
  - Type: Info
  - Actie: Link naar klant/lead

- 🔄 **Nieuwe lead**:
  - Trigger: Lead aangemaakt (bijv. via webform)
  - Type: Info
  - Actie: Link naar lead

---

## Gebruik

### Notificaties Bekijken

1. **Check badge counter** in header - Zie aantal ongelezen meldingen
2. **Klik op notificaties bel** - Open dropdown menu
3. **Scroll door meldingen** - Zie alle ongelezen notificaties
4. **Klik op notificatie** - Bekijk details en ga naar gerelateerde pagina

### Notificatie Afhandelen

1. **Lees notificatie** - Begrijp wat de melding inhoudt
2. **Neem actie** indien nodig:
   - Lage voorraad? → Ga naar voorraad en bestel bij
   - Offerte geaccepteerd? → Maak factuur
   - Factuur verlopen? → Stuur herinnering
3. **Markeer als gelezen** - Klik op notificatie of gebruik "Alles markeren als gelezen"

### Dashboard Paneel

1. **Open Dashboard** - Zie notificaties paneel direct
2. **Quick scan** - Zie meest belangrijke meldingen
3. **Klik voor details** - Ga naar volledige notificatie

---

## Notificatie Prioriteit

### High Priority (Hoog)

**Onmiddellijke aandacht vereist:**

- ❌ Niet op voorraad (Error)
- ❌ Factuur >30 dagen verlopen (Error)
- ⚠️ Kritieke voorraad (<5 stuks) (Warning)

### Medium Priority (Gemiddeld)

**Binnen 24 uur afhandelen:**

- ⚠️ Lage voorraad (Warning)
- ⚠️ Factuur vervalt binnen 3 dagen (Warning)
- 🔵 Werkorder in wacht >7 dagen (Info)

### Low Priority (Laag)

**Informatie, geen directe actie:**

- ✅ Werkorder voltooid (Success)
- ✅ Offerte verzonden (Success)
- 🔵 Nieuwe klant toegevoegd (Info)

---

## Best Practices

### Voor Alle Gebruikers

1. **Check regelmatig** - Bekijk notificaties meerdere keren per dag
2. **Neem actie** - Reageer tijdig op belangrijke meldingen
3. **Markeer als gelezen** - Houd notificaties lijst schoon
4. **Dashboard check** - Begin dag met dashboard notificaties paneel

### Voor Admins

1. **Monitor trends** - Let op terugkerende notificaties (bijv. vaak lage voorraad)
2. **Configureer drempels** - Pas voorraad drempels aan indien te veel meldingen
3. **Train team** - Zorg dat team weet hoe om te gaan met notificaties
4. **Response tijd** - Stel normen voor hoe snel op notificaties gereageerd moet worden

---

## Toekomstige Features

- 🔄 **Email notificaties** - Belangrijke meldingen ook per email
- 🔄 **Push notificaties** - Browser push notifications
- 🔄 **Notificatie instellingen** - Per gebruiker configureerbaar
- 🔄 **Stille uren** - Geen notificaties buiten werktijden
- 🔄 **Notificatie prioriteit** - High/Medium/Low met filtering
- 🔄 **Notificatie geschiedenis** - Archief van oude notificaties
- 🔄 **Custom notificaties** - Gebruikers kunnen eigen triggers instellen
- 🔄 **Notificatie geluid** - Audio alert bij nieuwe melding

---

## Technische Details

### Notificatie Data Structuur

```typescript
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string; // Optionele link naar gerelateerde pagina
  actionRequired?: boolean;
}
```

### Real-time Updates

- Notificaties worden real-time bijgewerkt via state management
- Badge counter wordt automatisch herberekend bij wijzigingen
- Dropdown lijst wordt automatisch geüpdatet

---

## 🐛 Troubleshooting

### Probleem: Notificaties worden niet getoond

**Symptomen:**
- Notificatie badge toont geen nummers
- Dropdown is leeg
- Meldingen verschijnen niet
- Notifications paneel op dashboard is blank

**Oorzaak:**
- Notificaties module is uitgeschakeld
- Geen rechten om notificaties te zien
- LocalStorage is vol/corrupt
- Browser notifications disabled

**Oplossing:**
1. Check Admin Instellingen → Modules → Notificaties is ON
2. Clear browser cache (Ctrl+Shift+Delete)
3. Clear LocalStorage: F12 → Application → Clear Storage
4. Allow browser notifications in settings
5. Ververs pagina (F5)

---

### Probleem: Mark as read werkt niet

**Symptomen:**
- Notificatie blijft ongelezen na klik
- Badge gaat niet weg
- "Alles markeren als gelezen" knop doet niets

**Oorzaak:**
- JavaScript error
- State management probleem
- Database sync fout
- Browser cache probleem

**Oplossing:**
1. Klik opnieuw op notificatie
2. Probeer "Alles markeren" knop
3. Ververs pagina (F5)
4. Clear browser cache (Ctrl+Shift+Delete)
5. Check browser console (F12) voor errors

---

### Probleem: Push notificaties werken niet

**Symptomen:**
- Geen desktop notifications
- Push geluid werkt niet
- Meldingen werden niet getoond als tab closed

**Oorzaak:**
- Browser push notifications disabled
- Feature nog niet geïmplementeerd
- Service worker probleem
- OS permissions niet gegeven

**Oplossing:**
1. Allow push notifications in browser settings
2. Check OS (Windows/Mac) permission settings
3. Test op supported browser (Chrome, Firefox, Edge)
4. Check Service Worker in Application → Service Workers
5. Enable notifications in Advanced Settings

---

### Veelvoorkomende Errors

#### Error: "Notification permission denied"
**Oorzaak:** Gebruiker heeft push notifications geweigerd
**Oplossing:** Allow notifications in browser settings en reset

#### Error: "Failed to create notification"
**Oorzaak:** Browser ondersteunt niet deze notificatie
**Oplossing:** Update browser naar nieuwste versie

#### Error: "Database sync error"
**Oorzaak:** Kan status niet opslaan
**Oplossing:** Check database connectie en try opnieuw

---

### Badge Counter Issues

**Symptomen:** Badge toont verkeerde aantal, update niet
**Mogelijke oorzaken:**
- Cache is verouderd
- State sync probleem
- Unread count klopt niet
**Oplossingen:**
1. Refresh pagina (F5)
2. Clear LocalStorage
3. Mark all as read en unread again
4. Check database logs

---

### Missing Notifications Issues

**Symptomen:** Notificatie voor bepaald event verschijnt niet
**Mogelijke oorzaken:**
- Event notification feature nog niet implemented
- User role heeft geen access
- Trigger condition niet voldaan
**Oplossingen:**
1. Check of event notification in deze versie is
2. Verify user role/permissions
3. Zorg trigger condition is voldaan
4. Check system event logs

---

### Performance Issues

**Symptomen:** Notificaties laden traag, interface traag
**Mogelijke oorzaken:**
- Veel notificaties in list
- Browser performance issue
- Large localStorage
**Oplossingen:**
1. Mark old as read/delete
2. Clear browser cache
3. Close ander tabs
4. Use modern browser
5. Check internet speed

---

### Tips voor Debugging

1. **Open Browser Console** (F12) om errors te zien
2. **Check Network Tab** voor API errors
3. **Refresh de pagina** (F5) bij rare gedrag
4. **Clear LocalStorage** voor data issues
5. **Test in Incognito Mode** om extensies uit te sluiten

## Gerelateerde Modules

- [Dashboard](./dashboard.md) - Voor notificaties paneel
- [Voorraadbeheer](./inventory.md) - Voor lage voorraad meldingen
- [Accounting](./accounting.md) - Voor offerte/factuur meldingen
- [Werkorders](./workorders.md) - Voor werkorder meldingen

---

## Tips

1. **Badge counter** - Let op het cijfer, dit zijn je ongelezen meldingen
2. **Kleuren gebruiken** - Rode/oranje meldingen hebben prioriteit
3. **Direct actie** - Klik op notificatie om direct naar relevante pagina te gaan
4. **Clean inbox** - Markeer regelmatig als gelezen voor overzicht
5. **Dashboard start** - Begin elke dag met checken notificaties paneel op dashboard

---

## Versie Geschiedenis

- **V4.0** - Volledige notificaties systeem met 4 types en automatische meldingen
- **V3.5** - Notificaties paneel op dashboard
- **V3.0** - Basis notificaties bel met badge counter
