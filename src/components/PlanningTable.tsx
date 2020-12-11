import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Tooltip } from 'primereact/tooltip';
import { Panel } from 'primereact/panel';
import { Column } from 'primereact/column';
import { useGrowlContext } from '@erkenningen/ui/components/growl';
import {
  useGetInspectionPlanningQuery,
  useGetInspectorsQuery,
  useUpdatePlanningMutation,
} from '../generated/graphql';
import { Button } from '@erkenningen/ui/components/button';
import format from 'date-fns/format';
import { nl } from 'date-fns/locale';
import { Select } from '@erkenningen/ui/components/select';
import './PlanningTable.css';
import { addDays } from 'date-fns';
import { formatPercentage } from '../shared/format-percentage';
import { Checkbox } from '@erkenningen/ui/components/checkbox';
import StatsOverall from './StatsOverall';
import StatsPerOrganizer from './StatsPerOrganizer';
import { Spinner } from '@erkenningen/ui/components/spinner';
import SpecialtyDetails from './SpecialtyDetails';
import SessieDetails from './SessieDetails';
import { hasRole, Roles, useAuth } from '../shared/Auth';

const PlanningTable: React.FC<{
  yearMonth: number;
  showStatsForPeriod: boolean;
  shouldOnlyBePlanned: boolean;
  plannable: boolean;
}> = (props) => {
  const { my } = useAuth();
  const personId = my?.Persoon?.PersoonID;

  let dt;
  const [vakFilterValue, setVakFilterValue] = useState<number | undefined>(undefined);
  const [organizerFilterValue, setOrganizerFilterValue] = useState<string | undefined>(undefined);
  const [vakIdDetails, setVakIdDetails] = useState<number | null>(null);
  const [sessieIdDetails, setSessieIdDetails] = useState<number | null>(null);
  let isRector = hasRole(Roles.Rector, my?.Roles);
  let isInspector = hasRole(Roles.Inspecteur, my?.Roles);
  const [viewOptions, setViewOptions] = useState<{
    showOnlyVisited: boolean;
    showPlannedVisitsOfInspector: boolean;
    showPlanningOfAllInspectors: boolean;
  }>({
    showOnlyVisited: false,
    showPlannedVisitsOfInspector: false,
    showPlanningOfAllInspectors: isRector ? true : false,
  });

  const [page, setPage] = useState({ page: 0, rows: 25, first: 0 });
  const { showGrowl } = useGrowlContext();

  const { loading, data, refetch } = useGetInspectionPlanningQuery({
    variables: {
      input: {
        startDate: props.yearMonth,
        showStatsForPeriod: props.showStatsForPeriod,
        shouldOnlyBePlanned: props.shouldOnlyBePlanned,
        plannable: props.plannable,
        isInspector: false,
        isRector: true,
        targetSettings: {
          specialtyTarget: 0.1,
          specialtyMargin: 0.05,
          organizerTarget: 0.1,
          organizerMargin: 0.05,
          overallTarget: 0.1,
          overallMargin: 0.05,
        },
      },
    },
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onError() {
      showGrowl({
        severity: 'error',
        summary: 'Planning ophalen',
        sticky: true,
        detail: `Er is een fout opgetreden bij het ophalen van planning. Controleer uw invoer of neem contact met ons op.`,
      });
    },
  });

  const { data: inspectors } = useGetInspectorsQuery({
    variables: undefined,
    errorPolicy: 'all',

    onError() {
      showGrowl({
        severity: 'error',
        summary: 'Inspecteurs ophalen',
        sticky: true,
        detail: `Er is een fout opgetreden bij het ophalen van de inspecteurs. Controleer uw invoer of neem contact met ons op.`,
      });
    },
  });

  const [updatePlanning] = useUpdatePlanningMutation({
    onError(error) {
      showGrowl({
        severity: 'error',
        summary: 'Planning bijwerken mislukt',
        sticky: true,
        detail: `${error.message}`,
      });
    },
    refetchQueries: ['getInspectionPlanning'],
  });

  if (loading) {
    return <Spinner></Spinner>;
  }

  let vakken: { value: number; label: string }[] = [];
  let organizers: { value: number; label: string }[] = [];
  data?.getInspectionPlanning?.PlanningData.map((d) => {
    const specialty: { label: string; value: number } = {
      value: d.SessieData.VakID,
      label: `${d.SessieData.VakID} - ${d.SessieData.Titel}`,
    };
    if (!vakken.find((v) => v.value === d.SessieData.VakID)) {
      vakken.push(specialty);
    }
    const organizer: { label: string; value: number } = {
      value: d.SessieData.InstellingID,
      label: d.SessieData.InstellingNaam,
    };
    if (!organizers.find((v) => v.value === d.SessieData.InstellingID)) {
      organizers.push(organizer);
    }
    organizers = organizers.sort((a, b) => (a.label > b.label ? 1 : -1));
    return d;
  });

  const vakFilter = (
    <Select
      value={vakFilterValue}
      options={vakken}
      filter
      onChange={(e) => {
        dt.filter(e.value, 'SessieData.VakID', 'equals');
        setVakFilterValue(e.value);
      }}
      optionLabel="label"
      optionValue="value"
      placeholder="[Alle aanboden]"
      className="p-column-filter"
      panelStyle={{ width: '80vw' }}
      showClear
    />
  );
  const organizerFilter = (
    <Select
      value={organizerFilterValue}
      options={organizers}
      filter
      onChange={(e) => {
        dt.filter(e.value, 'SessieData.InstellingID', 'equals');
        setOrganizerFilterValue(e.value);
      }}
      optionLabel="label"
      optionValue="value"
      placeholder="[Alle aanboden]"
      className="p-column-filter"
      panelStyle={{ width: '60vw' }}
      showClear
    />
  );

  const updatePlanningItem = async (sessionId: number, inspectorId: number, visitDate: Date) => {
    const updatePlanningResult = await updatePlanning({
      variables: {
        sessieId: sessionId,
        inspectorId: inspectorId,
        visitDate: visitDate,
      },
    });
    if (updatePlanningResult) {
      showGrowl({
        severity: 'success',
        summary: 'Planning bijwerken',
        sticky: false,
        detail: `Planning is bijgewerkt: bezoek is ${
          updatePlanningResult.data?.updatePlanning.planned === true ? 'gepland' : 'verwijderd'
        }`,
      });
    }
  };

  const showPlanButton = (row, inspectorId: number, inspectorName: string) => {
    // is current user a rector and is there no visitation already, then is it is plannable
    const inPlanButton = (
      <>
        <Button
          icon="far fa-calendar-plus"
          tooltip={`Inplannen bij ${inspectorName}`}
          buttonType="button"
          onClick={() =>
            updatePlanningItem(row.SessieData.SessieID, inspectorId, row.SessieData.BeginDatum)
          }
        ></Button>
        <span className="ml-3 hidden-sm hidden-md hidden-lg">{inspectorName}</span>
      </>
    );

    if (isRector && row.SessieData.VisitatieID === null) {
      return inPlanButton;
    }

    // is current user the inspector
    if (
      isInspector &&
      personId === inspectorId &&
      row.SessieData.VisitatieID === null &&
      new Date(row.SessieData.BeginDatum) >= addDays(new Date(), -2) &&
      row.ShouldBeVisited
    ) {
      return inPlanButton;
    }
  };

  const showUndoPlanningButton = (row, inspectorId: number, inspectorName: string) => {
    const unPlanButton = (
      <Button
        icon="far fa-calendar-minus"
        className="p-button-danger"
        tooltip={`Planning ongedaan maken voor ${inspectorName}`}
        onClick={() =>
          updatePlanningItem(row.SessieData.SessieID, inspectorId, row.SessieData.BeginDatum)
        }
      ></Button>
    );
    if (
      isRector &&
      // Rector can always un plan (if there is a visitation already)
      row.SessieData.Visitatie !== null &&
      row.SessieData.PersoonID === inspectorId
    ) {
      return unPlanButton;
    }

    if (
      isInspector &&
      personId === inspectorId &&
      // Inspector can only plan in the future
      row.SessieData.VisitatieID !== null &&
      row.SessieData.PersoonID === inspectorId &&
      new Date(row.SessieData.BeginDatum) >= addDays(new Date(), -2)
    ) {
      return unPlanButton;
    }
  };

  const showReportButton = (row, inspectorId: number, inspectorName: string) => {
    if (!(row.SessieData.VisitatieID !== null && row.SessieData.PersoonID === inspectorId)) {
      return null;
    }
    return (
      <>
        <Button
          icon="fas fa-file"
          tooltip={`${
            row.RapportDatum !== null
              ? `Bekijk verslag, opgesteld door ${inspectorName}`
              : `Klik om verslag te maken (ingepland aan ${inspectorName}`
          }`}
          buttonType="button"
          type="info"
          onClick={(e) =>
            window.open(
              `/Default.aspx?tabid=127&SessieID=${row.SessieData.SessieID}&Mode=Wijzigen`,
              '_blank',
            )
          }
        ></Button>
      </>
    );
  };

  const showVakDetails = (vakId: number) => {
    setVakIdDetails(vakId);
    return;
  };

  const showSessieDetails = (sessieId: number) => {
    setSessieIdDetails(sessieId);
    return;
  };

  const planningData = data?.getInspectionPlanning?.PlanningData.slice().sort((a, b) => {
    return a?.SessieData?.BeginDatum > b?.SessieData?.BeginDatum ? 1 : -1;
  });
  let filteredData = planningData?.filter(
    (d) =>
      (d.SessieData.VisitatieID !== null && viewOptions.showOnlyVisited === true) ||
      !viewOptions.showOnlyVisited,
  );
  if (viewOptions.showPlannedVisitsOfInspector && isInspector) {
    filteredData = filteredData?.filter(
      (d) => d.SessieData.VisitatieID !== null && d.SessieData.PersoonID === personId,
    );
  }

  return (
    <>
      <Panel header="Planning bekijken en bezoek plannen" toggleable collapsed={false}>
        <div className="form form-horizontal">
          <div className="form-group col-md-4">
            {hasRole(Roles.Inspecteur, my?.Roles) && (
              <div className="">
                <Checkbox
                  label="Toon alle inspecteurs"
                  checked={viewOptions.showPlanningOfAllInspectors || false}
                  onChange={(e) => {
                    setViewOptions({ ...viewOptions, showPlanningOfAllInspectors: e.checked });
                  }}
                ></Checkbox>
              </div>
            )}
          </div>
          <div className="form-group col-md-4">
            <Checkbox
              label="Toon alleen bezocht of ingepland"
              checked={viewOptions.showOnlyVisited}
              onChange={(e) => {
                setViewOptions({
                  ...viewOptions,
                  showOnlyVisited: e.checked,
                  showPlanningOfAllInspectors: true,
                });
              }}
            ></Checkbox>
          </div>
          {hasRole(Roles.Inspecteur, my?.Roles) && (
            <div className="form-group col-md-3">
              <Checkbox
                label="Toon mijn planning"
                checked={viewOptions.showPlannedVisitsOfInspector}
                onChange={(e) => {
                  setViewOptions({ ...viewOptions, showPlannedVisitsOfInspector: e.checked });
                }}
              ></Checkbox>
            </div>
          )}

          <Button
            type="primary"
            buttonType="button"
            style={{ marginBottom: '5px' }}
            label="Verversen"
            icon="pi pi-refresh"
            onClick={() => refetch()}
          ></Button>
        </div>
        <div className="row datatable-responsive-demo">
          <DataTable
            className="p-datatable-responsive-demo"
            ref={(el) => (dt = el)}
            value={filteredData}
            rowHover
            dataKey={'SessieData.SessieID'}
            emptyMessage="Geen gegevens gevonden."
            paginator
            rows={page.rows}
            first={page.first}
            onPage={(e: { first: number; rows: number; page: number; pageCount: number }) => {
              setPage({ page: e.page, rows: e.rows, first: e.first });
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            currentPageReportTemplate="{first} tot {last} van {totalRecords}"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          >
            <Column
              header="Titel"
              field="SessieData.VakID"
              sortable={true}
              body={(row) => (
                <>
                  <Button
                    buttonType="button"
                    style={{ marginRight: '5px', marginBottom: '5px' }}
                    label=""
                    icon="fas fa-file-alt"
                    tooltip="Bekijk aanbod details"
                    onClick={() => showVakDetails(row.SessieData.VakID)}
                  ></Button>
                  <strong>{row.SessieData.VakID}</strong>

                  <div>
                    <small>{row.SessieData.Titel}</small>
                  </div>
                  <div>
                    <strong>
                      <i>{row.SessieData.VakType === 'Examen' ? 'Examen' : ''}</i>
                    </strong>
                  </div>
                  {row.NrOfDaysSinceLastVisit && (
                    <small>
                      <i>({row.NrOfDaysSinceLastVisit} dagen geleden bezocht)</i>
                    </small>
                  )}
                </>
              )}
              filter={true}
              filterElement={vakFilter}
            />
            <Column
              field="SessieData.InstellingID"
              body={(row) => <>{row.SessieData.InstellingNaam}</>}
              header={'Organisatie'}
              sortable={true}
              filter={true}
              filterElement={organizerFilter}
            />
            <Column field="SessieData.Woonplaats" header={'Plaats'} sortable={true} />
            <Column
              field="ShouldBeVisited"
              body={(row) => (row.ShouldBeVisited ? 'Ja' : 'Nee')}
              header={'Vis-it-eren'}
              sortable={true}
              style={{ width: '50px' }}
            />
            <Column
              field="OrganizerTargetActual"
              body={(row) => formatPercentage(row.OrganizerTargetActual)}
              header={'Org. doel'}
              sortable={true}
              style={{ width: '50px', padding: '2px' }}
            />
            <Column
              field="SpecialtyTargetActual"
              body={(row) => formatPercentage(row.SpecialtyTargetActual)}
              header={'Aanb. doel'}
              sortable={true}
              style={{ width: '50px', padding: '2px' }}
            />
            <Column
              field="SessieData.BeginDatumTijd"
              body={(row) => (
                <>
                  <strong>
                    {format(new Date(row.SessieData.BeginDatumTijd), 'EEEEEE d', { locale: nl })}
                  </strong>{' '}
                  {format(new Date(row.SessieData.BeginDatumTijd), 'HH:mm', { locale: nl })}
                  <div>
                    <Button
                      onClick={() => showSessieDetails(row.SessieData.SessieID)}
                      icon="far fa-file-alt"
                      tooltip="Bekijk sessie details"
                    ></Button>
                  </div>
                </>
              )}
              header={'Datum'}
              sortable={true}
              style={{ width: '80px' }}
            />
            {inspectors?.getInspectors
              ?.filter((i) => {
                if (!viewOptions.showPlanningOfAllInspectors) {
                  return i.id === personId;
                }
                return true;
              })
              .map((i) => {
                return (
                  <Column
                    key={i.id}
                    field=""
                    body={(row) => (
                      <>
                        {showReportButton(row, i.id, i.name)}
                        {showPlanButton(row, i.id, i.name)}
                        {showUndoPlanningButton(row, i.id, i.name)}
                      </>
                    )}
                    header={
                      <>
                        <Tooltip target=".inspectorName"></Tooltip>
                        <div data-pr-tooltip={i.name} className="inspectorName">
                          {i.name}
                        </div>
                      </>
                    }
                    filter
                    filterElement={
                      <div>
                        {planningData?.filter((p) => p.SessieData.PersoonID === i.id).length}
                      </div>
                    }
                    headerClassName="transformText"
                    bodyStyle={{ padding: 0 }}
                  />
                );
              })}
          </DataTable>
        </div>
      </Panel>
      <StatsOverall data={data?.getInspectionPlanning?.InspectionStatisticsOverall}></StatsOverall>
      <StatsPerOrganizer
        dataPerOrganizer={data?.getInspectionPlanning?.StatisticsPerOrganizer}
      ></StatsPerOrganizer>
      <SpecialtyDetails
        vakId={vakIdDetails}
        onHide={() => setVakIdDetails(null)}
      ></SpecialtyDetails>
      <SessieDetails
        sessieId={sessieIdDetails}
        onHide={() => setSessieIdDetails(null)}
      ></SessieDetails>
    </>
  );
};

export default PlanningTable;
