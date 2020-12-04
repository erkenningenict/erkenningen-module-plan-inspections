import React from 'react';

export const formatPercentage = (
  value: number,
  target: number = 0.1,
  margin: number = 0.05,
  onlyPercentage: boolean = false,
) => {
  let className = 'bg-danger';
  // below val
  if (value < target - margin) {
    className = 'bg-danger';
  }

  // on val
  if (value >= target - margin && value <= target + margin) {
    className = 'bg-success';
  }

  // above val
  if (value > target + margin) {
    className = 'bg-warning';
  }
  return (
    <>
      <div className={`text-right ${!onlyPercentage ? className : ''}`}>
        {Number(value).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}
      </div>
    </>
  );
};
