import React, { useMemo } from 'react';

interface AmountProps {
  amount: number;
  decimals: number;
  ticker?: string;
  size?: number;
}

const Amount: React.FC<AmountProps> = ({ amount, decimals, size, ticker }) => {
  function splitDecimals(amt: number): [string, string] {
    const nonAtomicNumber = amt / Math.pow(10, decimals);
    const number = nonAtomicNumber.toString().split(".");
    const decimal = number.length < 2 ? "0" : number[1];
    return [number[0], decimal];
  }

  const [integerPart, decimalPart] = useMemo(
    () => splitDecimals(amount),
    [amount]
  );

  return (
    <div className="inline">
      <b style={{ fontSize: `${size || 1}rem` }}>{integerPart}</b>
      {decimalPart !== '0' && (
        <span
          style={{ fontSize: `${0.66 * (size || 1)}rem` }}
          className="opacity-80"
        >
          .{decimalPart}
        </span>
      )}
      {ticker && (
        <b className="pl-2 blue" style={{ fontSize: `${size || 1}rem` }}>
          {ticker}
        </b>
      )}
    </div>
  );
};

export default Amount;
