import React from 'react';
import { Dialog } from '@erkenningen/ui/components/dialog';
import { useGetSessieDetailsQuery } from '../generated/graphql';
import { Panel } from '@erkenningen/ui/layout/panel';
import { useGrowlContext } from '@erkenningen/ui/components/growl';
import { Spinner } from '@erkenningen/ui/components/spinner';
import PrintButton from './PrintButton';
import format from 'date-fns/format';
import nl from 'date-fns/locale/nl';

const SessieDetails: React.FC<{ sessieId: number | null; onHide: () => void }> = (props) => {
  const { showGrowl } = useGrowlContext();
  const { loading, data } = useGetSessieDetailsQuery({
    variables: {
      sessieId: props.sessieId !== null ? props.sessieId : 0,
    },
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    skip: props.sessieId === null,
    onError() {
      showGrowl({
        severity: 'error',
        summary: 'Cursus gegevens ophalen',
        sticky: true,
        detail: `Er is een fout opgetreden bij het ophalen van de gegevens. Controleer uw invoer of neem contact met ons op.`,
      });
    },
  });

  const sessieDetails = (s) => {
    if (!s) {
      return null;
    }
    const organizer =
      s.Cursus.Vak.IsExamenVak === true ? s.Cursus.Vak.ExamenInstelling : s.Cursus.Vak.Vakgroep;
    return (
      <>
        <Panel title={'Details over de cursus'} doNotIncludeBody={true}>
          <table className="table table-striped" key="vak">
            <tbody>
              <tr>
                <td>
                  <strong>Type</strong>
                </td>
                <td>{s.SessieType || 'Bijeenkomst'}</td>
              </tr>
              <tr>
                <td>
                  <strong>Locatie</strong>
                </td>
                <td>{s.Lokatie.Naam}</td>
              </tr>
              <tr>
                <td>
                  <strong>Adres</strong>
                </td>
                <td>
                  {s.Lokatie.Contactgegevens.DisplayAddress}
                  {s.Lokatie.Contactgegevens.DisplayAddress !== 'Onbekend' && (
                    <>
                      {' '}
                      <a
                        rel="noopener noreferrer"
                        target="_blank"
                        href={`https://www.google.com/maps/search/?api=1&query=${s.Lokatie.Contactgegevens.DisplayAddress}`}
                      >
                        Open in Google Maps
                      </a>
                    </>
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Datum en tijd</strong>
                </td>
                <td>
                  {format(new Date(s.DatumBegintijd), 'cccc dd-MM-yyyy', { locale: nl })} (
                  {format(new Date(s.DatumBegintijd), 'HH:mm')} -{' '}
                  {format(new Date(s.DatumEindtijd), 'HH:mm')})
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Aanbodcode</strong>
                </td>
                <td>
                  {s.Cursus.VakID}, <strong>Erkenningsnummer:</strong> {s.Cursus.CursusCode}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Titel</strong>
                </td>
                <td>{s.Cursus.Titel}</td>
              </tr>
              <tr>
                <td>
                  <strong>Promotietekst</strong>
                </td>
                <td>{s.Cursus.Promotietekst}</td>
              </tr>
              <tr>
                <td>
                  <strong>Thema</strong>
                </td>
                <td>{s.Cursus.Vak.Themas[0].Naam}</td>
              </tr>
              <tr>
                <td>
                  <strong>Competentie</strong>
                </td>
                <td>{s.Cursus.Vak.Competenties[0].Naam}</td>
              </tr>
              <tr>
                <td>
                  <strong>Beoordelaar</strong>
                </td>
                <td>{s.Cursus.Vak.Beoordelingen.map((b) => b.Beoordelaar.FullName).join(', ')}</td>
              </tr>
            </tbody>
          </table>
        </Panel>

        <Panel title="Aanbieder details" doNotIncludeBody={true}>
          <table className="table table-striped" key="organizer">
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

  return (
    <Dialog
      key="dialog"
      id="dialog"
      closeOnEscape={true}
      header={`Details over cursus`}
      visible={props.sessieId !== null}
      modal={true}
      maximizable
      style={{ width: '80vw' }}
      // maximized={width < 400}
      blockScroll={true}
      contentStyle={{ maxHeight: '90vw', overflow: 'auto' }}
      onHide={() => props.onHide()}
      footer={footer('printAreaSessionDetails')}
    >
      {loading && <Spinner>Cursus details worden geladen...</Spinner>}
      {!loading && <div id="printAreaSessionDetails">{sessieDetails(data?.Sessie)}</div>}
    </Dialog>
  );
};

export default SessieDetails;
