import LegalPageLayout from '@/components/legal/LegalPageLayout'

export default function DatenschutzPage() {
  return (
    <LegalPageLayout title="Datenschutzerklärung">
      <p className="mb-6 text-xs text-gray-400">
        Hinweis: Dies ist ein Muster-Platzhaltertext und muss vor Veröffentlichung durch eine
        rechtsverbindlich geprüfte Datenschutzerklärung ersetzt werden.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">1. Verantwortlicher</h2>
      <p className="mb-4">
        Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
        sbglobal UG (haftungsbeschränkt)<br />
        Musterstraße 1, 10115 Berlin, Deutschland<br />
        E-Mail: sbglobal026@gmail.com
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">2. Erhebung und Speicherung personenbezogener Daten</h2>
      <p className="mb-4">
        Beim Besuch unserer Website sowie bei einer Bestellung erheben wir personenbezogene Daten
        wie Name, Adresse, E-Mail-Adresse und Zahlungsinformationen, soweit diese für die
        Vertragsabwicklung erforderlich sind.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">3. Zweck der Datenverarbeitung</h2>
      <p className="mb-4">
        Ihre Daten werden zur Abwicklung von Bestellungen, zur Kommunikation mit Ihnen sowie zur
        Erfüllung gesetzlicher Pflichten verarbeitet.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">4. Weitergabe von Daten</h2>
      <p className="mb-4">
        Eine Weitergabe Ihrer Daten an Dritte erfolgt nur, soweit dies zur Vertragserfüllung
        (z. B. Versanddienstleister, Zahlungsanbieter) erforderlich ist oder wir gesetzlich dazu
        verpflichtet sind.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">5. Cookies</h2>
      <p className="mb-4">
        Unsere Website verwendet Cookies, um die Nutzung des Onlineshops zu ermöglichen und zu
        verbessern. Sie können der Verwendung von Cookies in Ihren Browsereinstellungen
        widersprechen.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">6. Ihre Rechte</h2>
      <p className="mb-4">
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der
        Verarbeitung Ihrer personenbezogenen Daten sowie ein Widerspruchsrecht gegen die
        Verarbeitung. Wenden Sie sich hierzu an die oben genannte Kontaktadresse.
      </p>
    </LegalPageLayout>
  )
}
