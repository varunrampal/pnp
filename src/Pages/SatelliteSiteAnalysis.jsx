import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import plants from '../json/PlantsList.json';

const ADVISOR_FIELD = 'IsAdvisable';
const DEFAULT_CENTER = { lat: 49.1209, lng: -122.57 };
const DEFAULT_IMAGE = '/images/plants/default.jpg';
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-js-api';
const BRITISH_COLUMBIA_MAP_BOUNDS = {
  north: 60.1,
  south: 48.2,
  east: -114,
  west: -139.2,
};
const BRITISH_COLUMBIA_MIN_ZOOM = 6;
const ELEVATION_SAMPLE_DISTANCE_METERS = 70;
const SLOPE_EROSION_PERCENT = 8;

let googleMapsApiPromise;

const REGION_FILTER_LABELS = {
  coastal: 'Coastal BC',
  'lower-mainland': 'Lower Mainland',
  'vancouver-island': 'Vancouver Island',
  'bc-interior': 'BC Interior',
};

const WATER_CONTEXT_TERMS = [
  'bank',
  'bay',
  'beach',
  'canal',
  'creek',
  'ditch',
  'floodplain',
  'lake',
  'marsh',
  'pond',
  'river',
  'shore',
  'slough',
  'stream',
  'wetland',
];

const DENSE_VEGETATION_TERMS = [
  'conservation',
  'creek',
  'forest',
  'greenbelt',
  'park',
  'ravine',
  'reserve',
  'trail',
  'wetland',
  'woodland',
];

const LOW_VEGETATION_TERMS = [
  'airport',
  'business park',
  'downtown',
  'industrial',
  'mall',
  'parking',
  'plaza',
  'port',
  'warehouse',
];

const LOWER_MAINLAND_TERMS = [
  'abbotsford',
  'aldergrove',
  'burnaby',
  'chilliwack',
  'coquitlam',
  'delta',
  'fraser valley',
  'langley',
  'maple ridge',
  'mission',
  'new westminster',
  'north vancouver',
  'pitt meadows',
  'port coquitlam',
  'port moody',
  'richmond',
  'surrey',
  'vancouver',
  'west vancouver',
  'white rock',
];

const VANCOUVER_ISLAND_TERMS = [
  'campbell river',
  'comox',
  'cowichan',
  'duncan',
  'ladysmith',
  'nanaimo',
  'parksville',
  'port alberni',
  'saanich',
  'sidney',
  'vancouver island',
  'victoria',
];

const BC_INTERIOR_TERMS = [
  'cache creek',
  'kamloops',
  'kelowna',
  'kootenay',
  'merritt',
  'okanagan',
  'oliver',
  'osoyoos',
  'penticton',
  'prince george',
  'revelstoke',
  'salmon arm',
  'vernon',
  'williams lake',
];

const WATER_FEATURES = [
  { name: 'Fraser River - Langley', lat: 49.176, lng: -122.595, radiusMeters: 1700 },
  { name: 'Fraser River - Surrey', lat: 49.19, lng: -122.86, radiusMeters: 1700 },
  { name: 'Fraser River - Chilliwack', lat: 49.17, lng: -121.95, radiusMeters: 1900 },
  { name: 'Nicomekl River', lat: 49.104, lng: -122.657, radiusMeters: 900 },
  { name: 'Serpentine River', lat: 49.091, lng: -122.78, radiusMeters: 900 },
  { name: 'Campbell Valley wetlands', lat: 49.02, lng: -122.66, radiusMeters: 1200 },
  { name: 'Pitt River', lat: 49.243, lng: -122.69, radiusMeters: 1400 },
  { name: 'Burrard Inlet', lat: 49.294, lng: -123.05, radiusMeters: 1700 },
  { name: 'Okanagan Lake', lat: 49.88, lng: -119.52, radiusMeters: 2200 },
  { name: 'Shuswap Lake', lat: 50.92, lng: -119.33, radiusMeters: 2400 },
  { name: 'Cowichan River', lat: 48.76, lng: -123.7, radiusMeters: 1400 },
  { name: 'Nanaimo River', lat: 49.08, lng: -123.87, radiusMeters: 1300 },
];

const numberFormatter = new Intl.NumberFormat('en-CA', {
  maximumFractionDigits: 0,
});

const coordinateFormatter = new Intl.NumberFormat('en-CA', {
  maximumFractionDigits: 5,
});

const percentFormatter = new Intl.NumberFormat('en-CA', {
  maximumFractionDigits: 1,
});

const loadGoogleMapsApi = (apiKey) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps is not available.'));
  }

  if (window.google?.maps?.Map) {
    return Promise.resolve(window.google);
  }

  if (googleMapsApiPromise) {
    return googleMapsApiPromise;
  }

  googleMapsApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google), {
        once: true,
      });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Unable to load Google Maps.')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=geometry`;

    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Unable to load Google Maps.'));

    document.head.appendChild(script);
  });

  return googleMapsApiPromise;
};

