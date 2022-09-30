import React from 'react';
import { Dialog } from '@erkenningen/ui/components/dialog';
import { useGetSpecialtyQuery, VakDiscussie } from '../generated/graphql';
import { Panel } from '@erkenningen/ui/layout/panel';
import { PanelBody } from '@erkenningen/ui/layout/panel';
import { useGrowlContext } from '@erkenningen/ui/components/growl';
import { toDutchDate, toDutchMoney } from '@erkenningen/ui/utils';
import { Spinner } from '@erkenningen/ui/components/spinner';
import PrintButton from './PrintButton';

const SpecialtyDetails: React.FC<{ vakId: number | null; onHide: () => void }> = (props) => {
  const { showGrowl } = useGrowlContext();
  const { loading, data } = useGetSpecialtyQuery({
    variables: {
      vakId: props.vakId !== null ? props.vakId : 0,
    },
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    skip: props.vakId === null,
    onError() {
      showGrowl({
        severity: 'error',
        summary: 'Vakgegevens ophalen',
        sticky: true,
        detail: `Er is een fout opgetreden bij het ophalen de gegevens. Controleer uw invoer of neem contact met ons op.`,
      });
    },
  });

  const vakData = (v?: any) => {
    if (!v) {
      return null;
    }
    const organizer = v.IsExamenVak === true ? v.ExamenInstelling : v.Vakgroep;
    return (
      <>
        <Panel title={'Informatie over het aanbod'} doNotIncludeBody={true}>
          <table className="table table-striped" key="vak">
            <tbody>
              <tr>
                <td>
                  <strong>Aanbodcode</strong>
                </td>
                <td>{v.VakID}</td>
              </tr>
              <tr>
                <td>
                  <strong>Ingediend</strong>
                </td>
                <td>{toDutchDate(v.DatumAangemaakt)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Titel</strong>
                </td>
                <td>{v.Titel}</td>
              </tr>
              <tr>
                <td>
                  <strong>Doelgroep</strong>
                </td>
                <td>{v.Doelgroep}</td>
              </tr>
              <tr>
                <td>
                  <strong>Doelstelling</strong>
                </td>
                <td>
                  <div dangerouslySetInnerHTML={{ __html: v.Doelstelling }}></div>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Inhoud</strong>
                </td>
                <td>
                  <div dangerouslySetInnerHTML={{ __html: v.Inhoud }}></div>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Geïntegreerde aanpak</strong>
                </td>
                <td>
                  <div dangerouslySetInnerHTML={{ __html: v.Samenhang }}></div>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Actualiteit</strong>
                </td>
                <td>
                  <div dangerouslySetInnerHTML={{ __html: v.Vernieuwend }}></div>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Materiaal</strong>
                </td>
                <td>
                  <div dangerouslySetInnerHTML={{ __html: v.Samenvatting }}></div>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Docenten</strong>
                </td>
                <td>
                  <div dangerouslySetInnerHTML={{ __html: v.Docenten }}></div>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Promotietekst</strong>
                </td>
                <td>{v.Promotietekst}</td>
              </tr>
              <tr>
                <td>
                  <strong>Website</strong>
                </td>
                <td>
                  {v.Website && (
                    <a
                      href={`https://${v.Website.replace('http://', '').replace('https://', '')}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {v.Website}
                    </a>
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Thema/Competentie</strong>
                </td>
                <td>
                  {v.Themas[0].Naam} / {v.Competenties[0].Naam}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Max. deelnemers</strong>
                </td>
                <td>{v.MaximumCursisten} pers.</td>
              </tr>
              <tr>
                <td>
                  <strong>Kosten</strong>
                </td>
                <td>{toDutchMoney(v.Kosten, { euroPrefix: true })}</td>
              </tr>
              <tr>
                <td>
                  <strong>Tijdsduur</strong>
                </td>
                <td>{v.Tijdsduur} uur</td>
              </tr>
              <tr>
                <td>
                  <strong>Praktijk</strong>
                </td>
                <td>
                  <div dangerouslySetInnerHTML={{ __html: v.Praktijk }}></div>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Werkvorm</strong>
                </td>
                <td>
                  <div dangerouslySetInnerHTML={{ __html: v.Werkvorm }}></div>
                </td>
              </tr>
              {v.Schema && (
                <tr>
                  <td colSpan={2} style={{ padding: 0 }}>
                    <h4 style={{ margin: '8px' }}>Schema:</h4>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Tijd</th>
                          <th>Docent</th>
                          <th>Omschrijving</th>
                        </tr>
                      </thead>
                      <tbody>
                        {v.Schema.map((r, i) => (
                          <tr key={i}>
                            <td>{r.tijd}</td>
                            <td>{r.docent}</td>
                            <td>{r.omschrijving}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr>
                <td>
                  <strong>Evaluatiewijze</strong>
                </td>
                <td>
                  <div dangerouslySetInnerHTML={{ __html: v.EvaluatieWijze }}></div>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Vaardigheden</strong>
                </td>
                <td>
                  <ul>
                    {v.VakVaardigheden.map((v) => (
                      <li key={v.Omschrijving}>{v.Omschrijving}</li>
                    ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Sectoren</strong>
                </td>
                <td>
                  <ul>
                    {v.VakKennisgebieden.map((v) => (
                      <li key={v.Naam}>{v.Naam}</li>
                    ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Beoordelaar</strong>
                </td>
                <td colSpan={5}>
                  {(v.Beoordelingen.length > 0 && v.Beoordelingen[0].Beoordelaar?.FullName) ||
                    'Nog niet bekend'}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Rapport beoordelaar</strong>
                </td>
                <td>
                  {(v.Beoordelingen.length > 0 && v.Beoordelingen[0].Rapport) || 'Nog niet bekend'}
                </td>
              </tr>
            </tbody>
          </table>
        </Panel>
        <br />
        <Panel title={'Aanbieder gegevens'} doNotIncludeBody={true}>
          <table className="table table-striped">
            <tbody>
              <tr>
                <td>
                  <strong>Aanbieder</strong>
                </td>
                <td>{organizer.Naam}</td>
              </tr>
              <tr>
                <td>
                  <strong>Adres aanbieder</strong>
                </td>
                <td>
                  {organizer.Contactgegevens.DisplayAddress}{' '}
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={`https://www.google.com/maps/search/?api=1&query=${organizer.Contactgegevens.DisplayAddress}`}
                  >
                    Open in Google Maps
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Contactpersoon</strong>
                </td>
                <td>{organizer.Contactgegevens.TerAttentieVan}</td>
              </tr>
              <tr>
                <td>
                  <strong>Telefoon</strong>
                </td>
                <td>{organizer.Contactgegevens.Telefoon}</td>
              </tr>
              <tr>
                <td>
                  <strong>Email</strong>
                </td>
                <td>
                  {organizer.Contactgegevens.Email && (
                    <a
                      href={`mailto:${organizer.Contactgegevens.Email}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {organizer.Contactgegevens.Email}
                    </a>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </Panel>
      </>
    );
  };

  const footer = (element: string) => {
    return <PrintButton element={element}></PrintButton>;
  };

  const titleDiscussion = (d: VakDiscussie) => {
    if (!d) {
      return null;
    }
    return (
      <div key={d.title}>
        <h5 className="col-md-12">
          <strong>{d?.title}</strong>
        </h5>
        <table className="table table-striped">
          <tbody>
            {d &&
              d.comments
                ?.slice()
                .sort((a, b) => (a?.dateOfComment > b?.dateOfComment ? 1 : -1))
                .map((c) => (
                  <tr className="row" key={c.dateOfComment}>
                    <td className="col-md-8">{c.comment}</td>
                    <td className="col-md-4">
                      {toDutchDate(new Date(c.dateOfComment), { includeTime: true })}
                      <br />
                      <strong>{c.author}</strong> (<i>{c.source}</i>)
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    );
  };
  return (
    <Dialog
      key="dialog"
      id="dialog"
      appendTo={'self'}
      maximizable
      closeOnEscape={true}
      header={`Details van aanbod ${props.vakId}`}
      visible={props.vakId !== null}
      modal={true}
      style={{ width: '80vw' }}
      blockScroll={true}
      contentStyle={{ maxHeight: '90vw', overflow: 'auto' }}
      onHide={() => props.onHide()}
      footer={footer('printAreaSpecialtyDetails')}
    >
      {loading && <Spinner>Vak details worden geladen...</Spinner>}
      {!loading && (
        <div id="printAreaSpecialtyDetails">
          {vakData(data?.Specialty)}

          <Panel title={'Gevoerde discussie'} doNotIncludeBody={true}>
            <div className="list-group">
              <div className="list-item">
                {data?.Specialty?.VakDiscussie === null && <PanelBody>Geen gegevens</PanelBody>}
                {data?.Specialty?.VakDiscussie?.map((d) => titleDiscussion(d))}
              </div>
            </div>
          </Panel>
        </div>
      )}
    </Dialog>
  );
};

export default SpecialtyDetails;
