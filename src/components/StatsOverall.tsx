import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Panel } from 'primereact/panel';
import { Column } from 'primereact/column';
import { formatPercentage } from '../shared/format-percentage';
import { VisitingData } from '../generated/graphql';

const StatsOverall: React.FC<{
  data?: VisitingData;
}> = (props) => {
  if (!props.data) {
    return <div>Geen</div>;
  }
  return (
    <div style={{ marginTop: '15px' }}>
      <Panel header="Statistieken overall" toggleable collapsed={true}>
        <DataTable value={[props.data]} rowHover emptyMessage="Geen statistieken gevonden">
          <Column field="AverageRate" header={'Gem. rapport cijfer'} />
          <Column
            field="AverageScoreAccordingIntention"
            header={'Gem. volgens intentie'}
            body={(row) => row && formatPercentage(row.AverageScoreAccordingIntention, 0, 0, true)}
          />
          <Column field="NrOfCourses" header={'# cursussen'} />
          <Column field="NrOfVisits" header={'# bezoeken'} />
          <Column
            field="VisitTargetActual"
            body={(row) => row && formatPercentage(row.VisitTargetActual)}
            header={'Doel'}
          />
        </DataTable>
      </Panel>
    </div>
  );
};

export default StatsOverall;
