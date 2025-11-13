# Webshop Beheer

🆕 **NIEUWE MODULE - VOLLEDIG GEÏMPLEMENTEERD**

## Overzicht

Professioneel E-commerce Beheer Systeem voor volledige webshop management met product beheer, categorieën, bestellingen en inventory integratie.

---

## Dashboard

### Real-time Statistieken

- ✅ **Actieve producten** - Aantal gepubliceerde producten
- ✅ **Bestellingen** - Totaal aantal orders
- ✅ **Omzet** - Totale webshop omzet
- ✅ **KPI cards** met visuele indicatoren
- ✅ **Overzicht** van webshop performance

---

## Product Beheer Tab

### Volledige Product CRUD

- ✅ **Maak producten** aan met uitgebreid formulier
- ✅ **Bewerk producten** - Wijzig alle product details
- ✅ **Verwijder producten** - Permanent verwijderen (met bevestiging)
- ✅ **Archiveer producten** - Tijdelijk verbergen zonder verwijderen

### Uitgebreid Product Formulier

Georganiseerd in overzichtelijke secties:

#### 📝 Basis Informatie

- ✅ **Naam** - Product naam
- ✅ **Slug** - URL-vriendelijke naam (automatisch gegenereerd)
- ✅ **SKU** - Automatische nummering (PRD-0001, PRD-0002, etc.)
- ✅ **Korte beschrijving** - Voor product cards
- ✅ **Lange beschrijving** - Uitgebreide product details

#### 💰 Prijs & Voorraad

- ✅ **Verkoopprijs** - Actuele verkoop prijs
- ✅ **Wasprijs** - Originele prijs voor strikethrough
- ✅ **Inkoopprijs** - Voor winstberekening
- ✅ **Voorraad tracking** - Houdt voorraad bij
- ✅ **Voorraad aantal** - Actuele voorraad
- ✅ **Lage voorraad drempel** - Waarschuwing instellen

#### 🏷️ Categorieën

- ✅ **Multi-select** - Product kan in meerdere categorieën
- ✅ **Primaire categorie** - Hoofd categorie selecteren
- ✅ **Hiërarchische weergave** - Parent/child categorieën

#### 👁️ Status & Zichtbaarheid

- ✅ **Status workflow**:
  - **Draft** - Concept (niet zichtbaar)
  - **Active** - Gepubliceerd (zichtbaar)
  - **Archived** - Gearchiveerd (verborgen)
- ✅ **Zichtbaarheid**:
  - **Public** - Zichtbaar voor iedereen
  - **Private** - Alleen voor ingelogde gebruikers
  - **Hidden** - Verborgen in catalogus

#### 🚚 Verzending

- ✅ **Gewicht** - Product gewicht (kg)
- ✅ **Afmetingen** - Lengte × Breedte × Hoogte (cm)
- ✅ **Verzendcategorie** - Standaard/Express/Pickup
- ✅ **Digitaal product** - Voor downloads (geen verzending)

#### 🔍 SEO & Marketing

- ✅ **Meta title** - SEO title tag
- ✅ **Meta description** - SEO description
- ✅ **Tags** - Zoektermen en keywords

#### ⚙️ Extra Opties

- ✅ **BTW tarief** - 21%, 9% of 0%
- ✅ **Reviews toestaan** - Klanten kunnen reviews schrijven
- ✅ **Admin notities** - Interne notities (niet zichtbaar voor klanten)

### Automatische Generatie

- ✅ **URL slug** uit productnaam (SEO-vriendelijk)
  - Automatisch: spaties → koppeltekens
  - Lowercase conversie
  - Speciale karakters verwijderd
- ✅ **SKU nummering** (PRD-0001, PRD-0002, etc.)
  - Automatisch oplopend
  - Uniek per product

### Zoeken & Filteren

- ✅ **Zoek functionaliteit**:
  - Zoek op naam
  - Zoek op SKU
  - Zoek in beschrijvingen
  - Zoek in tags
