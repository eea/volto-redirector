import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import StatisticsBox from './StatisticsBox';

describe('StatisticsBox', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders the label, icon, and animates to the final value', () => {
    render(
      <StatisticsBox
        label="Gone"
        value={1200}
        color="blue"
        icon="Icon"
        loading={false}
        reset={false}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Gone')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
  });

  it('shows a loading count until a real value arrives', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const { rerender } = render(
      <StatisticsBox label="Total" value={null} loading reset={false} />,
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByText('1,000')).toBeInTheDocument();

    rerender(
      <StatisticsBox label="Total" value={25} loading={false} reset={false} />,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('resets the display when reset changes', () => {
    const { rerender } = render(
      <StatisticsBox label="Total" value={10} loading={false} reset={false} />,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('10')).toBeInTheDocument();

    rerender(<StatisticsBox label="Total" value={5} loading={false} reset />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