const safeText = (value) => String(value || '').trim().toLowerCase();

const hasAny = (text, terms) => terms.some((term) => text.includes(term));

const isAdvisorEligible = (plant) =>
  plant[ADVISOR_FIELD] !== false && safeText(plant[ADVISOR_FIELD]) !== 'false';

const imagePath = (path) => {
  if (!path || path.includes('default.jpg')) return DEFAULT_IMAGE;
  return path.replace(/^\.?\//, '/');
};

const handleImageError = (event) => {
  if (event.currentTarget.src.endsWith(DEFAULT_IMAGE)) return;

  event.currentTarget.src = DEFAULT_IMAGE;
};

const plantKey = (plant) => String(plant.slug || plant.id || plant.Name);

const plantSiteText = (plant) =>
  safeText(
    [
      plant.Sun,
      plant.Soil,
      plant.Moisture,
      plant.SunMoisture,
      plant.Slope,
      plant.Irrigation,
      plant.Uses,
      plant.RestorationValue,
      plant.Description,
      plant.MatureSize,
    ].join(' '),
  );

const addReason = (reasons, reason) => {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
};

const normalizeAddress = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const addressSearchCandidates = (value) => {
  const normalized = normalizeAddress(value);
  const lower = normalized.toLowerCase();
  const candidates = [normalized];

  if (!lower.includes('british columbia') && !/\bbc\b/.test(lower)) {
    candidates.push(`${normalized}, British Columbia`);
  }

  if (!lower.includes('canada')) {
    candidates.push(`${normalized}, Canada`);

    if (!lower.includes('british columbia') && !/\bbc\b/.test(lower)) {
      candidates.push(`${normalized}, British Columbia, Canada`);
    }
  }

  return [...new Set(candidates)];
};

const geocoderStatusMessage = (status) => {
  if (status === 'REQUEST_DENIED') {
    return 'Google Maps denied the address request. Check the API key, billing, and enabled Maps JavaScript/Geocoding APIs.';
  }

  if (status === 'OVER_QUERY_LIMIT') {
    return 'Google Maps address lookup limit was reached. Please try again later.';
  }

  if (status === 'INVALID_REQUEST') {
    return 'Enter a complete address, city, or postal code.';
  }

  if (status === 'OUTSIDE_BC') {
    return 'Enter an address in British Columbia, Canada.';
  }

  return 'Address was not found. Try adding city, province, and postal code.';
};

const geocodeCandidate = (geocoder, request) =>
  new Promise((resolve) => {
    geocoder.geocode(request, (results, status) => {
      resolve({ results, status });
    });
  });

const addressComponent = (result, type) =>
  result?.address_components?.find((component) => component.types.includes(type));

const isBritishColumbiaAddress = (result) => {
  const province = addressComponent(result, 'administrative_area_level_1');
  const country = addressComponent(result, 'country');
  const provinceText = safeText([province?.short_name, province?.long_name].join(' '));

  return (
    safeText(country?.short_name) === 'ca' &&
    (provinceText.includes('bc') || provinceText.includes('british columbia'))
  );
};

const findAddressResult = async (geocoder, addressValue) => {
  let lastStatus = 'ZERO_RESULTS';

  for (const candidate of addressSearchCandidates(addressValue)) {
    const { results, status } = await geocodeCandidate(geocoder, {
      address: candidate,
      componentRestrictions: {
        administrativeArea: 'BC',
        country: 'CA',
      },
      region: 'ca',
    });

    lastStatus = status;

    if (status === 'OK' && results?.length) {
      const britishColumbiaResult = results.find(isBritishColumbiaAddress);

      if (britishColumbiaResult) {
        return { result: britishColumbiaResult, status };
      }

      lastStatus = 'OUTSIDE_BC';
      continue;
    }

    if (status !== 'ZERO_RESULTS') {
      break;
    }
  }

  return { result: null, status: lastStatus };
};

const reverseGeocodeLocation = (geocoder, location) =>
  new Promise((resolve) => {
    if (!geocoder) {
      resolve(null);
      return;
    }

    geocoder.geocode({ location }, (results, status) => {
      resolve(status === 'OK' && results?.[0] ? results[0] : null);
    });
  });

const describeAddressResult = (result) =>
  [
    result?.formatted_address,
    ...(result?.address_components || []).flatMap((component) => [
      component.long_name,
      component.short_name,
    ]),
  ]
    .filter(Boolean)
    .join(' ');

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const toDegrees = (radians) => (radians * 180) / Math.PI;

const distanceBetweenPoints = (start, end) => {
  const earthRadiusMeters = 6371000;
  const latDelta = toRadians(end.lat - start.lat);
  const lngDelta = toRadians(end.lng - start.lng);
  const startLat = toRadians(start.lat);
  const endLat = toRadians(end.lat);
  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDelta / 2) ** 2;

  return (
    earthRadiusMeters *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(Math.max(1 - haversine, 0)))
  );
};