- ✅ **Filter opties**:
  - Filter op status (actief/concept/gearchiveerd)
  - Filter op categorie
- ✅ **View toggle**:
  - Grid view (kaarten)
  - List view (tabel)

### Inventory Koppeling

- ✅ **Koppel aan voorraad items** voor automatische synchronisatie
- ✅ **Dropdown selectie** van voorraad items
- ✅ **Synchronisatie voorbereid** (voorraad sync in toekomstige versie)
- ✅ **Duidelijke indicatie** van koppeling

### Product Varianten

- ✅ **Structuur aanwezig** voor varianten (voorbereid voor frontend):
  - Kleuren
  - Maten
  - Andere opties

### Voorraad Management

- ✅ **Directe voorraad tracking**
- ✅ **Lage voorraad drempelwaarde**
- ✅ **Automatische synchronisatie** met Inventory module
- ✅ **Visuele voorraad indicatoren**:
  - Groen: Op voorraad
  - Oranje: Lage voorraad
  - Rood: Niet op voorraad

### Status Workflow

- ✅ **Draft → Active** (publiceren)
  - Knop: "Publiceer"
  - Product wordt zichtbaar in webshop
- ✅ **Active → Archived** (archiveren)
  - Knop: "Archiveer"
  - Product verborgen maar niet verwijderd
- ✅ **Quick toggle knoppen** voor snel status wijzigen

### Image Upload Voorbereiding

- ✅ **Structuur klaar** voor frontend integratie
- ✅ **Multiple images** support
- ✅ **Featured image** selectie
- ✅ **Image array** in data model

---

## Categorieën Tab

### Volledig Categorie Beheer

- ✅ **CRUD functionaliteit**:
  - Create - Nieuwe categorieën aanmaken
  - Read - Categorieën bekijken
  - Update - Categorieën bewerken
  - Delete - Categorieën verwijderen

### Hiërarchische Structuur

- ✅ **Parent/child categorieën**:
  - Hoofd categorieën (parent)
  - Sub-categorieën (child)
  - Onbeperkte diepte mogelijk
- ✅ **Visuele hiërarchie** - Subcategorieën duidelijk geïndenteerd

### Multi-categorie Support

- ✅ **Producten in meerdere categorieën** - Flexibele indeling
- ✅ **Primaire categorie** - Selecteer hoofd categorie voor product cards

### Categorie Features

- ✅ **Sorteerbare volgorde** - Bepaal weergave volgorde in webshop
- ✅ **SEO velden**:
  - Meta title per categorie
  - Meta description per categorie
- ✅ **Product count** - Zie hoeveel producten per categorie
- ✅ **Actief/Inactief toggle** - Verberg categorieën zonder verwijderen

### Categorie Informatie

- ✅ **Naam** - Categorie naam
- ✅ **Slug** - URL-vriendelijke naam
- ✅ **Beschrijving** - Categorie beschrijving
- ✅ **Parent categorie** - Koppel aan bovenliggende categorie (optioneel)
- ✅ **Sorteer volgorde** - Nummer voor weergave volgorde

---

## Bestellingen Tab

### Volledig Order Overzicht

- ✅ **Alle bestellingen** met details
- ✅ **Order informatie**:
  - Ordernummer (automatisch)
  - Klant informatie
  - Besteldatum
  - Order status
  - Betaalstatus
  - Totaal bedrag

### Zoeken & Filteren

- ✅ **Zoek functionaliteit**:
  - Zoek op ordernummer
  - Zoek op klantnaam
  - Zoek op email
- ✅ **Filter op order status**:
  - Pending (Openstaand)
  - Processing (In Behandeling)
  - Shipped (Verzonden)
  - Delivered (Afgeleverd)
  - Cancelled (Geannuleerd)
  - Refunded (Terugbetaald)

### Order Status Tracking

