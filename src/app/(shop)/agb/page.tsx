import LegalPageLayout from '@/components/legal/LegalPageLayout'

export default function AgbPage() {
  return (
    <LegalPageLayout title="AGB">
      <p className="mb-6 text-xs text-gray-400">
        Hinweis: Dies ist ein Muster-Platzhaltertext für die Allgemeinen Geschäftsbedingungen und
        muss vor Veröffentlichung durch rechtsverbindlich geprüfte Inhalte ersetzt werden.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§1 Geltungsbereich</h2>
      <p className="mb-4">
        Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge, die über den Onlineshop
        von sbglobal UG (haftungsbeschränkt) („wir", „uns") zwischen uns und unseren Kunden
        geschlossen werden.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§2 Vertragsschluss</h2>
      <p className="mb-4">
        Die Darstellung der Produkte im Onlineshop stellt kein rechtlich bindendes Angebot dar,
        sondern einen unverbindlichen Online-Katalog. Mit Absenden der Bestellung geben Sie ein
        verbindliches Angebot zum Kauf ab, das wir durch eine Bestätigung annehmen.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§3 Preise und Versandkosten</h2>
      <p className="mb-4">
        Alle angegebenen Preise verstehen sich als Endpreise inklusive der gesetzlichen
        Mehrwertsteuer. Zusätzlich anfallende Versandkosten werden vor Abschluss der Bestellung
        transparent ausgewiesen.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§4 Altersverifikation</h2>
      <p className="mb-4">
        Der Verkauf alkoholischer Getränke erfolgt ausschließlich an Personen ab 18 Jahren. Bei
        der Bestellung sowie bei Zustellung kann eine Altersverifikation erforderlich sein.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§5 Lieferung</h2>
      <p className="mb-4">
        Die Lieferung erfolgt an die vom Kunden angegebene Lieferadresse. Voraussichtliche
        Lieferzeiten werden im Bestellprozess angezeigt.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§6 Widerrufsrecht</h2>
      <p className="mb-4">
        Verbrauchern steht ein gesetzliches Widerrufsrecht von 14 Tagen ab Erhalt der Ware zu.
        Nähere Einzelheiten regelt eine gesonderte Widerrufsbelehrung.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§7 Zahlung</h2>
      <p className="mb-4">
        Die Zahlung kann über die im Bestellprozess angebotenen Zahlungsmethoden erfolgen.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§8 Schlussbestimmungen</h2>
      <p className="mb-4">
        Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
        Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen
        Bestimmungen unberührt.
      </p>
    </LegalPageLayout>
  )
}