const offsetCoordinate = (origin, distanceMeters, bearingDegrees) => {
  const earthRadiusMeters = 6378137;
  const angularDistance = distanceMeters / earthRadiusMeters;
  const bearing = toRadians(bearingDegrees);
  const lat1 = toRadians(origin.lat);
  const lng1 = toRadians(origin.lng);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    lat: toDegrees(lat2),
    lng: toDegrees(lng2),
  };
};

const getElevationProfile = (google, location) =>
  new Promise((resolve) => {
    if (!google?.maps?.ElevationService) {
      resolve(null);
      return;
    }

    const samplePoints = [
      location,
      offsetCoordinate(location, ELEVATION_SAMPLE_DISTANCE_METERS, 0),
      offsetCoordinate(location, ELEVATION_SAMPLE_DISTANCE_METERS, 45),
      offsetCoordinate(location, ELEVATION_SAMPLE_DISTANCE_METERS, 90),
      offsetCoordinate(location, ELEVATION_SAMPLE_DISTANCE_METERS, 135),
      offsetCoordinate(location, ELEVATION_SAMPLE_DISTANCE_METERS, 180),
      offsetCoordinate(location, ELEVATION_SAMPLE_DISTANCE_METERS, 225),
      offsetCoordinate(location, ELEVATION_SAMPLE_DISTANCE_METERS, 270),
      offsetCoordinate(location, ELEVATION_SAMPLE_DISTANCE_METERS, 315),
    ];
    const elevationService = new google.maps.ElevationService();

    elevationService.getElevationForLocations(
      {
        locations: samplePoints.map((point) => new google.maps.LatLng(point.lat, point.lng)),
      },
      (results, status) => {
        if (status !== 'OK' || !results?.length) {
          resolve(null);
          return;
        }

        const elevations = results
          .map((result) => result.elevation)
          .filter((elevation) => Number.isFinite(elevation));

        if (!elevations.length) {
          resolve(null);
          return;
        }

        const elevationMeters = elevations[0];
        const elevationChangeMeters = Math.max(...elevations) - Math.min(...elevations);
        const slopePercent =
          (elevationChangeMeters / (ELEVATION_SAMPLE_DISTANCE_METERS * 2)) * 100;

        resolve({
          elevationChangeMeters,
          elevationMeters,
          slopePercent,
        });
      },
    );
  });

const inferRegionClimate = (location, addressText) => {
  const text = safeText(addressText);

  if (
    hasAny(text, VANCOUVER_ISLAND_TERMS) ||
    (location.lat >= 48 &&
      location.lat <= 51 &&
      location.lng >= -126.5 &&
      location.lng <= -123)
  ) {
    return 'vancouver-island';
  }

  if (
    hasAny(text, LOWER_MAINLAND_TERMS) ||
    (location.lat >= 48.6 &&
      location.lat <= 50.6 &&
      location.lng >= -123.8 &&
      location.lng <= -121)
  ) {
    return 'lower-mainland';
  }

  if (
    hasAny(text, BC_INTERIOR_TERMS) ||
    location.lng > -121 ||
    (location.lat > 50.5 && location.lng > -123.5)
  ) {
    return 'bc-interior';
  }

  return 'coastal';
};

const getNearbyWaterProfile = (location, addressText) => {
  const text = safeText(addressText);
  const nearestFeature = WATER_FEATURES.map((feature) => ({
    ...feature,
    distanceMeters: distanceBetweenPoints(location, feature),
  })).sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
  const hasWaterContext = hasAny(text, WATER_CONTEXT_TERMS);
  const isNearKnownWater =
    nearestFeature && nearestFeature.distanceMeters <= nearestFeature.radiusMeters;
  const isBroadWaterContext =
    nearestFeature && nearestFeature.distanceMeters <= nearestFeature.radiusMeters * 1.8;
  const isNear = hasWaterContext || isNearKnownWater;
  const label = isNear
    ? nearestFeature?.name || 'Mapped water context'
    : isBroadWaterContext
      ? `${nearestFeature.name} nearby`
      : 'No mapped water nearby';
  const detail =
    nearestFeature && Number.isFinite(nearestFeature.distanceMeters)
      ? `${numberFormatter.format(nearestFeature.distanceMeters)} m`
      : 'Context only';

  return {
    detail,
    isBroadWaterContext,
    isNear,
    label,
    nearestFeature,
  };
};

const vegetationLabel = (score) => {
  if (score >= 68) return 'High';
  if (score >= 42) return 'Moderate';
  return 'Low';
};

