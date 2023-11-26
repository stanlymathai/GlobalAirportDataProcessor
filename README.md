# Airport Information Processor

## Overview

This Node.js script is designed to fetch and process detailed information about airports around the world. It gathers data from various sources including Wikipedia, RapidAPI, and TimezoneDB, and then processes and stores this information in a structured format.

## Features

- **Data Scraping**: Extracts airport data (IATA, ICAO, name, location) from Wikipedia.
- **API Integration**: Uses RapidAPI to get detailed airport information and TimezoneDB to fetch timezone data based on airport coordinates.
- **Data Enrichment**: Enhances airport data with additional details like phone, website, address, and timezone.
- **Bulk Data Processing**: Capable of processing large datasets efficiently.

## Prerequisites

- Node.js
- Axios and Cheerio npm packages
- Access to the APIs used (TimezoneDB, RapidAPI's Airport Info API).

## Installation

1. Clone the repository to your local machine.
2. Install the required npm packages:
   ```
   npm install -g axios cheerio
   ```
3. Ensure you have valid API keys for TimezoneDB and RapidAPI.

## Usage

To start the data processing, simply run the script:

```
node index.js
```

The script will sequentially process airports based on their IATA codes, fetch relevant data, enrich it with additional details, and perform bulk inserts into a database.

## Configuration

- API keys for TimezoneDB and RapidAPI need to be provided in the script.
- You can modify the list of IATA code characters to process specific sets of airports.

## Contributing

Contributions to enhance the functionality or efficiency of this script are welcome. Please ensure to follow the existing coding style and add unit tests for any new or changed functionality.

## License

This project is licensed under the [MIT License](LICENSE).