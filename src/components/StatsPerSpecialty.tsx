import React, { useState } from 'react';
import { DataTable, type DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatPercentage } from '../shared/format-percentage';
import { StatisticsPerOrganizer } from '../generated/graphql';

const StatsPerSpecialty: React.FC<{
  dataPerOrganizer?: StatisticsPerOrganizer;
}> = (props) => {
  const [page, setPage] = useState({ page: 0, rows: 10, first: 0 });
  if (!props.dataPerOrganizer) {
    return null;
  }

  return (
    <div style={{ marginTop: '15px' }}>
      <DataTable
        header={`Statistieken per aanbod van organisatie: ${props.dataPerOrganizer.OrganizerName}`}
        value={props.dataPerOrganizer.SpecialtyStatistics}
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
      >
        <Column
          field="VakID"
          header={'Aanbod code'}
          body={(e) => e.VakID}
          style={{ width: '70px' }}
        />
        <Column field="Title" header={'Titel'} />
        <Column field="VisitingData.NrOfCourses" header={'# cursussen'} style={{ width: '90px' }} />
        <Column field="VisitingData.NrOfVisits" header={'# bezoeken'} style={{ width: '90px' }} />
        <Column
          field="VisitingData.VisitTargetActual"
          body={(row) => row && formatPercentage(row.VisitingData.VisitTargetActual)}
          header={'Doel'}
          style={{ width: '80px' }}
        />
      </DataTable>
    </div>
  );
};

export default StatsPerSpecialty;
