import LegalPageLayout from '@/components/legal/LegalPageLayout'

export default function ImpressumPage() {
  return (
    <LegalPageLayout title="Impressum">
      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Angaben gemäß § 5 DDG</h2>
      <p className="mb-4">
        Eunkyung Lee (Einzelunternehmer)<br />
        Richard-Wagner-Str. 13<br />
        60318 Frankfurt am Main, Deutschland
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Vertreten durch</h2>
      <p className="mb-4">Inhaber: Eunkyung Lee</p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Kontakt</h2>
      <p className="mb-4">E-Mail: sbglobal026@gmail.com</p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Umsatzsteuer-ID</h2>
      <p className="mb-4">
        Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
        DE370567813
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p className="mb-4">
        Eunkyung Lee, Richard-Wagner-Str. 13, 60318 Frankfurt am Main, Deutschland
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">Verbraucherstreitbeilegung</h2>
      <p className="mb-4">
        Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </LegalPageLayout>
  )
}
