import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import { GoneView } from './GoneView';

const renderGoneView = () =>
  render(
    <IntlProvider locale="en">
      <MemoryRouter>
        <GoneView />
      </MemoryRouter>
    </IntlProvider>,
  );

describe('GoneView', () => {
  it('expands and collapses the archived version panel on click', () => {
    const { container } = renderGoneView();
    const trigger = screen.getByRole('button', {
      name: 'View archived version',
    });
    const panel = container.querySelectorAll('.content')[0];

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(panel).not.toHaveClass('active');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toHaveClass('active');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(panel).not.toHaveClass('active');
  });

  it('expands the search panel with the keyboard', () => {
    const { container } = renderGoneView();
    const trigger = screen.getByRole('button', {
      name: 'Looking for something specific?',
    });
    const panel = container.querySelectorAll('.content')[1];

    fireEvent.keyDown(trigger, { keyCode: 13 });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toHaveClass('active');

    fireEvent.keyDown(trigger, { keyCode: 32 });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(panel).not.toHaveClass('active');
  });
});
