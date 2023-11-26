const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },

    iataCode: { type: String, unique: true, required: true },
    icaoCode: String,

    timezone: {
      name: String,
      abbreviation: String,
      gmtOffset: Number,
      daylightSavingTime: Boolean,
      zoneStart: Number,
      zoneEnd: Number,
      nextAbbreviation: String,
    },

    phone: String,
    website: String,

    streetNumber: String,
    streetName: String,
    postalCode: String,

    city: String,
    county: String,
    state: String,

    country: String,
    countryIso: String,

    latitude: Number,
    longitude: Number,

    isOperational: {
      type: Boolean,
      default: true,
    },
    dataSources: { type: Array },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Airports', airportSchema);