- ✅ **Status workflow**:
  - Openstaand → In Behandeling → Verzonden → Afgeleverd
- ✅ **Quick action buttons** voor status updates:
  - "Markeer als In Behandeling"
  - "Markeer als Verzonden"
  - "Annuleer Bestelling"

### Payment Status Tracking

- ✅ **Betaalstatus**:
  - Niet betaald (Unpaid)
  - Betaald (Paid)
- ✅ **Betaling details**:
  - Betalingsmethode
  - Betaling referentie
  - Betaaldatum tracking

### Order Detail Modal

Volledige order informatie in overzichtelijke modal:

#### Klant Informatie

- ✅ **Naam en contact** - Klant naam, email, telefoon
- ✅ **Verzendadres** - Volledig verzendadres
- ✅ **Factuuradres** - Volledig factuuradres

#### Bestelde Items

- ✅ **Items tabel** met:
  - Productnaam
  - Aantal
  - Prijs per stuk
  - Subtotaal

#### Verzending

- ✅ **Tracking nummer** - Voor klant tracking
- ✅ **Vervoerder** - Verzendservice (PostNL, DHL, etc.)

#### Notities

- ✅ **Klant notities** - Opmerkingen van klant
- ✅ **Admin notities** - Interne notities (niet zichtbaar voor klant)

#### Financiën

- ✅ **Order totalen breakdown**:
  - Subtotaal (excl. BTW)
  - BTW bedrag
  - Verzendkosten
  - Korting (indien van toepassing)
  - Totaal (incl. BTW)

### Status Updates

Snelle acties vanuit order lijst:

- ✅ **Markeer als "In Behandeling"** - Start order verwerking
- ✅ **Markeer als "Verzonden"** - Order verzonden naar klant
- ✅ **Markeer als "Betaald"** - Betaling ontvangen
- ✅ **Annuleer bestelling** - Order annuleren met reden

### Visuele Indicatoren

- ✅ **Kleurgecodeerde status badges**:
  - Grijs: Pending
  - Blauw: Processing
  - Paars: Shipped
  - Groen: Delivered
  - Rood: Cancelled
  - Oranje: Refunded
- ✅ **Payment status indicators**:
  - Rood: Niet betaald
  - Groen: Betaald
- ✅ **Order totalen highlight** - Totaalbedrag prominent weergegeven

---

## Design & UX Principes

### Progressive Disclosure

- ✅ **Georganiseerde secties** met duidelijke headers
- ✅ **Inklapbare secties** voor overzichtelijkheid

### Color Coding

- ✅ **Verschillende kleuren** per sectie voor snelle scanning
- ✅ **Visuele hiërarchie** met kleuraccenten

### Error Prevention

- ✅ **Automatische generatie** van slug en SKU
- ✅ **Validatie** van verplichte velden
- ✅ **Confirmation dialogs** bij verwijderen

### Feedback Loops

- ✅ **Directe visuele feedback** bij alle acties
- ✅ **Success/error berichten**
- ✅ **Loading states**

### Responsive Design

- ✅ **Volledig werkend** op mobile, tablet en desktop
- ✅ **Aangepaste layouts** per schermformaat

### Intuïtieve Navigatie

- ✅ **Duidelijke tabs** voor verschillende secties
- ✅ **Actie buttons** prominent aanwezig
- ✅ **Breadcrumbs** voor navigatie

### Consistent Patterns

- ✅ **Herkenbare UI patterns** door hele module
- ✅ **Consistente button styling**
- ✅ **Uniforme formulier layouts**

---

## Frontend Voorbereiding

### SEO-Ready

- ✅ **Slugs** - URL-vriendelijke product namen
- ✅ **Meta titles** - Voor alle producten en categorieën
- ✅ **Meta descriptions** - SEO omschrijvingen

### Image Structure

- ✅ **Image arrays** voorbereid
- ✅ **Featured images** - Hoofdafbeelding per product
- ✅ **Multiple images** - Galerij support

