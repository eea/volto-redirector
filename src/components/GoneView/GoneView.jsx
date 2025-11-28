/**
 * Gone view component for HTTP 410 responses.
 * @module components/GoneView
 */

import React, { useEffect, useState } from 'react';
import { compose } from 'redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { withServerErrorCode } from '@plone/volto/helpers/Utils/Utils';
import { BodyClass } from '@plone/volto/helpers';
import './GoneView.css';

/**
 * Gone view function.
 * Displays a helpful 410 page for permanently deleted content.
 * @function GoneView
 * @returns {JSX.Element} Markup of the gone page.
 */
const GoneView = () => {
  const [archiveUrl, setArchiveUrl] = useState('');

  useEffect(() => {
    setArchiveUrl(`https://web.archive.org/*/${window.location.href}`);
  }, []);

  return (
    <Container className="view-wrapper">
      <BodyClass className="page-gone" />
      <h1>
        <FormattedMessage
          id="This Page No Longer Exists"
          defaultMessage="This Page No Longer Exists"
        />
      </h1>
      <p className="description">
        <FormattedMessage
          id="This content has been permanently removed and is no longer available."
          defaultMessage="This content has been permanently removed and is no longer available."
        />
      </p>
      <h2>
        <FormattedMessage
          id="What you can do?"
          defaultMessage="What you can do?"
        />
      </h2>

      <div className="gone-options">
        <div className="gone-option">
          <h3>
            <FormattedMessage
              id="View archived version"
              defaultMessage="View archived version"
            />
          </h3>
          <p>
            <FormattedMessage
              id="You may be able to find an archived copy of this page on the {archive_url}"
              defaultMessage="You may be able to find an archived copy of this page on the {archive_url}"
              values={{
                archive_url: (
                  <a
                    href={archiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage
                      id="Wayback Machine"
                      defaultMessage="Wayback Machine"
                    />
                  </a>
                ),
              }}
            />
          </p>
        </div>

        <div className="gone-option">
          <h3>
            <FormattedMessage
              id="Looking for something specific?"
              defaultMessage="Looking for something specific?"
            />
          </h3>
          <p>
            <FormattedMessage
              id="Try our {search} or visit our {homepage} to find what you need."
              defaultMessage="Try our {search} or visit our {homepage} to find what you need."
              values={{
                search: (
                  <Link to="/search">
                    <FormattedMessage id="search" defaultMessage="search" />
                  </Link>
                ),
                homepage: (
                  <Link to="/">
                    <FormattedMessage
                      id="homepage"
                      defaultMessage="homepage"
                    />
                  </Link>
                ),
              }}
            />
          </p>
        </div>

        <div className="gone-option">
          <h3>
            <FormattedMessage
              id="Need help?"
              defaultMessage="Need help?"
            />
          </h3>
          <p>
            <FormattedMessage
              id="If you believe this page should not have been removed, please contact the {site_admin}."
              defaultMessage="If you believe this page should not have been removed, please contact the {site_admin}."
              values={{
                site_admin: (
                  <Link to="/contact-form">
                    <FormattedMessage
                      id="Site Administration"
                      defaultMessage="Site Administration"
                    />
                  </Link>
                ),
              }}
            />
          </p>
        </div>
      </div>
    </Container>
  );
};

export default compose(withServerErrorCode(410), injectIntl)(GoneView);
