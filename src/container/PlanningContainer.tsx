import React from 'react';
import PlanningTable from '../components/PlanningTable';

const PlanningContainer: React.FC<{
  yearMonth: number;
  showStatsForPeriod: boolean;
  shouldOnlyBePlanned: boolean;
  plannable: boolean;
}> = (props) => {
  return (
    <>
      <PlanningTable
        yearMonth={props.yearMonth}
        shouldOnlyBePlanned={props.shouldOnlyBePlanned}
        plannable={props.plannable}
        showStatsForPeriod={props.showStatsForPeriod}
      ></PlanningTable>
    </>
  );
};

export default PlanningContainer;
