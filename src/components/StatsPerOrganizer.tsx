import React, { useState } from 'react';
import {
  DataTable,
  type DataTableRowToggleEvent,
  type DataTableStateEvent,
} from 'primereact/datatable';
import { Panel } from 'primereact/panel';
import { Column } from 'primereact/column';
import { formatPercentage } from '../shared/format-percentage';
import { StatisticsPerOrganizer, StatisticsPerSpecialty } from '../generated/graphql';
import { Select } from '@erkenningen/ui/components/select';
import StatsPerSpecialty from './StatsPerSpecialty';

const StatsPerOrganizer: React.FC<{
  dataPerOrganizer?: StatisticsPerOrganizer[];
}> = (props) => {
  let dt;
  const [organizerFilterValue, setOrganizerFilterValue] = useState<number | undefined>(undefined);
  const [expandedRows, setExpandedRows] = useState<StatisticsPerSpecialty[]>();
  const [page, setPage] = useState({ page: 0, rows: 10, first: 0 });
  if (!props.dataPerOrganizer) {
    return null;
  }
  let organizers: { value: number; label: string }[] = [];
  props.dataPerOrganizer?.map((d) => {
    const organizer: { label: string; value: number } = {
      value: d.OrganizerId,
      label: d.OrganizerName,
    };
    if (!organizers.find((v) => v.value === d.OrganizerId)) {
      organizers.push(organizer);
    }
    organizers = organizers.sort((a, b) => (a.label > b.label ? 1 : -1));
    return d;
  });

  const organizerFilter = (
    <Select
      value={organizerFilterValue}
      options={organizers}
      filter
      onChange={(e) => {
        dt.filter(e.value, 'OrganizerId', 'equals');
        setOrganizerFilterValue(e.value);
      }}
      optionLabel="label"
      optionValue="value"
      placeholder="[Alle aanbieders]"
      className="p-column-filter"
      panelStyle={{ width: '60vw' }}
      showClear
    />
  );

  const specialtyStats = (data) => {
    return <StatsPerSpecialty dataPerOrganizer={data}></StatsPerSpecialty>;
  };

  return (
    <div style={{ marginTop: '15px' }}>
      <Panel header="Statistieken per organisatie" toggleable collapsed={true}>
        <DataTable
          ref={(el) => (dt = el)}
          value={props.dataPerOrganizer}
          rowHover
          emptyMessage="Geen statistieken gevonden"
          paginator
          rows={page.rows}
          first={page.first}
          onPage={(e: DataTableStateEvent) => {
            setPage({ page: e.page || 0, rows: e.rows, first: e.first });
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          currentPageReportTemplate="{first} tot {last} van {totalRecords}"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          expandedRows={expandedRows}
          onRowToggle={(e: DataTableRowToggleEvent) => {
            setExpandedRows(e.data as any);
          }}
          rowExpansionTemplate={specialtyStats}
        >
          <Column expander style={{ width: '3em' }} />
          <Column
            field="OrganizerId"
            header={'Organisatie'}
            filter={true}
            filterElement={organizerFilter}
            body={(e) => e.OrganizerName}
          />
          <Column field="OrganizerType" header={'Type'} style={{ width: '140px' }} />
          <Column
            field="VisitingData.NrOfCourses"
            header={'# cursussen'}
            style={{ width: '90px' }}
          />
          <Column field="VisitingData.NrOfVisits" header={'# bezoeken'} style={{ width: '90px' }} />
          <Column
            field="VisitingData.VisitTargetActual"
            body={(row) => row && formatPercentage(row.VisitingData.VisitTargetActual)}
            header={'Doel'}
            style={{ width: '95px' }}
          />
        </DataTable>
      </Panel>
    </div>
  );
};

export default StatsPerOrganizer;