const inferVegetationDensity = ({ addressText, location, nearbyWater, regionClimate }) => {
  const text = safeText(addressText);
  let score = 48;

  if (hasAny(text, DENSE_VEGETATION_TERMS)) score += 26;
  if (hasAny(text, LOW_VEGETATION_TERMS)) score -= 24;
  if (nearbyWater.isNear) score += 12;
  if (nearbyWater.isBroadWaterContext) score += 6;
  if (regionClimate === 'coastal' || regionClimate === 'vancouver-island') score += 8;
  if (regionClimate === 'bc-interior') score -= 8;
  if (location.lat > 50.6 && regionClimate !== 'bc-interior') score += 5;

  const boundedScore = Math.max(18, Math.min(88, score));

  return {
    label: vegetationLabel(boundedScore),
    score: boundedScore,
  };
};

const inferSlopeProfile = ({ elevationProfile, nearbyWater }) => {
  const slopePercent = elevationProfile?.slopePercent || 0;
  const elevationChangeMeters = elevationProfile?.elevationChangeMeters || 0;

  if (nearbyWater.isNear) {
    return {
      key: 'riparian',
      label: 'Riparian/bank',
      summary: 'Water-adjacent planting',
    };
  }

  if (
    slopePercent >= SLOPE_EROSION_PERCENT ||
    (elevationChangeMeters >= 5 && slopePercent >= 5)
  ) {
    return {
      key: 'erosion',
      label: 'Slope/erosion',
      summary: `${percentFormatter.format(slopePercent)}% grade`,
    };
  }

  if (slopePercent >= 3) {
    return {
      key: 'flat',
      label: 'Gentle slope',
      summary: `${percentFormatter.format(slopePercent)}% grade`,
    };
  }

  return {
    key: 'flat',
    label: 'Flat',
    summary: slopePercent ? `${percentFormatter.format(slopePercent)}% grade` : 'Low grade',
  };
};

const inferSunExposure = ({ addressText, slopeProfile, vegetationDensity }) => {
  const text = safeText(addressText);

  if (vegetationDensity.score >= 76 || hasAny(text, ['forest', 'ravine', 'woodland'])) {
    return {
      key: 'shade',
      label: 'Shade',
      summary: 'Canopy influence likely',
    };
  }

  if (vegetationDensity.score >= 56 || slopeProfile.key === 'riparian') {
    return {
      key: 'part-shade',
      label: 'Part shade',
      summary: 'Mixed canopy/open exposure',
    };
  }

  return {
    key: 'full-sun',
    label: 'Full sun',
    summary: 'Open exposure likely',
  };
};

const inferMoisture = ({ nearbyWater, regionClimate, slopeProfile, sunExposure, vegetationDensity }) => {
  if (slopeProfile.key === 'riparian' || nearbyWater.isNear) {
    return 'wet';
  }

  if (
    vegetationDensity.score >= 64 ||
    regionClimate === 'coastal' ||
    regionClimate === 'vancouver-island'
  ) {
    return 'moist';
  }

  if (
    slopeProfile.key === 'erosion' ||
    regionClimate === 'bc-interior' ||
    sunExposure.key === 'full-sun'
  ) {
    return 'dry';
  }

  return 'average';
};

const inferSoil = ({ moisture, regionClimate, slopeProfile }) => {
  if (moisture === 'wet') return 'clay';
  if (slopeProfile.key === 'erosion' || moisture === 'dry') return 'sandy';
  if (regionClimate === 'lower-mainland') return 'clay';
  return 'well-drained';
};

const conditionLabel = (name, value) => {
  const labels = {
    sunlight: {
      'full-sun': 'Full sun',
      'part-shade': 'Part shade',
      shade: 'Shade',
    },
    moisture: {
      average: 'Average',
      dry: 'Dry',
      moist: 'Moist',
      wet: 'Wet',
    },
    soil: {
      clay: 'Clay/heavy',
      sandy: 'Sandy/light',
      'well-drained': 'Well-drained',
    },
  };

  return labels[name]?.[value] || value;
};

const buildAnalysisProfile = async ({ geocoder, google, location }) => {
  const [addressResult, elevationProfile] = await Promise.all([
    reverseGeocodeLocation(geocoder, location),
    getElevationProfile(google, location),
  ]);
  const addressText = describeAddressResult(addressResult);
  const regionClimate = inferRegionClimate(location, addressText);
  const nearbyWater = getNearbyWaterProfile(location, addressText);
  const vegetationDensity = inferVegetationDensity({
    addressText,
    location,
    nearbyWater,
    regionClimate,
  });
  const slopeProfile = inferSlopeProfile({ elevationProfile, nearbyWater });
  const sunExposure = inferSunExposure({
    addressText,
    slopeProfile,
    vegetationDensity,
  });
  const moisture = inferMoisture({
    nearbyWater,
    regionClimate,
    slopeProfile,
    sunExposure,
    vegetationDensity,
  });
  const soil = inferSoil({ moisture, regionClimate, slopeProfile });

  return {
    address: addressResult?.formatted_address || '',
    conditions: {
      irrigation: moisture === 'dry' ? 'none' : moisture === 'wet' ? 'regular' : 'moderate',
      moisture,
      regionClimate,
      slope: slopeProfile.key,
      soil,
      sunlight: sunExposure.key,
    },
    elevationProfile,
    location,
    nearbyWater,
    regionClimate,
    slopeProfile,
    sunExposure,
    vegetationDensity,
  };
};

