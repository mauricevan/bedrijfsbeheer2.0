# Dashboard / Overzicht

🆕 **UITGEBREID MET EMAIL INTEGRATIE V5.8**

## Overzicht

Het Dashboard biedt een realtime weergave van alle belangrijke bedrijfsactiviteiten op één centrale plek.

## Functionaliteiten

### Basis Dashboard Features

- ✅ **Omzet overzicht** met KPI cards
- ✅ **Werkbonnen status samenvatting**
- ✅ **Voorraadniveau waarschuwingen**
- ✅ **Notificaties paneel** met ongelezen meldingen
- ✅ **Lage voorraad alerts**
- ✅ **Recente werkorders overzicht**

### Email Drop Zone (V5.8)

🆕 Sleep .eml bestanden of Outlook emails naar dashboard voor automatische verwerking:

- ✅ **Drag-and-drop functionaliteit** voor .eml bestanden
- ✅ **Directe Outlook integratie** (via Electron app)
- ✅ **Automatische email parsing** en workflow detectie
- ✅ **Preview modal** voor email verificatie
- ✅ **Automatische klant/lead matching** op basis van email adres
- ✅ **Creëer orders, taken of notificaties** vanuit emails
- ✅ **Visuele feedback** tijdens verwerking

## Gebruik

Het Dashboard is het startpunt van de applicatie en geeft direct inzicht in:

1. **Financiële status** - Omzet en open posten
2. **Operationele status** - Werkorders en hun voortgang
3. **Voorraad status** - Waarschuwingen voor lage voorraad
4. **Communicatie** - Ongelezen notificaties en emails

## 🐛 Troubleshooting

### Probleem: Email Drop Zone werkt niet

**Symptomen:**
- Emails kunnen niet gesleept worden naar dashboard
- "Drop zone" verschijnt niet
- Upload faalt met foutmelding

**Oorzaak:**
- Browser ondersteunt drag-and-drop niet (oude browser)
- Electron app niet correct geconfigureerd
- Bestandstype is niet .eml

**Oplossing:**
1. Update naar nieuwste browser versie
2. Check of .eml bestanden worden gebruikt (niet .msg of .outlook)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Restart Electron app
5. Test met kleine .eml bestand

---

### Probleem: KPI Cards tonen verkeerde data

**Symptomen:**
- Omzet totaal klopt niet
- Werkbonnen count is incorrect
- Getallen updaten niet

**Oorzaak:**
- Data niet gesynchroniseerd met backend
- Filter instelling actief
- Verkeerde datum bereik geselecteerd
- Browser cache verouderd

**Oplossing:**
1. Ververs de pagina (F5)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check of geen filters actief zijn
4. Controleer systeem datum/tijd op computer
5. Controleer database connectie in Admin Instellingen

---

### Probleem: Notificaties laden niet

**Symptomen:**
- Notificatie badge toont geen nummers
- Notificaties paneel is leeg
- Meldingen worden niet getoond

**Oorzaak:**
- Notificaties module is uitgeschakeld
- Geen rechten om notificaties te zien
- Database verbinding verbroken
- LocalStorage is vol

**Oplossing:**
1. Check Admin Instellingen → Module Beheer → Notificaties is ingeschakeld
2. Ververs de pagina (F5)
3. Clear LocalStorage: Open F12 → Application → Clear Storage
4. Check browser console (F12) voor errors
5. Controleer database verbinding

---

### Veelvoorkomende Errors

#### Error: "Drag and drop not supported"
**Oorzaak:** Browser is te oud of ondersteunt drag-and-drop niet
**Oplossing:** Update browser naar nieuwste versie (Chrome 90+, Firefox 88+, Safari 14+)

#### Error: "File upload failed"
**Oorzaak:** Bestand is te groot of verkeerd formaat
**Oplossing:** Zorg dat bestand .eml is en kleiner dan 10MB

#### Error: "Database connection timeout"
**Oorzaak:** Database server is offline
**Oplossing:** Check internet verbinding en database status in Admin Instellingen

---

### Performance Issues

**Symptomen:** Trage laadtijden, vertraagde KPI updates
**Mogelijke oorzaken:**
- Veel data in systeem (> 10.000 transacties)
- Meerdere gebruikers tegelijk online
- Slechte internetverbinding

**Oplossingen:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Ververs de pagina (F5)
3. Check Network Tab in F12 voor trage requests
4. Close andere tabs/applicaties
5. Test in Incognito Mode

---

### Rechten Problemen

**Symptomen:** "Geen toegang" melding, sommige elementen zijn grijs
**Oorzaak:** Gebruiker heeft niet voldoende rechten
**Oplossing:**
1. Check huidige rol in profiel (rechts bovenin)
2. Vraag een Admin om rechten te verhogen
3. Zie [User Roles](../04-features/user-roles.md) voor details

---

### Tips voor Debugging

1. **Open Browser Console** (F12) om errors te zien
2. **Check Network Tab** voor API errors
3. **Refresh de pagina** (F5) bij rare gedrag
4. **Clear Local Storage** als data corrupt lijkt
5. **Test in Incognito Mode** om extensies uit te sluiten

## Gerelateerde Modules

- [Werkorders](./workorders.md) - Voor werkorder beheer
- [Voorraadbeheer](./inventory.md) - Voor voorraad details
- [Notificaties](./notifications.md) - Voor meldingen systeem
- [CRM](./crm.md) - Voor email integratie

## Versie Geschiedenis

- **V5.8** - Email integratie met drag-and-drop en automatische workflow detectie
