/**
 * Redirects controlpanel component.
 * @module components/Controlpanels/Redirects
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Link } from 'react-router-dom';
import { getBaseUrl, getParentUrl, Helmet } from '@plone/volto/helpers';
import {
  removeRedirects,
  addRedirects,
  getRedirects,
  getRedirectsStatistics,
} from '../../actions/redirects';
import { Portal } from 'react-portal';
import {
  Container,
  Button,
  Segment,
  Form,
  Checkbox,
  Header,
  Input,
  Message,
  Table,
  Loader,
  Dimmer,
  Statistic,
  Dropdown,
} from 'semantic-ui-react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import {
  Icon,
  Toolbar,
  Pagination as VoltoPagination,
} from '@plone/volto/components';

import backSVG from '@plone/volto/icons/back.svg';
import zoomSVG from '@plone/volto/icons/zoom.svg';
import downloadSVG from '@plone/volto/icons/download.svg';
import { map } from 'lodash';
import { toast } from 'react-toastify';
import { Toast } from '@plone/volto/components';
import StatisticsBox from './StatisticsBox';

const messages = defineMessages({
  back: {
    id: 'Back',
    defaultMessage: 'Back',
  },
  redirects: {
    id: 'EEA Redirects',
    defaultMessage: 'EEA Redirects',
  },
  success: {
    id: 'Success',
    defaultMessage: 'Success',
  },
  successAdd: {
    id: 'Redirect has been added',
    defaultMessage: 'Redirect has been added',
  },
  successRemove: {
    id: 'Redirect(s) have been removed',
    defaultMessage: 'Redirect(s) have been removed',
  },
});

const itemsPerPageChoices = [10, 25, 50, 100, 500, 1000];

/**
 * Redirects class.
 * @class Redirects
 * @extends Component
 */
