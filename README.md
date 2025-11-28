# volto-redirector

[![Releases](https://img.shields.io/github/v/release/eea/volto-redirector)](https://github.com/eea/volto-redirector/releases)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-redirector%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-redirector/job/master/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-redirector-master&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-redirector-master)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-redirector-master&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-redirector-master)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-redirector-master&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-redirector-master)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-redirector-master&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-redirector-master)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-redirector%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-redirector/job/develop/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-redirector-develop&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-redirector-develop)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-redirector-develop&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-redirector-develop)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-redirector-develop&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-redirector-develop)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-redirector-develop&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-redirector-develop)


[Volto](https://github.com/plone/volto) add-on

## Features

### Control Panel Features

- **Redirects Management**: Full CRUD interface for managing URL redirects stored in Redis
- **Real-time Statistics**: Animated statistics boxes showing:
  - Total redirects / search results
  - Internal redirects (paths starting with `/`)
  - External redirects (full URLs with `http://` or `https://`)
  - Gone redirects (HTTP 410 - permanently deleted content)
- **Add Redirects**: Create new redirects with validation:
  - Old URL must start with `/`
  - New URL can be relative (`/path`), absolute (`https://example.com`), or empty (HTTP 410)
  - Automatic whitespace trimming
  - Prevention of self-redirects
- **Remove Redirects**: Bulk delete multiple redirects at once with "Select All" checkbox
- **CSV Import/Export**:
  - Import redirects from CSV files via drag-and-drop or file browser
  - Export selected redirects to CSV for backup or migration
  - Automatic validation and error reporting
- **Advanced Search**: Search by old or new URL path with regex support and search scope selector:
  - Search scope: Old URL, New URL, or Both URLs
  - Simple search: `/themes` (finds in both old and new URLs)
  - External URLs: `example.com` (finds redirects to external sites)
  - Starts with: `^/publications`
  - Ends with: `.*\.pdf$`
  - Complex patterns: `.*/[0-9]{4}/.*`
- **Pagination**: Browse through large datasets with configurable page sizes (10, 25, 50, 100, 500, 1000)
- **Performance**: Handles 100,000+ redirects with ~2 second statistics load time
- **Responsive UI**: Compact table design with tooltips for long URLs

### HTTP 410 Gone Support

- **Custom 410 Page**: Beautiful error page for permanently deleted content
- **Wayback Machine Integration**: Link to archived versions via Internet Archive
- **User-friendly Messages**: Clear communication about deleted resources

### Technical Features

- **Redis Storage**: High-performance Redis backend for fast lookups
- **REST API Integration**: Uses `@redirects` and `@redirects-statistics` endpoints
- **Progressive Loading**: Statistics load asynchronously without blocking the UI
- **Countup Animations**: Engaging number animations while loading statistics
- **Error Handling**: Graceful handling of failed operations with user feedback

## Backend Requirements

This addon requires the `eea.api.redirector` Plone backend package to be installed and configured:

1. Install `eea.api.redirector` in your Plone backend
2. Configure Redis connection via environment variables:
   - `REDIS_SERVER`: Redis server address (default: localhost)
   - `REDIS_PORT`: Redis server port (default: 6379)
   - `REDIS_DB`: Redis database index (default: 0)
   - `REDIS_TIMEOUT`: Connection timeout in seconds (default: 5)

## Usage

After installation, the EEA Redirects control panel will be available at:

**Site Setup → EEA Redirects** (`/controlpanel/eea-redirects`)

### Adding a Redirect

1. Navigate to the EEA Redirects control panel
2. Enter the **Old URL Path**:
   - Must start with `/`
   - Example: `/old-page` or `/news/2023/article`
3. Enter the **New URL Path** (optional - leave empty for HTTP 410):
   - Relative path: `/new-page`
   - Absolute URL: `https://example.com/page`
   - Empty: Leave blank to mark as permanently deleted (HTTP 410 Gone)
4. Click **Add**

The redirect will be immediately added to Redis and appear in the list.

### Marking Content as Deleted (HTTP 410)

To indicate that a page has been permanently deleted:

1. Enter the old URL path
2. Leave the new URL path **empty**
3. Click **Add**

When users visit this URL, they'll see a custom 410 Gone page with:
- Explanation that the content no longer exists
- Link to view archived versions via Wayback Machine
- Helpful navigation options

### Searching Redirects

Use the search box to filter redirects by old or new URL path. Supports both simple and regex patterns:

**Simple search (searches both old and new URLs):**
- `/themes` - Find all redirects with "/themes" in old or new URL
- `/publications` - Find all redirects with "/publications"
- `example.com` - Find all redirects to example.com
- `https://` - Find all external redirects

**Regex patterns:**
- `^/publications` - Old URLs starting with "/publications"
- `.*\.pdf$` - URLs ending with ".pdf"
- `^/news/[0-9]{4}/` - News items from specific years
- `/environmental-.*` - URLs containing "environmental-"

Click **Search** to filter results. Statistics will update to reflect the filtered results.

**Use cases:**
- Find all redirects pointing to a specific domain: `example.com`
- Find all internal redirects to archive: `/archive`
- Find all broken external redirects: `http://old-domain.com`

### Removing Redirects

1. Check the checkboxes next to the redirects you want to remove (or use "Select All" checkbox in table header)
2. Click **Remove selected**
3. Confirm the deletion

Multiple redirects can be deleted at once. The "Select All" checkbox in the table header allows you to quickly select all redirects on the current page.

### Importing Redirects from CSV

Bulk import redirects from a CSV file:

1. Navigate to the "Add a new redirect" section
2. **Drag and drop** a CSV file onto the drop zone, OR click to browse and select a file
3. The file will be automatically imported on drop, or click **Import CSV** after selecting

**CSV Format:**
```csv
Old URL,New URL
/old-page,/new-page
/deleted-content,
/external-redirect,https://example.com/page
```

- First row (header) is skipped automatically
- Old URL must start with `/`
- New URL can be relative, absolute, or empty (for HTTP 410)
- Properly handles quoted fields with commas

### Exporting Redirects to CSV

Export redirects for backup or migration:

1. Select the redirects you want to export using checkboxes
2. Click **Export selected**
3. CSV file will be downloaded with format: `redirects-selected-YYYY-MM-DD.csv`

The exported CSV can be imported back into any instance of the redirector.

### Pagination

- Use the pagination controls at the bottom to navigate through pages
- Change items per page: Select 10, 25, 50, 100, 500, or 1000 from the dropdown
- Page numbers show your current position in the full dataset
- Pagination shows first page, current page range, and last page for easy navigation

### Statistics

The control panel displays real-time statistics with animated counters:

- **Total Redirects** - Total count (changes to "Search Results" when filtering)
- **Internal** - Redirects to internal paths (starting with `/`)
- **External** - Redirects to external URLs (starting with `http://` or `https://`)
- **Gone** - Empty redirects for permanently deleted content (HTTP 410)

Statistics update automatically when you search or modify redirects.

## Architecture

This addon is structured with the following key components:

### Redux State Management

- **Actions** (`src/actions/redirects.js`):
  - `getRedirects(url, options)` - Fetch redirects list with pagination
  - `getRedirectsStatistics(url, options)` - Fetch statistics separately for async loading
  - `addRedirects(url, data)` - Add new redirects
  - `removeRedirects(url, data)` - Delete redirects

- **Reducer** (`src/reducers/redirects.js`):
  - Manages loading states for list and statistics separately
  - Clears old statistics when new request starts to prevent stale data
  - Tracks items, total count, and statistics

### UI Components

- **Redirects** (`src/components/Controlpanels/Redirects.jsx`):
  - Main control panel component
  - Handles add/remove/search operations
  - Manages pagination and statistics reset
  - Form validation (old URL must start with `/`, new URL allows empty for HTTP 410)

- **StatisticsBox** (`src/components/Controlpanels/StatisticsBox.jsx`):
  - Animated counter component
  - Counts up infinitely while loading (~1000-1500 increments every 100ms)
  - Smoothly transitions to real value when data arrives
  - Resets to 0 on new searches

- **GoneView** (`src/components/GoneView/GoneView.jsx`):
  - Custom 410 Gone error page
  - Accordion with Wayback Machine integration
  - Uses `withServerErrorCode(410)` HOC to set proper status

### Routes and Registration

- Control panel route auto-discovered from backend `@controlpanels` endpoint
- 410 error view registered in `config.views.errorViews`
- No manual control panel registration needed (handled by backend)

## Performance Optimization

The addon implements several performance optimizations:

1. **Separate Statistics Endpoint**: Statistics load via `@redirects-statistics` instead of blocking the main list
2. **Progressive Loading**: List appears immediately, statistics load in background with animated counters
3. **Reset on Search**: Statistics counters reset to 0 and start counting when new search initiated
4. **Backend Pipelining**: Backend uses Redis pipelining for 42x faster statistics (see eea.api.redirector docs)

## Getting started

### Quick Start with Docker

The easiest way to try this addon is using Docker Compose, which will start:
- **Redis** - For storing redirects
- **Plone Backend** - Plone 6.0 with eea.api.redirector pre-installed and activated
- **Volto Frontend** - With volto-redirector addon

1. **Clone and start services:**

   ```bash
   git clone https://github.com/eea/volto-redirector.git
   cd volto-redirector
   docker-compose up
   ```

2. **Wait for services to start** (first time takes ~5 minutes to build):
   - Redis: `localhost:6379`
   - Backend: `http://localhost:8080/Plone` (Plone site auto-created with eea.api.redirector)
   - Frontend: `http://localhost:3000`

3. **Access the control panel:**
   - Visit `http://localhost:3000/controlpanel/eea-redirects`
   - Start managing redirects!

### Try it out

Once the control panel is open, you can:

1. **Add a test redirect:**
   - Old URL: `/old-page`
   - New URL: `/new-page`
   - Click "Add"

2. **Test the redirect:**
   - Visit `http://localhost:3000/old-page`
   - You'll be redirected to `/new-page`

3. **Try HTTP 410 (Gone):**
   - Old URL: `/deleted-content`
   - New URL: _(leave empty)_
   - Click "Add"
   - Visit `http://localhost:3000/deleted-content`
   - See the custom 410 Gone page

4. **Import bulk redirects:**
   - Create a CSV file with sample redirects
   - Drag and drop it onto the import area
   - Watch it import automatically

### Stopping and Data Persistence

- **Stop services:** `docker-compose down`
- **Stop and remove data:** `docker-compose down -v` (removes Redis data)
- **Redis data is persistent** in the `redis-data` volume, so redirects survive container restarts

### Troubleshooting

**Backend addon not showing in control panel:**
- Make sure you activated `eea.api.redirector` in Site Setup → Add-ons
- Check backend logs: `docker-compose logs backend`
- Restart the backend: `docker-compose restart backend`

**Control panel shows "No redirects found":**
- This is normal on first start - Redis is empty
- Try adding a test redirect to verify it's working

**Redis connection errors:**
- Check Redis is running: `docker-compose ps redis`
- Check backend can reach Redis: `docker-compose logs backend`

### Development Setup

If you want to develop the addon:

```bash
cd volto-redirector
make
make start
```

Go to http://localhost:3000

### Add volto-redirector to your Volto project

1. Make sure you have a [Plone backend](https://plone.org/download) up-and-running at http://localhost:8080/Plone

   ```Bash
   docker compose up backend
   ```

1. Start Volto frontend

* If you already have a volto project, just update `package.json`:

   ```JSON
   "addons": [
       "@eeacms/volto-redirector"
   ],

   "dependencies": {
       "@eeacms/volto-redirector": "*"
   }
   ```

* If not, create one:

   ```
   npm install -g yo @plone/generator-volto
   yo @plone/volto my-volto-project --canary --addon @eeacms/volto-redirector
   cd my-volto-project
   ```

1. Install new add-ons and restart Volto:

   ```
   yarn
   yarn start
   ```

1. Go to http://localhost:3000

1. Happy editing!

## Release

See [RELEASE.md](https://github.com/eea/volto-redirector/blob/master/RELEASE.md).

## How to contribute

See [DEVELOP.md](https://github.com/eea/volto-redirector/blob/master/DEVELOP.md).

## Copyright and license

The Initial Owner of the Original Code is European Environment Agency (EEA).
All Rights Reserved.

See [LICENSE.md](https://github.com/eea/volto-redirector/blob/master/LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
