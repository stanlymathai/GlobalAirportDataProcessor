const axios = require('axios');
const cheerio = require('cheerio');

let totalProcessed = 0;
let totalAirports = 0;

const { airportBulkInsert } = require('../services/auth.service');

async function fetchTimeZone(latitude, longitude) {
  const apiKey = 'AVWMIH3NA73S';
  const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${latitude}&lng=${longitude}`;

  try {
    const response = await axios.get(url);

    return response.data;
  } catch (error) {
    return null;
  }
}

async function getAirportInfoByIATAcode(iata) {
  const options = {
    method: 'GET',
    url: 'https://airport-info.p.rapidapi.com/airport',
    params: { iata: iata },
    headers: {
      'X-RapidAPI-Key': 'a30fca62cdmsh3596f9e66547c17p1d26abjsn3ee7bfff5cf8', // max around 955
      'X-RapidAPI-Host': 'airport-info.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function listOfAirportsByIataAirportCodeByLeter(char) {
  try {
    const url = `https://en.wikipedia.org/wiki/List_of_airports_by_IATA_airport_code:_${char}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const airports = [];

    $('table.wikitable tbody tr').each((i, element) => {
      const tds = $(element).find('td');
      if (tds.length > 0) {
        const IATA = $(tds[0]).text().trim();
        const ICAO = $(tds[1]).text().trim();
        const NAME = $(tds[2]).text().trim();
        const LOCATION = $(tds[3]).text().trim();

        airports.push({ IATA, ICAO, NAME, LOCATION });
      }
    });

    // return airports;
    return airports;
  } catch (error) {
    console.error('Error scraping airports:', error);
  }
}

async function orchestrate() {
  let allAirports = [];

  const chars = [
    'D',
    'S',
    'N',
    'L',
    'O',
    'E',
    'A',
    'I',
    'T',

    'R',
    'H',
    'C',
    'M',
    'W',
    'U',
    'Y',
    'P',
    'B',

    'G',
    'F',
    'K',
    'Q',
    'Z',
    'V',
    'X',
    'J',
  ];

  for (let i = 0; i < chars.length; i++) {
    const airports = await listOfAirportsByIataAirportCodeByLeter(chars[i]);
    const airportsLength = airports.length;
    const charsPending = chars.length - (i + 1);

    console.log(
      `Processing ${airportsLength} airports for character '${chars[i]}'. Characters pending: ${charsPending}`
    );

    totalAirports += airportsLength;

    if (airportsLength === 0) {
      console.log(`No airports found for character '${chars[i]}'`);
      continue;
    }

    for (let airport of airports) {
      try {
        const airportInfo = await getAirportInfoByIATAcode(airport.IATA);

        let timeZoneInfo = null;
        if (airportInfo.latitude && airportInfo.longitude)
          timeZoneInfo = await fetchTimeZone(
            airportInfo.latitude,
            airportInfo.longitude
          );

        const airportData = {
          name: airport.NAME ?? airportInfo.name,
          location: airport.LOCATION ?? airportInfo.location,

          iataCode: airport.IATA ?? airportInfo.iata,
          icaoCode: airport.ICAO ?? airportInfo.icao,

          phone: airportInfo?.phone,
          website: airportInfo?.website,

          streetNumber: airportInfo?.street_number,
          streetName: airportInfo?.street,
          postalCode: airportInfo?.postal_code,

          city: airportInfo?.city,
          county: airportInfo?.county,
          state: airportInfo?.state,

          country: airportInfo?.country,
          countryIso: airportInfo?.country_iso,

          latitude: airportInfo?.latitude,
          longitude: airportInfo?.longitude,

          timezone: {
            name: timeZoneInfo?.zoneName,
            abbreviation: timeZoneInfo?.abbreviation,
            gmtOffset: timeZoneInfo?.gmtOffset,
            daylightSavingTime: timeZoneInfo?.dst === '1',
            zoneStart: timeZoneInfo?.zoneStart,
            zoneEnd: timeZoneInfo?.zoneEnd,
            nextAbbreviation: timeZoneInfo?.nextAbbreviation,
          },

          isOperational: true,
          dataSources: [
            'Wikipedia - https://en.wikipedia.org/wiki/List_of_airports_by_IATA_airport_code',
            'RapidAPI - https://rapidapi.com/active-api/api/airport-info',
            'TimezoneDB - http://api.timezonedb.com/v2.1/get-time-zone',
          ],
        };

        allAirports.push(airportData);
        totalProcessed++;
        console.log(`Processed airport ${airport.IATA} (${totalProcessed})`);
      } catch (error) {
        console.error(`Error processing airport ${airport.IATA}:`, error);
      }
    }

    // Perform bulk insert for the current character
    await airportBulkInsert(allAirports);
    console.log(
      `Bulk inserted airports for character '${chars[i]}'. Total inserted so far: ${totalProcessed}`
    );

    // Clear allAirports array for the next character
    allAirports = [];
  }

  console.log('All airports processing completed');
  console.log(`Total airports: ${totalAirports}`);
  console.log(`Total processed and inserted: ${totalProcessed}`);
}

module.exports = { orchestrate };
