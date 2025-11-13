# Kassasysteem (POS)

## Overzicht

Volledig geïntegreerd kassasysteem voor directe verkopen met real-time voorraad controle en automatische updates.

## Functionaliteiten

### Basis POS Features

- ✅ **Producten verkopen** met real-time voorraad check
- ✅ **Winkelwagen beheer**
- ✅ **Klant selectie** (optioneel)
- ✅ **Automatische voorraad updates**
- ✅ **Transacties registreren**
- ✅ **Totaal berekening met BTW**
- ✅ **Winkelwagen wissen functionaliteit**

### Werkorder Integratie

- ✅ **Koppeling met werkorders** - Materialen gereserveerd voor werkorders worden getoond

## Gebruik

### Verkoop Proces

1. **Selecteer producten** uit voorraad
   - Voorraad wordt real-time gecontroleerd
   - Alleen beschikbare items kunnen geselecteerd worden

2. **Klant selecteren** (optioneel)
   - Kies bestaande klant
   - Of maak nieuwe klant aan
   - Of verkoop als "Particulier (Kassa)"

3. **Winkelwagen beheer**
   - Pas aantallen aan
   - Verwijder items indien nodig
   - Zie direct totaal incl. BTW

4. **Transactie afronden**
   - Bevestig verkoop
   - Voorraad wordt automatisch bijgewerkt
   - Transactie wordt geregistreerd in boekhouding

### Winkelwagen Wissen

- Gebruik "Wis Winkelwagen" knop om alle items te verwijderen
- Bevestiging vereist voor veiligheid

## Integraties

### Voorraad Module

- Real-time voorraad controle bij producttoevoeging
- Automatische voorraad aftrek bij voltooiing verkoop
- Waarschuwingen bij onvoldoende voorraad

### Boekhouding Module

- Automatische factuur generatie
- Directe registratie in "Kassa Verkopen" tab
- Betaalmethode tracking (Contant, PIN, iDEAL, Creditcard)
- Status automatisch op "Betaald"

### CRM Module

- Optionele klant koppeling
- Verkoop historie per klant
- Omzet tracking per klant

## 🐛 Troubleshooting

### Probleem: Betalingen niet geregistreerd

**Symptomen:**
- Transactie wordt niet opgeslagen
- Betaling verschijnt niet in boekhouding
- Kassablik is niet bijgewerkt

**Oorzaak:**
- Database connectie verbroken
- Betaalmethode niet ingesteld
- Klant niet correct geselecteerd
- Backend service down

**Oplossing:**
1. Check database connectie in Admin Instellingen
2. Zorg betaalmethode is ingesteld
3. Selecteer klant correct (of "Particulier (Kassa)")
4. Ververs pagina (F5)
5. Controleer backend logs

---

### Probleem: Kassalade balans klopt niet

**Symptomen:**
- Totaal in systeem != cash in lade
- Tellingen kloppen niet
- Discrepantie in eindstand

**Oorzaak:**
- Transacties niet compleet verwerkt
- Retouren niet goed geregistreerd
- Handmatige aanpassingen
- Duplicate transacties

**Oplossing:**
1. Voer handmatige inventarisatie uit
2. Check Accounting module voor alle transacties
3. Zoek naar duplicate entries
4. Controleer retouren zijn geregistreerd
5. Sluit dagkassa en start nieuwe dag

---

### Probleem: Bonnetje printen werkt niet

**Symptomen:**
- Print knop doet niets
- Printer reageert niet
- Bonnetje is leeg/onleesbaar

**Oorzaak:**
- Printer niet aansluitend
- Printer driver probleem
- Browser print settings
- Papier is op of zit vast

**Oplossing:**
1. Check printer is aan en aansluitend
2. Update printer drivers
3. Check browser print dialog
4. Verifieer papier zit goed
5. Test met andere applicatie

---

### Veelvoorkomende Errors

#### Error: "Payment processing failed"
**Oorzaak:** Betaling kan niet verwerkt worden
**Oplossing:** Check betaalmethode en try opnieuw

#### Error: "Out of stock"
**Oorzaak:** Product is niet op voorraad
**Oplossing:** Check voorraad in Inventory module, voeg toe of selecteer ander product

#### Error: "Invalid customer selection"
**Oorzaak:** Klant is niet correct geselecteerd
**Oplossing:** Selecteer bestaande klant of gebruik "Particulier (Kassa)"

---

### Winkelwagen Issues

**Symptomen:** Items kunnen niet toegevoegd worden, winkelwagen wissing werkt niet
**Mogelijke oorzaken:**
- Voorraad check faalt
- Database sync probleem
- Browser cache
**Oplossingen:**
1. Check voorraad is beschikbaar
2. Ververs pagina (F5)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Controleer database connectie

---

### Klant Selectie Issues

**Symptomen:** Klanten apareert niet in dropdown, selectie werkt niet
**Mogelijke oorzaken:**
- Geen klanten aangemaakt
- Zoekterm is te specifiek
- Filter is actief
**Oplossingen:**
1. Check klanten zijn aangemaakt in CRM
2. Probeer bredere zoekterm
3. Clear filters
4. Use "Particulier (Kassa)" als default

---

### Tips voor Debugging

1. **Open Browser Console** (F12) om errors te zien
2. **Check Network Tab** voor API errors
3. **Refresh de pagina** (F5) bij rare gedrag
4. **Controleer voorraad** voor stock issues
5. **Test in Incognito Mode** om extensies uit te sluiten

## Gerelateerde Modules

- [Voorraadbeheer](./inventory.md) - Voor voorraad controle
- [Accounting](./accounting.md) - Voor facturatie en boekhouding
- [CRM](./crm.md) - Voor klantbeheer
- [Werkorders](./workorders.md) - Voor gereserveerde materialen

## Tips

- **Voorraad check** - Controleer voorraad voordat je grote verkopen doet
- **Klant koppeling** - Koppel klanten voor betere historie tracking
- **Regelmatige controle** - Check dagelijks kassa verkopen in boekhouding module
