import LegalPageLayout from '@/components/legal/LegalPageLayout'

export default function ImpressumPage() {
  return (
    <LegalPageLayout title="Impressum">
      <p className="mb-6 text-xs text-gray-400">
        Hinweis: Dies ist ein Muster-Platzhaltertext gemäß §5 TMG und muss vor Veröffentlichung
        durch die tatsächlichen Unternehmensangaben ersetzt werden.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Angaben gemäß §5 TMG</h2>
      <p className="mb-4">
        sbglobal UG (haftungsbeschränkt)<br />
        Musterstraße 1<br />
        10115 Berlin, Deutschland
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Vertreten durch</h2>
      <p className="mb-4">Geschäftsführer: Max Mustermann</p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Kontakt</h2>
      <p className="mb-4">E-Mail: sbglobal026@gmail.com</p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Registereintrag</h2>
      <p className="mb-4">
        Eintragung im Handelsregister<br />
        Registergericht: Amtsgericht Berlin-Charlottenburg<br />
        Registernummer: HRB 000000 B
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Umsatzsteuer-ID</h2>
      <p className="mb-4">
        Umsatzsteuer-Identifikationsnummer gemäß §27a Umsatzsteuergesetz:<br />
        DE000000000
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Verantwortlich für den Inhalt</h2>
      <p className="mb-4">
        Max Mustermann, Musterstraße 1, 10115 Berlin, Deutschland
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">EU-Streitschlichtung</h2>
      <p className="mb-4">
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
        https://ec.europa.eu/consumers/odr/. Unsere E-Mail-Adresse finden Sie oben im Impressum.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Verbraucherstreitbeilegung</h2>
      <p className="mb-4">
        Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </LegalPageLayout>
  )
}
