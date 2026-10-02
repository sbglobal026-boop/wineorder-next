import LegalPageLayout from '@/components/legal/LegalPageLayout'

// 약관 — 실제 운영 내용(배송비 요율, 결제 수단, 취소 규칙, 19세 확인)에 맞춰 작성함.
// 배송비나 부가세 규정을 바꾸면 §3 내용도 함께 고칠 것.
export default function AgbPage() {
  return (
    <LegalPageLayout title="AGB">
      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§ 1 Anbieter und Geltungsbereich</h2>
      <p className="mb-4">
        Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen über den Onlineshop
        www.tablecodeeu.com („table code“).
      </p>
      <p className="mb-4">
        Anbieter:<br />
        Eunkyung Lee (Einzelunternehmer)<br />
        Richard-Wagner-Str. 13, 60318 Frankfurt am Main, Deutschland<br />
        E-Mail: info@tablecodeeu.com<br />
        USt-IdNr.: DE370567813
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§ 2 Vertragsschluss</h2>
      <p className="mb-4">
        Die Darstellung der Produkte im Onlineshop ist kein bindendes Angebot. Mit dem Absenden der
        Bestellung geben Sie ein verbindliches Angebot ab. Der Vertrag kommt zustande, sobald wir
        die Bestellung per E-Mail bestätigen oder die Ware versenden.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§ 3 Preise, Versandkosten und Abgaben</h2>
      <p className="mb-4">
        Alle Preise verstehen sich in Euro (EUR). Die Versandkosten werden vor Abschluss der
        Bestellung gesondert ausgewiesen:
      </p>
      <ul className="mb-4 list-disc pl-5 space-y-1">
        <li>Deutschland: 5,00 € pro Bestellung</li>
        <li>Übrige EU: 5,00 € pro Bestellung</li>
        <li>Südkorea: 12,00 € pro Flasche</li>
      </ul>
      <p className="mb-4">
        Bei Lieferungen innerhalb Deutschlands wird die gesetzliche Umsatzsteuer von 19 % im
        Bestellvorgang ausgewiesen. Lieferungen in Länder außerhalb der EU (z. B. Südkorea) erfolgen
        ohne deutsche Umsatzsteuer.
      </p>
      <p className="mb-4">
        Bei Lieferungen außerhalb der EU können Zölle, Einfuhrumsatzsteuer und weitere Abgaben des
        Bestimmungslandes anfallen. Diese sind vom Kunden zu tragen. Im Bestellvorgang angezeigte
        Zollbeträge sind unverbindliche Schätzwerte; maßgeblich ist der Bescheid der zuständigen
        Zollbehörde.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§ 4 Zahlung</h2>
      <p className="mb-4">
        Die Zahlung erfolgt über unseren Zahlungsdienstleister Stripe (u. a. Kredit- und Debitkarte).
        Der Rechnungsbetrag ist mit Vertragsschluss sofort fällig. Bei Zahlung in einer anderen
        Währung als Euro kann der von Ihrem Kartenanbieter verwendete Wechselkurs vom angezeigten
        Betrag abweichen.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§ 5 Lieferung und Stornierung</h2>
      <p className="mb-4">
        Der Versand erfolgt nach Zahlungseingang. Solange die Bestellung noch nicht versandt wurde,
        können Sie sie in Ihrem Kundenkonto selbst stornieren; der Betrag wird dann vollständig
        erstattet. Nach Versandbeginn ist eine Stornierung nur noch über den Widerruf (§ 7) möglich.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§ 6 Mindestalter</h2>
      <p className="mb-4">
        Wir verkaufen alkoholische Getränke ausschließlich an Personen, die das gesetzliche
        Mindestalter erreicht haben. Mit Ihrer Bestellung bestätigen Sie, mindestens 19 Jahre alt zu
        sein. Bei der Zustellung kann eine Alterskontrolle durch Vorlage eines Ausweises erfolgen.
        An Minderjährige wird nicht geliefert.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§ 7 Widerrufsrecht für Verbraucher</h2>
      <p className="mb-4">
        Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
        widerrufen. Die Frist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen
        benannter Dritter die Ware in Besitz genommen haben.
      </p>
      <p className="mb-4">
        Um Ihr Widerrufsrecht auszuüben, informieren Sie uns per E-Mail an info@tablecodeeu.com über
        Ihren Entschluss. Zur Wahrung der Frist genügt die rechtzeitige Absendung der Mitteilung.
      </p>
      <p className="mb-4">
        Im Falle eines wirksamen Widerrufs erstatten wir alle erhaltenen Zahlungen einschließlich der
        Standard-Lieferkosten unverzüglich, spätestens binnen vierzehn Tagen nach Zugang der
        Widerrufserklärung. Wir können die Rückzahlung verweigern, bis wir die Ware zurückerhalten
        haben. Die unmittelbaren Kosten der Rücksendung tragen Sie. Für einen Wertverlust der Ware
        haften Sie nur, wenn dieser auf einen zur Prüfung der Beschaffenheit und Funktionsweise
        nicht notwendigen Umgang mit der Ware zurückzuführen ist.
      </p>
      <p className="mb-4">
        <strong>Ausnahme:</strong> Das Widerrufsrecht besteht nicht bei der Lieferung versiegelter
        Waren, die aus Gründen des Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet
        sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde (§ 312g Abs. 2 Nr. 3 BGB).
        Bei geöffneten Flaschen sind Rückgabe und Erstattung daher ausgeschlossen. Ungeöffnete,
        original versiegelte Flaschen können Sie selbstverständlich zurücksenden.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§ 8 Gewährleistung</h2>
      <p className="mb-4">
        Es gilt die gesetzliche Mängelhaftung. Transportschäden melden Sie uns bitte möglichst
        zeitnah per E-Mail mit Fotos der Sendung; dies erleichtert die Abwicklung, ist für Ihre
        gesetzlichen Rechte aber nicht Voraussetzung.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§ 9 Eigentumsvorbehalt</h2>
      <p className="mb-4">
        Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">§ 10 Schlussbestimmungen</h2>
      <p className="mb-4">
        Es gilt das Recht der Bundesrepublik Deutschland. Gegenüber Verbrauchern gilt diese
        Rechtswahl nur, soweit dadurch der Schutz zwingender Verbraucherschutzvorschriften des
        Staates des gewöhnlichen Aufenthalts nicht entzogen wird.
      </p>
      <p className="mb-4">
        Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </LegalPageLayout>
  )
}