### Variant System

- ✅ **Structuur voor product varianten**:
  - Kleuren
  - Maten
  - Andere opties (materiaal, stijl, etc.)

### Shopping Cart Types

- ✅ **WebshopCartItem** - Cart item type gedefinieerd
- ✅ **ShoppingCart** - Cart type gedefinieerd

### Coupon System

- ✅ **Coupon types** - Voor kortingscodes
- ✅ **Discount berekeningen** voorbereid

### Address Structure

- ✅ **Volledige adres structuur** voor checkout
- ✅ **Verzend- en factuuradres** apart

### Review System

- ✅ **Allow reviews flag** - Per product instelbaar
- ✅ **Rating structure** - Voor sterren systeem

### Statistics Ready

- ✅ **View count** - Aantal bekeken
- ✅ **Purchase count** - Aantal verkocht
- ✅ **Wishlist count** - Aantal op verlanglijst

---

## Inventory Integratie

### Koppeling met Inventory Module

- ✅ **Koppeling** met Inventory module
- ✅ **Dropdown selectie** van voorraad items
- ✅ **Synchronisatie voorbereid** (voorraad sync in toekomstige versie)
- ✅ **Duidelijke indicatie** van koppeling

### Toekomstige Synchronisatie

- 🔄 **Automatische voorraad sync** met Inventory
- 🔄 **Twee-weg synchronisatie** - Verkoop in webshop update inventory
- 🔄 **Voorraad reservering** bij pending orders

---

## Toekomstige Features

- 🔄 **Product varianten beheer (UI)** - Frontend voor kleuren, maten, etc.
- 🔄 **Bulk product acties** - Meerdere producten tegelijk bewerken
- 🔄 **Product templates** - Herbruikbare product sjablonen
- 🔄 **Automatische voorraad synchronisatie** met Inventory
- 🔄 **Export/import functionaliteit** - CSV/Excel import/export
- 🔄 **Coupon beheer UI** - Kortingscodes aanmaken en beheren
- 🔄 **Review moderatie** - Klant reviews goedkeuren/afwijzen
- 🔄 **Product analytics** - Uitgebreide product statistieken
- 🔄 **Cross-sell/upsell** - Gerelateerde producten aanbevelen

---

## Gebruik

### Product Toevoegen

1. **Open Product Beheer tab**
2. **Klik "Nieuw Product"**
3. **Vul alle secties in**:
   - Basis informatie (verplicht)
   - Prijs & voorraad
   - Categorieën selecteren
   - Status en zichtbaarheid
   - Verzending details (indien fysiek product)
   - SEO velden voor optimalisatie
4. **Opslaan**

### Product Publiceren

1. **Maak product aan** (status: Draft)
2. **Controleer alle gegevens**
3. **Klik "Publiceer"**
4. **Product is nu zichtbaar** in webshop

### Categorie Aanmaken

1. **Open Categorieën tab**
2. **Klik "Nieuwe Categorie"**
3. **Vul in**:
   - Naam
   - Slug (automatisch)
   - Beschrijving
   - Parent categorie (optioneel)
   - Sorteer volgorde
   - SEO velden
4. **Opslaan**

### Bestelling Verwerken

1. **Open Bestellingen tab**
2. **Klik op order** voor details
3. **Controleer items** en klant info
4. **Update status**:
   - "In Behandeling" → Start verwerking
   - Verzamel items
   - Pak order in
   - "Verzonden" → Voeg tracking toe
5. **Klant wordt automatisch geïnformeerd** (toekomstig)

---

## 🐛 Troubleshooting

### Probleem: Producten niet zichtbaar

**Symptomen:**
- Producten verschijnen niet in webshop
- Product count zegt > 0 maar niets zichtbaar
- Status is "Active" maar niet online