const matchesRegion = (plant, regionClimate) => {
  const regionLabel = REGION_FILTER_LABELS[regionClimate];

  if (!regionLabel) return true;

  return safeText(plant.Region) === safeText(regionLabel);
};

const scorePlantForAnalysis = (plant, analysis) => {
  const type = safeText(plant.Type);
  const restorationValue = safeText(plant.RestorationValue);
  const siteText = plantSiteText(plant);
  const conditions = analysis.conditions;
  const reasons = [];
  let score = 0;

  if (restorationValue.includes('high')) {
    score += 3;
    addReason(reasons, 'High restoration value');
  }

  if (matchesRegion(plant, conditions.regionClimate)) {
    score += 4;
    addReason(reasons, REGION_FILTER_LABELS[conditions.regionClimate] || 'Regional fit');
  } else {
    score -= 2;
  }

  if (conditions.sunlight === 'full-sun') {
    if (siteText.includes('full sun')) {
      score += 4;
      addReason(reasons, 'Sun exposure fit');
    } else if (siteText.includes('shade')) {
      score -= 2;
    }
  }

  if (conditions.sunlight === 'part-shade') {
    if (hasAny(siteText, ['part shade', 'partial shade'])) {
      score += 4;
      addReason(reasons, 'Part shade fit');
    } else if (siteText.includes('shade') || siteText.includes('full sun')) {
      score += 1;
    }
  }

  if (conditions.sunlight === 'shade') {
    if (siteText.includes('shade')) {
      score += 4;
      addReason(reasons, 'Shade tolerance');
    } else if (siteText.includes('full sun')) {
      score -= 2;
    }
  }

  if (conditions.moisture === 'wet') {
    if (hasAny(siteText, ['wet', 'riparian', 'moist'])) {
      score += 5;
      addReason(reasons, 'Wet site fit');
    } else {
      score -= 2;
    }
  }

  if (conditions.moisture === 'moist') {
    if (siteText.includes('moist')) {
      score += 4;
      addReason(reasons, 'Moist site fit');
    }
  }

  if (conditions.moisture === 'dry') {
    if (hasAny(siteText, ['dry', 'drought', 'well-drained'])) {
      score += 4;
      addReason(reasons, 'Dry site fit');
    } else if (hasAny(siteText, ['wet', 'riparian'])) {
      score -= 2;
    }
  }

  if (conditions.moisture === 'average') {
    if (hasAny(siteText, ['average', 'adaptable', 'well-drained'])) {
      score += 3;
      addReason(reasons, 'Average moisture fit');
    }
  }

  if (conditions.soil === 'clay' && hasAny(siteText, ['clay', 'heavy', 'moist', 'wet'])) {
    score += 2;
    addReason(reasons, 'Heavy soil tolerance');
  }

  if (conditions.soil === 'sandy' && hasAny(siteText, ['sandy', 'dry', 'well-drained'])) {
    score += 2;
    addReason(reasons, 'Light soil fit');
  }

  if (conditions.soil === 'well-drained' && siteText.includes('well-drained')) {
    score += 2;
    addReason(reasons, 'Well-drained soil');
  }

  if (conditions.slope === 'riparian') {
    if (hasAny(siteText, ['riparian', 'wet', 'moist'])) {
      score += 4;
      addReason(reasons, 'Riparian fit');
    }
  }

  if (conditions.slope === 'erosion') {
    if (siteText.includes('erosion')) {
      score += 5;
      addReason(reasons, 'Erosion control');
    } else if (type.includes('shrub') || type.includes('tree')) {
      score += 2;
      addReason(reasons, 'Slope structure');
    }
  }

  if (analysis.vegetationDensity.score >= 64) {
    if (hasAny(siteText, ['wildlife', 'habitat', 'native', 'shade'])) {
      score += 2;
      addReason(reasons, 'Vegetated setting');
    }
  } else if (analysis.vegetationDensity.score <= 38) {
    if (hasAny(siteText, ['drought', 'dry', 'well-drained', 'adaptable'])) {
      score += 2;
      addReason(reasons, 'Open site resilience');
    }
  }

  if (analysis.elevationProfile?.elevationMeters >= 600) {
    if (conditions.regionClimate === 'bc-interior' || hasAny(siteText, ['dry', 'adaptable'])) {
      score += 1;
      addReason(reasons, 'Elevation tolerance');
    }
  }

  if (!reasons.length && plant.Type) {
    addReason(reasons, plant.Type);
  }

  return {
    plant,
    reasons: reasons.slice(0, 4),
    score,
  };
};