class Redirects extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    addRedirects: PropTypes.func.isRequired,
    getRedirects: PropTypes.func.isRequired,
    getRedirectsStatistics: PropTypes.func.isRequired,
    removeRedirects: PropTypes.func.isRequired,
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs Redirects
   */
  constructor(props) {
    super(props);
    this.state = {
      isClient: false,
      oldUrlPath: '',
      isOldUrlCorrect: false,
      newUrlPath: '',
      isNewUrlCorrect: true, // Start as true since empty is valid
      redirectsToRemove: [],
      errorMessageAdd: '',
      filterQuery: '',
      searchScope: 'old_url', // Default to searching old URLs only
      redirects: [],
      activePage: 1,
      pages: '',
      itemsPerPage: 10,
      statisticsResetKey: 0, // Increment this to reset statistics counters
      importingCSV: false, // Loading state for CSV import
      csvFile: null, // Selected CSV file
      isDragging: false, // Dragging state for drop zone
    };
  }

  /**
   * Component did mount
   * @method componentDidMount
   * @returns {undefined}
   */
  componentDidMount() {
    const { filterQuery, itemsPerPage, searchScope } = this.state;
    this.setState({ isClient: true });
    // Fetch redirects (fast)
    this.props.getRedirects(getBaseUrl(this.props.pathname), {
      query: filterQuery,
      batchSize: itemsPerPage,
      searchScope: searchScope,
    });
    // Fetch statistics separately (async, doesn't block)
    this.props.getRedirectsStatistics(getBaseUrl(this.props.pathname), {
      query: filterQuery,
    });
  }

  /**
   * Component did update
   * @method componentDidUpdate
   * @returns {undefined}
   */
  componentDidUpdate(prevProps, prevState) {
    const { filterQuery, itemsPerPage } = this.state;
    if (
      prevProps.redirects.items_total !== this.props.redirects.items_total ||
      prevState.itemsPerPage !== this.state.itemsPerPage
    ) {
      // Calculate total pages - ensure we always have at least 1 page if there are items
      const totalItems = this.props.redirects.items_total;
      const pages =
        totalItems > 0 ? Math.ceil(totalItems / this.state.itemsPerPage) : 0;

      if (pages === 0 || isNaN(pages)) {
        this.setState({ pages: '' });
      } else {
        this.setState({ pages });
      }
    }
    if (
      prevState.activePage !== this.state.activePage ||
      prevState.itemsPerPage !== this.state.itemsPerPage
    ) {
      // Calculate batch start - ensure it doesn't exceed total items
      const batchStart = Math.min(
        (this.state.activePage - 1) * this.state.itemsPerPage,
        Math.max(0, this.props.redirects.items_total - this.state.itemsPerPage),
      );

      this.props.getRedirects(getBaseUrl(this.props.pathname), {
        query: filterQuery,
        batchSize: itemsPerPage,
        batchStart: batchStart,
        searchScope: this.state.searchScope,
      });
    }
    if (prevState.oldUrlPath !== this.state.oldUrlPath) {
      const trimmedOld = this.state.oldUrlPath.trim();
      if (trimmedOld.charAt(0) === '/') {
        this.setState({ isOldUrlCorrect: true });
      } else {
        this.setState({ isOldUrlCorrect: false });
      }
    }

    if (prevState.newUrlPath !== this.state.newUrlPath) {
      const trimmedNew = this.state.newUrlPath.trim();
      if (
        trimmedNew === '' ||
        trimmedNew.charAt(0) === '/' ||
        trimmedNew.startsWith('http://') ||
        trimmedNew.startsWith('https://')
      ) {
        this.setState({ isNewUrlCorrect: true });
      } else {
        this.setState({ isNewUrlCorrect: false });
      }
    }
  }

  /**
   * Component will receive props
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.redirects.add.loading && !nextProps.redirects.add.loaded) {
      if (nextProps.redirects.add.error) {
        this.setState({
          errorMessageAdd:
            nextProps.redirects.add.error.response?.body?.message ||
            'An error occurred',
        });
      }
    }
    if (this.props.redirects.add.loading && nextProps.redirects.add.loaded) {
      const { filterQuery, itemsPerPage } = this.state;

      this.props.getRedirects(getBaseUrl(this.props.pathname), {
        query: filterQuery,
        batchSize: itemsPerPage,
      });
      this.props.getRedirectsStatistics(getBaseUrl(this.props.pathname), {
        query: filterQuery,
      });
      toast.success(
        <Toast
          success
          title={this.props.intl.formatMessage(messages.success)}
          content={this.props.intl.formatMessage(messages.successAdd)}
        />,
      );
      if (!nextProps.redirects.add.error) {
        this.setState({
          errorMessageAdd: '',
          oldUrlPath: '',
          newUrlPath: '',
        });
      }
    }
    if (
      this.props.redirects.remove.loading &&
      nextProps.redirects.remove.loaded
    ) {
      const { filterQuery, itemsPerPage } = this.state;

      this.props.getRedirects(getBaseUrl(this.props.pathname), {
        query: filterQuery,
        batchSize: itemsPerPage,
      });
      this.props.getRedirectsStatistics(getBaseUrl(this.props.pathname), {
        query: filterQuery,
      });
      toast.success(
        <Toast
          success
          title={this.props.intl.formatMessage(messages.success)}
          content={this.props.intl.formatMessage(messages.successRemove)}
        />,
      );
    }
  }

  /**
   * Back/Cancel handler
   * @method onCancel
   * @returns {undefined}
   */
  onCancel() {
    this.props.history.push(getParentUrl(this.props.pathname));
  }

  /**
   * Filter query change handler
   * @method handleFilterQueryChange
   * @returns {undefined}
   */
  handleFilterQueryChange(query) {
    this.setState({ filterQuery: query });
  }

  /**
   * Submit filter handler
   * @method handleSubmitFilter
   * @returns {undefined}
   */
  handleSubmitFilter() {
    const { filterQuery, itemsPerPage, statisticsResetKey, searchScope } =
      this.state;
    this.setState({
      activePage: 1,
      statisticsResetKey: statisticsResetKey + 1, // Reset counters on new search
    });
    this.props.getRedirects(getBaseUrl(this.props.pathname), {
      query: filterQuery,
      batchSize: itemsPerPage,
      searchScope: searchScope,
    });
    this.props.getRedirectsStatistics(getBaseUrl(this.props.pathname), {
      query: filterQuery,
    });
  }

  /**
   * Old url handler
   * @method handleOldUrlChange
   * @returns {undefined}
   */
  handleOldUrlChange(url) {
    this.setState({ oldUrlPath: url });
  }

  /**
   * New url handler
   * @method handleNewUrlChange
   * @returns {undefined}
   */
  handleNewUrlChange(url) {
    this.setState({ newUrlPath: url });
  }

  /**
   * New redirect submit handler
   * @method handleSubmitRedirect
   * @returns {undefined}
   */
  handleSubmitRedirect() {
    if (this.state.isOldUrlCorrect && this.state.isNewUrlCorrect) {
      this.props.addRedirects(getBaseUrl(this.props.pathname), {
        items: [
          {
            path: this.state.oldUrlPath.trim(),
            'redirect-to': this.state.newUrlPath.trim(),
          },
        ],
      });
    }
  }

  /**
   * Check to-remove redirects handler
   * @method handleCheckRedirect
   * @returns {undefined}
   */
  handleCheckRedirect(redirect) {
    const redirects = this.state.redirectsToRemove;
    if (redirects.includes(redirect)) {
      const index = redirects.indexOf(redirect);
      if (index > -1) {
        let newRedirectsArr = redirects;
        newRedirectsArr.splice(index, 1);
        this.setState({ redirectsToRemove: newRedirectsArr });
      }
    } else {
      this.setState({
        redirectsToRemove: [...this.state.redirectsToRemove, redirect],
      });
    }
  }

  /**
   * Remove redirects handler
   * @method handleRemoveRedirects
   * @returns {undefined}
   */
  handleRemoveRedirects = () => {
    const items = this.state.redirectsToRemove.map((path) => {
      return {
        path: path,
      };
    });
    this.props.removeRedirects(getBaseUrl(this.props.pathname), {
      items,
    });
    this.setState({ redirectsToRemove: [] });
  };

  /**
   * Select/Deselect all redirects handler
   * @method handleSelectAll
   * @returns {undefined}
   */
  handleSelectAll = () => {
    const allPaths =
      this.props.redirects.items?.map((redirect) => redirect.path) || [];
    const allSelected =
      allPaths.length > 0 &&
      allPaths.every((path) => this.state.redirectsToRemove.includes(path));

    if (allSelected) {
      // Deselect all current page items
      const remainingPaths = this.state.redirectsToRemove.filter(
        (path) => !allPaths.includes(path),
      );
      this.setState({ redirectsToRemove: remainingPaths });
    } else {
      // Select all current page items
      const newPaths = [
        ...new Set([...this.state.redirectsToRemove, ...allPaths]),
      ];
      this.setState({ redirectsToRemove: newPaths });
    }
  };

  /**
   * Pagination change handler
   * @method handlePageChange
   * @returns {undefined}
   */
  handlePageChange(e, { activePage }) {
    this.setState({ activePage });
  }

  /**
   * Items per page change handler
   * @method handleItemsPerPage
   * @returns {undefined}
   */
  handleItemsPerPage(e, { value }) {
    this.setState({ itemsPerPage: value, activePage: 1 });
  }

  /**
   * Export selected to CSV handler
   * @method handleExportCSV
   * @returns {undefined}
   */
  handleExportCSV = () => {
    if (this.state.redirectsToRemove.length === 0) {
      return;
    }

    // Get selected redirects from all items
    const allItems = this.props.redirects.items || [];
    const selectedItems = allItems.filter((redirect) =>
      this.state.redirectsToRemove.includes(redirect.path),
    );

    this.exportToCSV(selectedItems, 'selected');
  };

  /**
   * Handle CSV file selection
   * @method handleCSVFileChange
   * @returns {undefined}
   */
  handleCSVFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      this.setState({ csvFile: file });
    } else if (file) {
      toast.error(
        <Toast
          error
          title="Invalid file type"
          content="Please select a CSV file"
        />,
      );
    }
  };

  /**
   * Handle drag over
   * @method handleDragOver
   * @returns {undefined}
   */
  handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isDragging: true });
  };

  /**
   * Handle drag leave
   * @method handleDragLeave
   * @returns {undefined}
   */
  handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isDragging: false });
  };

  /**
   * Handle drop
   * @method handleDrop
   * @returns {undefined}
   */
  handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isDragging: false });

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      this.setState({ csvFile: file });
      // Auto-import on drop
      this.handleImportCSV(file);
    } else if (file) {
      toast.error(
        <Toast
          error
          title="Invalid file type"
          content="Please select a CSV file"
        />,
      );
    }
  };

  /**
   * Import redirects from CSV
   * @method handleImportCSV
   * @param {File} file Optional file to import (for drag-and-drop)
   * @returns {undefined}
   */
  handleImportCSV = async (file = null) => {
    const csvFile = file || this.state.csvFile;
    if (!csvFile) {
      return;
    }

    this.setState({ importingCSV: true, csvFile });

    try {
      // Read CSV file
      const text = await csvFile.text();
      const lines = text.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        throw new Error('CSV file is empty or has no data rows');
      }

      // Parse CSV (skip header row)
      const redirects = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parsing (handles quoted fields)
        const matches = line.match(
          /("(?:[^"]|"")*"|[^,]*),("(?:[^"]|"")*"|[^,]*)/,
        );
        if (!matches) continue;

        let oldUrl = matches[1].trim();
        let newUrl = matches[2].trim();

        // Remove quotes if present
        if (oldUrl.startsWith('"') && oldUrl.endsWith('"')) {
          oldUrl = oldUrl.slice(1, -1).replace(/""/g, '"');
        }
        if (newUrl.startsWith('"') && newUrl.endsWith('"')) {
          newUrl = newUrl.slice(1, -1).replace(/""/g, '"');
        }

        if (oldUrl) {
          redirects.push({
            path: oldUrl,
            'redirect-to': newUrl || '',
          });
        }
      }

      if (redirects.length === 0) {
        throw new Error('No valid redirects found in CSV file');
      }

      // Send to backend
      this.props.addRedirects(getBaseUrl(this.props.pathname), {
        items: redirects,
      });

      // Clear file input
      this.setState({ csvFile: null });
      if (this.fileInputRef) {
        this.fileInputRef.value = '';
      }

      toast.success(
        <Toast
          success
          title="Success"
          content={`Importing ${redirects.length} redirect${
            redirects.length !== 1 ? 's' : ''
          }...`}
        />,
      );
    } catch (error) {
      console.error('Import error:', error);
      toast.error(
        <Toast
          error
          title="Error"
          content={`Failed to import CSV: ${error.message}`}
        />,
      );
    } finally {
      this.setState({ importingCSV: false });
    }
  };

  /**
   * Export items to CSV
   * @method exportToCSV
   * @param {Array} items Items to export
   * @param {string} type Type of export (selected, filtered, all)
   * @returns {undefined}
   */
  exportToCSV = (items, type) => {
    // Create CSV content
    const headers = ['Old URL', 'New URL'];
    const rows = items.map((redirect) => [
      redirect.path,
      redirect['redirect-to'] || '',
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            const cellStr = String(cell);
            if (
              cellStr.includes(',') ||
              cellStr.includes('"') ||
              cellStr.includes('\n')
            ) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(','),
      ),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `redirects-${type}-${timestamp}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    return (
      <div id="page-redirects">
        <Helmet title={this.props.intl.formatMessage(messages.redirects)} />
        <Container>
          <article id="content">
            <Segment.Group raised>
              <Segment className="primary">
                <FormattedMessage
                  id="EEA Redirects"
                  defaultMessage="EEA Redirects"
                />
              </Segment>
              <Segment secondary>
                <FormattedMessage
                  id="Manage URL redirects stored in Redis. Redirects are used to forward users from old URLs to new URLs."
                  defaultMessage="Manage URL redirects stored in Redis. Redirects are used to forward users from old URLs to new URLs."
                />
              </Segment>
              <Form>
                <Segment className="primary">
                  <Header size="small">
                    <FormattedMessage
                      id="Search redirects"
                      defaultMessage="Search redirects"
                    />
                  </Header>
                  <p className="help">
                    <FormattedMessage
                      id="Search by old or new URL path. Supports regex patterns (e.g., ^/publications for paths starting with /publications)."
                      defaultMessage="Search by old or new URL path. Supports regex patterns (e.g., ^/publications for paths starting with /publications)."
                    />
                  </p>
                  <Form.Group
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '0.5em',
                    }}
                  >
                    <Form.Field style={{ flex: '1 1 auto' }}>
                      <Input
                        name="filter"
                        placeholder="Search: /themes or ^/publications or https://example.com"
                        value={this.state.filterQuery}
                        onChange={(e) =>
                          this.handleFilterQueryChange(e.target.value)
                        }
                      />
                    </Form.Field>
                    <Form.Field
                      style={{ flex: '0 0 auto', minWidth: 'fit-content' }}
                    >
                      <Dropdown
                        selection
                        name="searchScope"
                        placeholder="Search in"
                        value={this.state.searchScope}
                        options={[
                          { key: 'old_url', text: 'Old URL', value: 'old_url' },
                          { key: 'new_url', text: 'New URL', value: 'new_url' },
                          { key: 'both', text: 'Both URLs', value: 'both' },
                        ]}
                        onChange={(e, { value }) =>
                          this.setState({ searchScope: value })
                        }
                      />
                    </Form.Field>
                    <Form.Field style={{ flex: '0 0 auto' }}>
                      <Button
                        icon
                        onClick={() => this.handleSubmitFilter()}
                        primary
                        loading={this.props.redirects.get.loading}
                        title="Search"
                        aria-label="Search"
                      >
                        <Icon name={zoomSVG} size="18px" />
                      </Button>
                    </Form.Field>
                  </Form.Group>

                  <Segment style={{ marginTop: '20px' }}>
                    <Statistic.Group
                      widths="4"
                      size="small"
                      stackable
                      style={{ margin: '0 !important' }}
                    >
                      <StatisticsBox
                        label={
                          this.state.filterQuery
                            ? 'Search Results'
                            : 'Total Redirects'
                        }
                        value={this.props.redirects.statistics?.total}
                        color="blue"
                        loading={this.props.redirects.getstatistics.loading}
                        reset={this.state.statisticsResetKey}
                      />
                      <StatisticsBox
                        label="Internal"
                        value={this.props.redirects.statistics?.internal}
                        color="green"
                        loading={this.props.redirects.getstatistics.loading}
                        reset={this.state.statisticsResetKey}
                      />
                      <StatisticsBox
                        label="External"
                        value={this.props.redirects.statistics?.external}
                        color="orange"
                        loading={this.props.redirects.getstatistics.loading}
                        reset={this.state.statisticsResetKey}
                      />
                      <StatisticsBox
                        label="Gone"
                        value={this.props.redirects.statistics?.gone}
                        color="red"
                        loading={this.props.redirects.getstatistics.loading}
                        reset={this.state.statisticsResetKey}
                      />
                    </Statistic.Group>
                    <style>{`
                      @media only screen and (max-width: 767px) {
                        .ui.four.statistics {
                          display: grid !important;
                          grid-template-columns: repeat(2, 1fr) !important;
                          gap: 1em !important;
                        }
                        .ui.four.statistics .statistic {
                          width: 100% !important;
                          margin: 0 !important;
                        }
                      }
                    `}</style>
                  </Segment>

                  <div
                    style={{
                      position: 'relative',
                      minHeight: '200px',
                      marginTop: '20px',
                    }}
                  >
                    {this.props.redirects.get.loading && (
                      <Dimmer active inverted>
                        <Loader inverted>
                          <FormattedMessage
                            id="Loading redirects..."
                            defaultMessage="Loading redirects..."
                          />
                        </Loader>
                      </Dimmer>
                    )}
                    <Table
                      compact
                      striped
                      style={{ fontSize: '0.9em', tableLayout: 'fixed' }}
                    >
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell
                            style={{ width: '60px' }}
                            textAlign="center"
                          >
                            <Checkbox
                              onChange={this.handleSelectAll}
                              checked={
                                this.props.redirects.items?.length > 0 &&
                                this.props.redirects.items.every((redirect) =>
                                  this.state.redirectsToRemove.includes(
                                    redirect.path,
                                  ),
                                )
                              }
                              indeterminate={
                                this.props.redirects.items?.some((redirect) =>
                                  this.state.redirectsToRemove.includes(
                                    redirect.path,
                                  ),
                                ) &&
                                !this.props.redirects.items?.every((redirect) =>
                                  this.state.redirectsToRemove.includes(
                                    redirect.path,
                                  ),
                                )
                              }
                            />
                          </Table.HeaderCell>
                          <Table.HeaderCell
                            style={{ width: 'calc(50% - 30px)' }}
                          >
                            <FormattedMessage
                              id="Old URL"
                              defaultMessage="Old URL"
                            />
                          </Table.HeaderCell>
                          <Table.HeaderCell
                            style={{ width: 'calc(50% - 30px)' }}
                          >
                            <FormattedMessage
                              id="New URL"
                              defaultMessage="New URL"
                            />
                          </Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {this.props.redirects.items &&
                        this.props.redirects.items.length > 0 ? (
                          this.props.redirects.items.map((redirect, i) => (
                            <Table.Row key={i}>
                              <Table.Cell textAlign="center">
                                <Checkbox
                                  onChange={(e, { value }) =>
                                    this.handleCheckRedirect(value)
                                  }
                                  checked={this.state.redirectsToRemove.includes(
                                    redirect.path,
                                  )}
                                  value={redirect.path}
                                />
                              </Table.Cell>
                              <Table.Cell
                                title={redirect.path}
                                style={{
                                  wordBreak: 'break-all',
                                  fontSize: '0.85em',
                                  overflow: 'hidden',
                                }}
                              >
                                <code
                                  style={{
                                    background: '#f5f5f5',
                                    padding: '2px 4px',
                                    borderRadius: '3px',
                                  }}
                                >
                                  {redirect.path}
                                </code>
                              </Table.Cell>
                              <Table.Cell
                                title={redirect['redirect-to']}
                                style={{
                                  wordBreak: 'break-all',
                                  fontSize: '0.85em',
                                  overflow: 'hidden',
                                }}
                              >
                                <code
                                  style={{
                                    background: '#e8f5e9',
                                    padding: '2px 4px',
                                    borderRadius: '3px',
                                  }}
                                >
                                  {redirect['redirect-to']}
                                </code>
                              </Table.Cell>
                            </Table.Row>
                          ))
                        ) : (
                          <Table.Row>
                            <Table.Cell colSpan={3}>
                              <p
                                style={{
                                  textAlign: 'center',
                                  color: '#888',
                                  padding: '20px',
                                }}
                              >
                                <FormattedMessage
                                  id="No redirects found"
                                  defaultMessage="No redirects found"
                                />
                              </p>
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </Table.Body>
                    </Table>
                  </div>
                  {this.state.pages > 0 && (
                    <VoltoPagination
                      current={this.state.activePage - 1}
                      total={this.state.pages}
                      pageSize={this.state.itemsPerPage}
                      pageSizes={itemsPerPageChoices}
                      onChangePage={(e, { value }) =>
                        this.setState({ activePage: value + 1 })
                      }
                      onChangePageSize={(e, { value }) =>
                        this.setState({ itemsPerPage: value, activePage: 1 })
                      }
                    />
                  )}
                  <div
                    style={{
                      marginTop: '1em',
                      display: 'flex',
                      gap: '0.5em',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button
                      disabled={this.state.redirectsToRemove.length === 0}
                      onClick={this.handleRemoveRedirects}
                      negative
                    >
                      <FormattedMessage
                        id="Remove selected"
                        defaultMessage="Remove selected"
                      />
                    </Button>
                    <Button
                      disabled={this.state.redirectsToRemove.length === 0}
                      onClick={this.handleExportCSV}
                      primary
                    >
                      <FormattedMessage
                        id="Export selected"
                        defaultMessage="Export selected"
                      />
                    </Button>
                  </div>
                </Segment>
                <Segment>
                  <Header size="medium">
                    <FormattedMessage
                      id="Add a new redirect"
                      defaultMessage="Add a new redirect"
                    />
                  </Header>
                  <Header size="small">
                    <FormattedMessage
                      id="Old URL Path (Required)"
                      defaultMessage="Old URL Path (Required)"
                    />
                  </Header>
                  <p className="help">
                    <FormattedMessage
                      id="Enter the absolute path of the old URL. The path must start with '/'."
                      defaultMessage="Enter the absolute path of the old URL. The path must start with '/'."
                    />
                  </p>
                  <Form.Field>
                    <Input
                      id="old-url-input"
                      name="old-url-path"
                      placeholder="/old-path"
                      value={this.state.oldUrlPath}
                      onChange={(e) => this.handleOldUrlChange(e.target.value)}
                    />
                    {!this.state.isOldUrlCorrect &&
                      this.state.oldUrlPath !== '' && (
                        <p style={{ color: 'red' }}>
                          <FormattedMessage
                            id="Old URL path must start with a slash."
                            defaultMessage="Old URL path must start with a slash."
                          />
                        </p>
                      )}
                  </Form.Field>
                  <Header size="small">
                    <FormattedMessage
                      id="New URL Path"
                      defaultMessage="New URL Path"
                    />
                  </Header>
                  <p className="help">
                    <FormattedMessage
                      id="Enter the absolute path or full URL of the target. The path must start with '/' or be a full URL (http://, https://). Leave empty for HTTP 410 (Gone) - deleted pages."
                      defaultMessage="Enter the absolute path or full URL of the target. The path must start with '/' or be a full URL (http://, https://). Leave empty for HTTP 410 (Gone) - deleted pages."
                    />
                  </p>
                  <Form.Field>
                    <Input
                      id="new-url-input"
                      name="new-url-path"
                      placeholder="/new-path, https://example.com, or empty for Gone"
                      value={this.state.newUrlPath}
                      onChange={(e) => this.handleNewUrlChange(e.target.value)}
                    />
                    {!this.state.isNewUrlCorrect &&
                      this.state.newUrlPath !== '' && (
                        <p style={{ color: 'red' }}>
                          <FormattedMessage
                            id="New URL must start with a slash, be a full URL, or be empty for Gone."
                            defaultMessage="New URL must start with a slash, be a full URL, or be empty for Gone."
                          />
                        </p>
                      )}
                  </Form.Field>
                  <Button
                    id="submit-redirect"
                    primary
                    onClick={() => this.handleSubmitRedirect()}
                    disabled={
                      !this.state.isOldUrlCorrect ||
                      !this.state.isNewUrlCorrect ||
                      this.state.oldUrlPath === ''
                    }
                  >
                    <FormattedMessage id="Add" defaultMessage="Add" />
                  </Button>
                  {this.state.errorMessageAdd && (
                    <Message color="red">
                      <Message.Header>
                        <FormattedMessage
                          id="ErrorHeader"
                          defaultMessage="Error"
                        />
                      </Message.Header>
                      <p>{this.state.errorMessageAdd}</p>
                    </Message>
                  )}

                  <Header size="small" style={{ marginTop: '2em' }}>
                    <FormattedMessage
                      id="Or import from CSV"
                      defaultMessage="Or import from CSV"
                    />
                  </Header>
                  <p className="help">
                    <FormattedMessage
                      id="Drag and drop a CSV file or click to browse. The file should have two columns: 'Old URL' and 'New URL'. The first row (header) will be skipped."
                      defaultMessage="Drag and drop a CSV file or click to browse. The file should have two columns: 'Old URL' and 'New URL'. The first row (header) will be skipped."
                    />
                  </p>
                  <div
                    onDragOver={this.handleDragOver}
                    onDragLeave={this.handleDragLeave}
                    onDrop={this.handleDrop}
                    onClick={() => this.fileInputRef?.click()}
                    style={{
                      border: this.state.isDragging
                        ? '2px dashed #2185d0'
                        : '2px dashed #ccc',
                      borderRadius: '8px',
                      padding: '40px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: this.state.isDragging
                        ? '#f0f8ff'
                        : '#fafafa',
                      transition: 'all 0.3s ease',
                      marginBottom: '1em',
                    }}
                  >
                    <input
                      type="file"
                      accept=".csv"
                      onChange={this.handleCSVFileChange}
                      ref={(ref) => {
                        this.fileInputRef = ref;
                      }}
                      style={{ display: 'none' }}
                    />
                    {this.state.importingCSV ? (
                      <div>
                        <Loader active inline size="small" />
                        <p style={{ marginTop: '1em', color: '#666' }}>
                          <FormattedMessage
                            id="Importing CSV..."
                            defaultMessage="Importing CSV..."
                          />
                        </p>
                      </div>
                    ) : this.state.csvFile ? (
                      <div>
                        <Icon
                          name={downloadSVG}
                          size="48px"
                          style={{ opacity: 0.5 }}
                        />
                        <p style={{ marginTop: '1em', fontWeight: 'bold' }}>
                          {this.state.csvFile.name}
                        </p>
                        <p style={{ color: '#666', fontSize: '0.9em' }}>
                          <FormattedMessage
                            id="Click 'Import CSV' to upload or drop another file"
                            defaultMessage="Click 'Import CSV' to upload or drop another file"
                          />
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Icon
                          name={downloadSVG}
                          size="48px"
                          style={{ opacity: 0.3 }}
                        />
                        <p style={{ marginTop: '1em', fontWeight: 'bold' }}>
                          <FormattedMessage
                            id="Drop CSV file here or click to browse"
                            defaultMessage="Drop CSV file here or click to browse"
                          />
                        </p>
                        <p style={{ color: '#666', fontSize: '0.9em' }}>
                          <FormattedMessage
                            id="File will be imported automatically on drop"
                            defaultMessage="File will be imported automatically on drop"
                          />
                        </p>
                      </div>
                    )}
                  </div>
                  {this.state.csvFile && !this.state.importingCSV && (
                    <Button
                      primary
                      onClick={() => this.handleImportCSV()}
                      disabled={!this.state.csvFile}
                    >
                      <FormattedMessage
                        id="Import CSV"
                        defaultMessage="Import CSV"
                      />
                    </Button>
                  )}
                </Segment>
              </Form>
            </Segment.Group>
          </article>
        </Container>
        {this.state.isClient && (
          <Portal node={document.getElementById('toolbar')}>
            <Toolbar
              pathname={this.props.pathname}
              hideDefaultViewButtons
              inner={
                <Link className="item" to="#" onClick={() => this.onCancel()}>
                  <Icon
                    name={backSVG}
                    className="contents circled"
                    size="30px"
                    title={this.props.intl.formatMessage(messages.back)}
                  />
                </Link>
              }
            />
          </Portal>
        )}
      </div>
    );
  }
}

export default compose(
  injectIntl,
  connect(
    (state, props) => ({
      redirects: state.redirects,
      pathname: props.location.pathname,
    }),
    { addRedirects, getRedirects, getRedirectsStatistics, removeRedirects },
  ),
)(Redirects);