**Oorzaak:**
- Product status is "Draft" in plaats van "Active"
- Product zichtbaarheid is "Hidden"
- Frontend synchronisatie probleem
- Categorie is inactive

**Oplossing:**
1. Check product status - moet "Active" zijn
2. Check zichtbaarheid - moet "Public" zijn
3. Klik "Publiceer" om te activeren
4. Check categorie is ook actief
5. Clear frontend cache en refresh

---

### Probleem: Winkelwagen leeggemaakt

**Symptomen:**
- Items verdwijnen uit winkelwagen
- Sessie wordt gereset
- Wagen is leeg zonder actie

**Oorzaak:**
- Browser sessie verlopen
- LocalStorage is gewist
- Logout gebeurde
- Timeout door inactiviteit
- Browser crash/refresh

**Oplossing:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check browser cookie settings
3. Voeg items opnieuw toe
4. Blijf ingelogd (session timeout verhogen)
5. Use niet-private browsing mode

---

### Probleem: Betaling faalt

**Symptomen:**
- Payment button werkt niet
- Transactie wordt niet verwerkt
- Error "Payment processing failed"
- Klant wordt niet doorgeleid naar betaling

**Oorzaak:**
- Payment gateway niet geconfigureerd
- Bestelling heeft geen items
- Klant informatie onvolledig
- Backend service offline

**Oplossing:**
1. Check bestelling heeft items
2. Zorg klant gegevens compleet zijn
3. Controleer payment methode instellingen
4. Check backend service status
5. Try opnieuw met ander payment method

---

### Veelvoorkomende Errors

#### Error: "Product not available"
**Oorzaak:** Product is niet gepubliceerd
**Oplossing:** Go to Product Beheer, check status en zichtbaarheid

#### Error: "Invalid SKU"
**Oorzaak:** SKU formaat is incorrect
**Oplossing:** Zorg SKU uniek is en correct format

#### Error: "Out of stock"
**Oorzaak:** Product is niet op voorraad
**Oplossing:** Update voorraad in Inventory module

---

### Product Beheer Issues

**Symptomen:** Kan product niet aanmaken/bewerken, wijziging wordt niet opgeslagen
**Mogelijke oorzaken:**
- Verplichte veld niet ingevuld
- SKU conflict
- Geen admin rechten
- Database fout
**Oplossingen:**
1. Check alle verplichte velden
2. Verifieer SKU is uniek
3. Check admin rechten
4. Ververs pagina
5. Try opnieuw

---

### Categorie Issues

**Symptomen:** Categorieën werken niet, producten in categorie tonen niet
**Mogelijke oorzaken:**
- Categorie is inactive
- Parent categorie bestaat niet
- Hierarchie probleem
**Oplossingen:**
1. Check categorie is actief
2. Verifieer parent categorie
3. Zorg producten zijn aan categorie gekoppeld
4. Ververs frontend
5. Check categorie slug is correct

---

### Order Management Issues

**Symptomen:** Bestellingen kunnen niet verwerkt worden, status update faalt
**Mogelijke oorzaken:**
- Order status is op eindstatus
- Backend validatie fout
- Geen rechten
**Oplossingen:**
1. Check order status
2. Volg correct workflow
3. Verifieer admin rechten
4. Try status change opnieuw

---

### Tips voor Debugging

1. **Open Browser Console** (F12) om errors te zien
2. **Check Network Tab** voor API errors
3. **Refresh de pagina** (F5) bij rare gedrag
4. **Controleer product details** voor compliance
5. **Test in Incognito Mode** om extensies uit te sluiten

## Gerelateerde Modules

- [Voorraadbeheer](./inventory.md) - Voor voorraad koppeling
- [Accounting](./accounting.md) - Voor order facturatie
- [CRM](./crm.md) - Voor klant beheer

---

## Versie Geschiedenis

- **V5.0** - Volledige webshop module met product, categorie en bestelling beheer
- **V4.8** - Frontend structuur en SEO optimalisatie