const metricValue = (value, fallback = 'Pending') => value || fallback;

const SatelliteSiteAnalysis = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const geocoderRef = useRef(null);
  const mapClickListenerRef = useRef(null);
  const dragListenerRef = useRef(null);
  const analysisRequestRef = useRef(0);
  const [address, setAddress] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('idle');
  const [mapMessage, setMapMessage] = useState('');
  const [mapStatus, setMapStatus] = useState(apiKey ? 'loading' : 'missing-key');
  const [pinLocation, setPinLocation] = useState(null);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  useEffect(() => {
    if (!apiKey) {
      setMapStatus('missing-key');
      return undefined;
    }

    let cancelled = false;
    setMapStatus('loading');

    loadGoogleMapsApi(apiKey)
      .then((google) => {
        if (cancelled || !mapContainerRef.current) return;

        const map = new google.maps.Map(mapContainerRef.current, {
          center: DEFAULT_CENTER,
          fullscreenControl: true,
          mapTypeControl: true,
          mapTypeId: 'satellite',
          minZoom: BRITISH_COLUMBIA_MIN_ZOOM,
          restriction: {
            latLngBounds: BRITISH_COLUMBIA_MAP_BOUNDS,
            strictBounds: true,
          },
          streetViewControl: false,
          zoom: 14,
        });

        const marker = new google.maps.Marker({
          draggable: true,
          map,
          title: 'Analysis pin',
          visible: false,
        });
        const circle = new google.maps.Circle({
          clickable: false,
          fillColor: '#348E38',
          fillOpacity: 0.14,
          map,
          radius: ELEVATION_SAMPLE_DISTANCE_METERS,
          strokeColor: '#0F4229',
          strokeOpacity: 0.85,
          strokeWeight: 2,
          visible: false,
        });

        mapRef.current = map;
        markerRef.current = marker;
        circleRef.current = circle;
        geocoderRef.current = new google.maps.Geocoder();
        mapClickListenerRef.current = map.addListener('click', (event) => {
          if (!event.latLng) return;

          setPinLocation({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          });
          setMapMessage('');
        });
        dragListenerRef.current = marker.addListener('dragend', (event) => {
          if (!event.latLng) return;

          setPinLocation({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          });
        });

        setMapStatus('ready');
      })
      .catch((error) => {
        if (cancelled) return;

        setMapStatus('error');
        setMapMessage(error.message || 'Unable to load Google Maps.');
      });

    return () => {
      cancelled = true;

      if (mapClickListenerRef.current) {
        mapClickListenerRef.current.remove();
        mapClickListenerRef.current = null;
      }

      if (dragListenerRef.current) {
        dragListenerRef.current.remove();
        dragListenerRef.current = null;
      }
    };
  }, [apiKey]);

  useEffect(() => {
    if (!pinLocation || !markerRef.current || !circleRef.current) return;

    markerRef.current.setPosition(pinLocation);
    markerRef.current.setVisible(true);
    circleRef.current.setCenter(pinLocation);
    circleRef.current.setVisible(true);
  }, [pinLocation]);

  useEffect(() => {
    if (!pinLocation || !mapRef.current || !geocoderRef.current) {
      setAnalysis(null);
      setAnalysisStatus('idle');
      return undefined;
    }

    const requestId = analysisRequestRef.current + 1;
    analysisRequestRef.current = requestId;
    let cancelled = false;

    setAnalysisStatus('analyzing');

    const timer = window.setTimeout(() => {
      buildAnalysisProfile({
        geocoder: geocoderRef.current,
        google: window.google,
        location: pinLocation,
      })
        .then((profile) => {
          if (cancelled || analysisRequestRef.current !== requestId) return;

          setAnalysis(profile);
          setAnalysisStatus('ready');
        })
        .catch(() => {
          if (cancelled || analysisRequestRef.current !== requestId) return;

          setAnalysisStatus('error');
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pinLocation]);

  const recommendations = useMemo(() => {
    if (!analysis) return [];

    const scoredRecommendations = plants
      .filter(isAdvisorEligible)
      .map((plant) => scorePlantForAnalysis(plant, analysis))
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.plant.Name.localeCompare(b.plant.Name) ||
          Number(a.plant.id || 0) - Number(b.plant.id || 0),
      );
    const strongRecommendations = scoredRecommendations.filter(({ score }) => score >= 7);

    return (strongRecommendations.length >= 6
      ? strongRecommendations
      : scoredRecommendations
    ).slice(0, 12);
  }, [analysis]);

  const resultCountLabel = `${recommendations.length} ${
    recommendations.length === 1 ? 'plant' : 'plants'
  }`;
  const analysisStatusLabel =
    analysisStatus === 'analyzing'
      ? 'Analyzing pin...'
      : analysisStatus === 'ready'
        ? 'Analysis ready'
        : analysisStatus === 'error'
          ? 'Analysis unavailable'
          : 'Drop a pin';
  const coordinatesLabel = pinLocation
    ? `${coordinateFormatter.format(pinLocation.lat)}, ${coordinateFormatter.format(
        pinLocation.lng,
      )}`
    : 'Pending';

  const handleAddressSearch = async (event) => {
    event.preventDefault();

    if (!normalizeAddress(address)) return;

    if (!geocoderRef.current || !mapRef.current) {
      setMapMessage('Google Maps is not ready yet.');
      return;
    }

    setMapMessage('');
    setIsSearchingAddress(true);

    try {
      const { result, status } = await findAddressResult(geocoderRef.current, address);

      if (!result) {
        setMapMessage(geocoderStatusMessage(status));
        return;
      }

      const location = {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
      };

      setPinLocation(location);
      setAddress(result.formatted_address || address);
      mapRef.current.panTo(location);
      mapRef.current.setZoom(Math.max(mapRef.current.getZoom() || 0, 17));
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const clearPin = () => {
    setPinLocation(null);
    setAnalysis(null);
    setAnalysisStatus('idle');

    if (markerRef.current) {
      markerRef.current.setVisible(false);
    }

    if (circleRef.current) {
      circleRef.current.setVisible(false);
    }
  };

  const metrics = [
    {
      icon: 'fa-mountain',
      label: 'Slope',
      value: analysis?.slopeProfile.label,
      detail: analysis?.slopeProfile.summary,
    },
    {
      icon: 'fa-seedling',
      label: 'Vegetation',
      value: analysis?.vegetationDensity.label,
      detail: analysis ? `${analysis.vegetationDensity.score}/100 density` : '',
    },
    {
      icon: 'fa-water',
      label: 'Nearby water',
      value: analysis?.nearbyWater.isNear ? 'Detected' : analysis ? 'Not detected' : '',
      detail: analysis?.nearbyWater.label,
    },
    {
      icon: 'fa-sun',
      label: 'Sun exposure',
      value: analysis?.sunExposure.label,
      detail: analysis?.sunExposure.summary,
    },
    {
      icon: 'fa-location-arrow',
      label: 'Elevation',
      value: analysis?.elevationProfile
        ? `${numberFormatter.format(analysis.elevationProfile.elevationMeters)} m`
        : '',
      detail: analysis?.elevationProfile
        ? `${numberFormatter.format(
            analysis.elevationProfile.elevationChangeMeters,
          )} m sampled change`
        : '',
    },
  ];

  return (
    <>
      <div className="container-fluid page-header py-5 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="container text-center py-5">
          <h1 className="display-3 text-white mb-4 animated slideInDown">
            Satellite-Based Site Analysis
          </h1>
        </div>
      </div>

      <div className="container-fluid plant-advisor-page satellite-analysis-page py-5">
        <section className="advisor-shell satellite-shell">
          <div className="advisor-controls">
            <div className="advisor-panel">
              <p className="advisor-eyebrow">Site Pin</p>
              <form onSubmit={handleAddressSearch}>
                <label className="form-label" htmlFor="satellite-address">
                  Project Address
                </label>
                <div className="advisor-address-row">
                  <input
                    className="form-control"
                    id="satellite-address"
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Search a BC location"
                    type="text"
                    value={address}
                  />
                  <button
                    className="btn btn-primary"
                    disabled={!apiKey || isSearchingAddress}
                    type="submit"
                  >
                    <i className="fa fa-search me-2" aria-hidden="true"></i>
                    {isSearchingAddress ? 'Finding...' : 'Find'}
                  </button>
                </div>
              </form>

              {mapMessage && <div className="advisor-status error">{mapMessage}</div>}

              {!apiKey && (
                <div className="advisor-status error">
                  Add VITE_GOOGLE_MAPS_API_KEY to enable satellite site analysis.
                </div>
              )}

              <div className="advisor-actions">
                <button
                  className="btn btn-outline-secondary"
                  disabled={!pinLocation}
                  onClick={clearPin}
                  type="button"
                >
                  <i className="fa fa-times me-2" aria-hidden="true"></i>
                  Clear
                </button>
              </div>
            </div>

            <div className="advisor-summary satellite-summary">
              <div>
                <span>Status</span>
                <strong>{analysisStatusLabel}</strong>
              </div>
              <div>
                <span>Coordinates</span>
                <strong>{coordinatesLabel}</strong>
              </div>
              <div>
                <span>Region</span>
                <strong>
                  {analysis
                    ? REGION_FILTER_LABELS[analysis.regionClimate] || 'British Columbia'
                    : 'Pending'}
                </strong>
              </div>
              <div>
                <span>Recommendations</span>
                <strong>{analysis ? resultCountLabel : 'Pending'}</strong>
              </div>
            </div>

            <div className="advisor-panel satellite-analysis-panel">
              <p className="advisor-eyebrow">Site Analysis</p>
              <div className="satellite-metric-grid">
                {metrics.map((metric) => (
                  <div className="satellite-metric-card" key={metric.label}>
                    <i className={`fa ${metric.icon}`} aria-hidden="true"></i>
                    <span>{metric.label}</span>
                    <strong>{metricValue(metric.value)}</strong>
                    <small>{metric.detail || 'Waiting for pin'}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="advisor-map-wrap satellite-map-wrap">
            <div
              className={`advisor-map satellite-map ${apiKey ? '' : 'is-disabled'}`}
              ref={mapContainerRef}
            ></div>
            {mapStatus === 'ready' && (
              <div className="advisor-map-mode">
                <strong>{pinLocation ? 'Pin selected' : 'Drop a pin'}</strong>
                <span>{pinLocation ? coordinatesLabel : 'Satellite analysis map'}</span>
              </div>
            )}
            {analysisStatus === 'analyzing' && (
              <div className="advisor-map-area">
                <span>Sampling</span>
                <strong>Analyzing</strong>
              </div>
            )}
            {mapStatus === 'loading' && apiKey && (
              <div className="advisor-map-overlay">Loading Google Maps...</div>
            )}
            {mapStatus === 'missing-key' && (
              <div className="advisor-map-overlay">Google Maps API key required.</div>
            )}
            {mapStatus === 'error' && (
              <div className="advisor-map-overlay">
                {mapMessage || 'Unable to load Google Maps.'}
              </div>
            )}
          </div>
        </section>

        <section className="advisor-results satellite-results">
          <div className="advisor-results-head">
            <div>
              <p className="advisor-eyebrow">Recommended Plants</p>
              <h2>{analysis ? 'Plants matched to this pin' : 'Drop a pin to begin'}</h2>
            </div>
            <span className="advisor-count">
              {analysis ? resultCountLabel : 'Analysis pending'}
            </span>
          </div>

          {analysis && (
            <div className="advisor-report-details satellite-report-details">
              <div className="full">
                <span>Address</span>
                <strong>{analysis.address || address || coordinatesLabel}</strong>
              </div>
              <div>
                <span>Slope</span>
                <strong>{analysis.slopeProfile.label}</strong>
              </div>
              <div>
                <span>Vegetation</span>
                <strong>{analysis.vegetationDensity.label}</strong>
              </div>
              <div>
                <span>Water</span>
                <strong>{analysis.nearbyWater.label}</strong>
              </div>
              <div>
                <span>Sun</span>
                <strong>{analysis.sunExposure.label}</strong>
              </div>
              <div>
                <span>Elevation</span>
                <strong>
                  {analysis.elevationProfile
                    ? `${numberFormatter.format(analysis.elevationProfile.elevationMeters)} m`
                    : 'Unavailable'}
                </strong>
              </div>
              <div>
                <span>Moisture</span>
                <strong>{conditionLabel('moisture', analysis.conditions.moisture)}</strong>
              </div>
              <div>
                <span>Soil</span>
                <strong>{conditionLabel('soil', analysis.conditions.soil)}</strong>
              </div>
              <div>
                <span>Exposure Filter</span>
                <strong>{conditionLabel('sunlight', analysis.conditions.sunlight)}</strong>
              </div>
            </div>
          )}

          {!analysis ? (
            <div className="advisor-empty-state">
              Select a satellite map point to generate site metrics and plant matches.
            </div>
          ) : recommendations.length ? (
            <div className="advisor-recommendation-grid">
              {recommendations.map(({ plant, reasons, score }) => (
                <article className="advisor-plant-card satellite-plant-card" key={plantKey(plant)}>
                  <img
                    alt={plant.Name}
                    loading="lazy"
                    onError={handleImageError}
                    src={imagePath(plant.Imgpath)}
                  />
                  <div className="advisor-plant-body">
                    <div className="advisor-plant-head">
                      <Link className="advisor-plant-name" to={`/plant/${plant.slug}`}>
                        {plant.Name}
                      </Link>
                      {/* <span className="satellite-score">Score {score}</span> */}
                    </div>
                    <p>{plant.CommanName}</p>
                    <div className="advisor-plant-meta">
                      <span>{plant.Type}</span>
                      {reasons.map((reason) => (
                        <span key={reason}>{reason}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="advisor-empty-state">
              No plants match this analysis. Try a nearby pin or review site conditions.
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default SatelliteSiteAnalysis;
