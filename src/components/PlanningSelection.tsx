import React, { useState } from 'react';
import { add, format, startOfMonth } from 'date-fns';
import { Select } from '@erkenningen/ui/components/select';
import { Panel, PanelBody } from '@erkenningen/ui/layout/panel';
import { nl } from 'date-fns/locale';
import { Checkbox } from '@erkenningen/ui/components/checkbox';

import './PlanningSelection.css?url';
import PlanningContainer from '../container/PlanningContainer';

const PlanningSelection: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<{
    startDate: number;
    label: string;
  }>({
    startDate: startOfMonth(new Date()).getTime(),
    label: format(startOfMonth(new Date()), 'yyyy-MM MMM', { locale: nl }),
  });
  const [onlyPlannable, setOnlyPlannable] = useState<boolean>(true);
  const [showOnlyShouldBePlanned, setShowOnlyShouldBePlanned] = useState<boolean>(true);
  const [showStatsForPeriod, setShowStatsForPeriod] = useState<boolean>(false);

  const yearMonths: { startDate: number; label: string }[] = [];
  for (let i = -9; i < 4; i++) {
    const periodStartDate = startOfMonth(add(new Date(), { months: i }));
    const yearMonth = {
      startDate: periodStartDate.getTime(),
      label: format(periodStartDate, 'yyyy-MM MMM', { locale: nl }),
    };
    yearMonths.push(yearMonth);
  }
  const handleYearMonthsChange = (e: any) => {
    const selectedYearMonth = yearMonths.find((ym) => ym.startDate === e.value) || yearMonths[0];
    if (selectedYearMonth) {
      setCurrentDate(selectedYearMonth);
    }
  };

  const handleOnlyPlannableChange = (e: any) => {
    setOnlyPlannable(e.checked);
  };
  const handleShowOnlyShouldBePlannedChange = (e: any) => {
    setShowOnlyShouldBePlanned(e.checked);
  };
  const handleShowStatsForPeriodChange = (e: any) => {
    setShowStatsForPeriod(e.checked);
  };
  return (
    <Panel title="Inspectie plannen" doNotIncludeBody={true}>
      <PanelBody>
        <div className="form form-horizontal">
          <div className="form-group col-md-3">
            <label htmlFor="YearMonths" className="control-label col-md-3">
              Periode
            </label>
            <Select
              id="YearMonths"
              className="ml-3"
              name="yearMonths"
              style={{ width: 'auto' }}
              options={yearMonths.map((c) => ({
                value: c.startDate,
                label: c.label,
              }))}
              optionLabel="label"
              value={currentDate.startDate}
              onChange={handleYearMonthsChange}
            ></Select>
          </div>
          <div className="form-group col-md-3">
            <Checkbox
              style={{ marginTop: 0 }}
              checked={onlyPlannable}
              onChange={handleOnlyPlannableChange}
              label="Alleen planbaar"
            ></Checkbox>
          </div>
          <div className="form-group col-md-3">
            <Checkbox
              style={{ marginTop: 0 }}
              checked={showOnlyShouldBePlanned}
              onChange={handleShowOnlyShouldBePlannedChange}
              label="Bezoek nodig"
            ></Checkbox>
          </div>
          <div className="form-group col-md-3">
            <Checkbox
              style={{ marginTop: 0 }}
              checked={showStatsForPeriod}
              onChange={handleShowStatsForPeriodChange}
              label="Periode statistieken"
            ></Checkbox>
          </div>
        </div>
      </PanelBody>
      <div className="row">
        <div className="col-md-12">
          <PlanningContainer
            yearMonth={currentDate.startDate}
            plannable={onlyPlannable}
            shouldOnlyBePlanned={showOnlyShouldBePlanned}
            showStatsForPeriod={showStatsForPeriod}
          ></PlanningContainer>
        </div>
      </div>
    </Panel>
  );
};

export default PlanningSelection;
