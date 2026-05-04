import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import plants from '../json/PlantsList.json';

const ADVISOR_FIELD = 'IsAdvisable';
const DEFAULT_CENTER = { lat: 49.1209, lng: -122.57 };
const DEFAULT_ADDRESS = '24095 65 Ave, Langley Township, BC';
const DEFAULT_IMAGE = '/images/plants/thujaplicata.jpg';
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-js-api';
const SQUARE_FEET_PER_SQUARE_METER = 10.7639;

let googleMapsApiPromise;

const DEFAULT_SITE_CONDITIONS = {
  sunlight: 'any',
  moisture: 'any',
  soil: 'any',
  regionClimate: 'any',
  slope: 'any',
  irrigation: 'any',
};

const REGION_FILTER_LABELS = {
  coastal: 'Coastal BC',
  'lower-mainland': 'Lower Mainland',
  'vancouver-island': 'Vancouver Island',
  'bc-interior': 'BC Interior',
};

const SITE_CONDITION_FIELDS = [
  {
    name: 'sunlight',
    label: 'Sunlight',
    options: [
      { value: 'any', label: 'Any sunlight' },
      { value: 'full-sun', label: 'Full sun' },
      { value: 'part-shade', label: 'Part shade' },
      { value: 'shade', label: 'Shade' },
    ],
  },
  {
    name: 'moisture',
    label: 'Moisture',
    options: [
      { value: 'any', label: 'Any moisture' },
      { value: 'dry', label: 'Dry' },
      { value: 'average', label: 'Average' },
      { value: 'moist', label: 'Moist' },
      { value: 'wet', label: 'Wet' },
    ],
  },
  {
    name: 'soil',
    label: 'Soil',
    options: [
      { value: 'any', label: 'Any soil' },
      { value: 'well-drained', label: 'Well-drained' },
      { value: 'clay', label: 'Clay/heavy' },
      { value: 'sandy', label: 'Sandy/light' },
      { value: 'poor', label: 'Poor/disturbed' },
    ],
  },
  {
    name: 'regionClimate',
    label: 'Region',
    options: [
      { value: 'any', label: 'Any region' },
      { value: 'coastal', label: 'Coastal BC' },
      { value: 'lower-mainland', label: 'Lower Mainland' },
      { value: 'vancouver-island', label: 'Vancouver Island' },
      { value: 'bc-interior', label: 'BC Interior' },
     
    ],
  },
  {
    name: 'slope',
    label: 'Slope',
    options: [
      { value: 'any', label: 'Any slope' },
      { value: 'flat', label: 'Flat' },
      { value: 'erosion', label: 'Slope/erosion' },
      { value: 'riparian', label: 'Riparian/bank' },
    ],
  },
  {
    name: 'irrigation',
    label: 'Irrigation',
    options: [
      { value: 'any', label: 'Any irrigation' },
      { value: 'none', label: 'Low/no irrigation' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'regular', label: 'Regular' },
    ],
  },
];

const GOAL_FIELD = {
  name: 'projectGoal',
  label: 'Goal',
  options: [
    { value: 'any', label: 'Any goal' },
    { value: 'restoration', label: 'Restoration' },
    { value: 'wildlife', label: 'Wildlife habitat' },
    { value: 'screening', label: 'Screening/privacy' },
    { value: 'ornamental', label: 'Ornamental' },
    { value: 'groundcover', label: 'Groundcover' },
  ],
};

const SORT_OPTIONS = [
  { value: 'best', label: 'Best match' },
  { value: 'name', label: 'A-Z' },
  { value: 'height', label: 'Height' },
  { value: 'region', label: 'Region' },
];

const PLANT_SIZE_OPTIONS = [
  '50 plug',
  '10 cm',
  '1 gal',
  '2 gal',
  '3 gal',
  '5 gal',
  '7 gal',
  '10 gal',
  'BnB',
  'Live Stakes',
];

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

const isAdvisorEligible = (plant) =>
  plant[ADVISOR_FIELD] !== false && safeText(plant[ADVISOR_FIELD]) !== 'false';

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

  if (status === 'UNKNOWN_ERROR') {
    return 'Google Maps had a temporary address lookup error. Please try again.';
  }

  return 'Address was not found. Try adding city, province, and postal code.';
};

const geocodeCandidate = (geocoder, request) =>
  new Promise((resolve) => {
    geocoder.geocode(request, (results, status) => {
      resolve({ results, status });
    });
  });

const findAddressResult = async (geocoder, addressValue) => {
  let lastStatus = 'ZERO_RESULTS';

  for (const candidate of addressSearchCandidates(addressValue)) {
    const { results, status } = await geocodeCandidate(geocoder, {
      address: candidate,
      componentRestrictions: { country: 'CA' },
      region: 'ca',
    });

    lastStatus = status;

    if (status === 'OK' && results?.[0]) {
      return { result: results[0], status };
    }

    if (status !== 'ZERO_RESULTS') {
      break;
    }
  }

  return { result: null, status: lastStatus };
};

const imagePath = (path) => {
  if (!path || path.includes('default.jpg')) return DEFAULT_IMAGE;
  return path.replace(/^\.?\//, '/');
};

const parseMatureHeight = (matureSize) => {
  const match = String(matureSize || '').match(
    /(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*ft\s*tall/i,
  );

  if (!match) return null;

  return Number(match[2] || match[1]);
};

const numberFormatter = new Intl.NumberFormat('en-CA', {
  maximumFractionDigits: 0,
});

const getAreaProfile = (squareFeet) => {
  if (squareFeet < 600) {
    return { key: 'compact', label: 'Compact' };
  }

  if (squareFeet < 2500) {
    return { key: 'standard', label: 'Standard' };
  }

  return { key: 'large', label: 'Large' };
};

const addReason = (reasons, reason) => {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
};

const hasAny = (text, terms) => terms.some((term) => text.includes(term));

const isTrueFlag = (value) => value === true || safeText(value) === 'true';

const isOrnamentalPlant = (plant) => isTrueFlag(plant.IsOrnamental);

const plantKey = (plant) => String(plant.slug || plant.id || plant.Name);

const plantSunText = (plant) => safeText([plant.Sun, plant.SunMoisture].join(' '));

const plantSoilText = (plant) => safeText([plant.Soil, plant.SunMoisture].join(' '));

const plantMoistureText = (plant) =>
  safeText([plant.Moisture, plant.SunMoisture].join(' '));

const plantConditionText = (plant) =>
  safeText([plant.Sun, plant.Soil, plant.Moisture, plant.SunMoisture].join(' '));

const plantSiteText = (plant) =>
  safeText(
    [
      plant.Sun,
      plant.SunMoisture,
      plant.Soil,
      plant.Moisture,
      plant.Uses,
      plant.RestorationValue,
      plant.Description,
      plant.MatureSize,
    ].join(' '),
  );

const plantRegionText = (plant) => safeText(plant.Region);

const matchesRegionFilter = (plant, regionFilter) => {
  if (!regionFilter || regionFilter === 'any') {
    return true;
  }

  const regionLabel = REGION_FILTER_LABELS[regionFilter];

  if (!regionLabel) {
    return true;
  }

  return plantRegionText(plant) === safeText(regionLabel);
};

const optionLabel = (field, value) =>
  field?.options.find((option) => option.value === value)?.label || value;

const normalizeGoal = (value) => safeText(value) || 'any';

const goalMatchesPlant = (plant, goal) => {
  const activeGoal = normalizeGoal(goal);
  const type = safeText(plant.Type);
  const restorationValue = safeText(plant.RestorationValue);
  const siteText = plantSiteText(plant);

  if (activeGoal === 'any') {
    return true;
  }

  if (activeGoal === 'ornamental') {
    return isOrnamentalPlant(plant);
  }

  if (activeGoal === 'restoration') {
    return (
      restorationValue.includes('high') ||
      hasAny(siteText, ['restoration', 'native species'])
    );
  }

  if (activeGoal === 'wildlife') {
    return hasAny(siteText, ['wildlife', 'habitat', 'birds', 'food source']);
  }

  if (activeGoal === 'screening') {
    return (
      hasAny(siteText, ['evergreen', 'shelter']) ||
      hasAny(siteText, ['screen', 'privacy', 'hedge'])
    );
  }

  if (activeGoal === 'groundcover') {
    return type.includes('perennial') || siteText.includes('groundcover');
  }

  return true;
};

const sortRecommendations = (recommendations, sortBy) =>
  [...recommendations].sort((a, b) => {
    if (sortBy === 'name') {
      return a.plant.Name.localeCompare(b.plant.Name);
    }

    if (sortBy === 'height') {
      const aHeight = parseMatureHeight(a.plant.MatureSize) ?? Number.POSITIVE_INFINITY;
      const bHeight = parseMatureHeight(b.plant.MatureSize) ?? Number.POSITIVE_INFINITY;

      return aHeight - bHeight || a.plant.Name.localeCompare(b.plant.Name);
    }

    if (sortBy === 'region') {
      return (
        String(a.plant.Region || '').localeCompare(String(b.plant.Region || '')) ||
        a.plant.Name.localeCompare(b.plant.Name)
      );
    }

    return (
      b.score - a.score ||
      a.plant.Name.localeCompare(b.plant.Name) ||
      Number(a.plant.id || 0) - Number(b.plant.id || 0)
    );
  });

const matchesSiteConditions = (plant, conditions) => {
  const type = safeText(plant.Type);
  const restorationValue = safeText(plant.RestorationValue);
  const uses = safeText(plant.Uses);
  const sunText = plantSunText(plant);
  const soilText = plantSoilText(plant);
  const moistureText = plantMoistureText(plant);
  const conditionText = plantConditionText(plant);
  const siteText = plantSiteText(plant);

  const hasFullSun = sunText.includes('full sun');
  const hasPartShade = hasAny(sunText, ['part shade', 'partial shade']);
  const hasShade =
    hasAny(sunText, ['to shade', 'shade to']) ||
    /^shade\b/.test(sunText) ||
    /,\s*shade\b/.test(sunText);

  if (conditions.sunlight === 'full-sun' && !hasFullSun) {
    return false;
  }

  if (conditions.sunlight === 'part-shade' && !hasPartShade) {
    return false;
  }

  if (conditions.sunlight === 'shade' && !hasShade) {
    return false;
  }

  if (conditions.moisture === 'dry' && !hasAny(moistureText, ['dry', 'drought'])) {
    return false;
  }

  if (
    conditions.moisture === 'average' &&
    !hasAny(moistureText, ['average', 'moderate']) &&
    !hasAny(soilText, ['well-drained', 'adaptable'])
  ) {
    return false;
  }

  if (conditions.moisture === 'moist' && !moistureText.includes('moist')) {
    return false;
  }

  if (conditions.moisture === 'wet' && !hasAny(moistureText, ['wet', 'riparian'])) {
    return false;
  }

  if (conditions.soil === 'well-drained' && !soilText.includes('well-drained')) {
    return false;
  }

  if (
    conditions.soil === 'clay' &&
    !hasAny(soilText, ['clay', 'heavy', 'adaptable']) &&
    !hasAny(moistureText, ['moist', 'wet'])
  ) {
    return false;
  }

  if (
    conditions.soil === 'sandy' &&
    !hasAny(soilText, ['sandy', 'light', 'well-drained']) &&
    !hasAny(moistureText, ['dry'])
  ) {
    return false;
  }

  if (
    conditions.soil === 'poor' &&
    !hasAny(soilText, ['adaptable', 'poor', 'disturbed']) &&
    !hasAny(siteText, ['restoration', 'native'])
  ) {
    return false;
  }

  if (!matchesRegionFilter(plant, conditions.regionClimate)) {
    return false;
  }

  if (
    conditions.regionClimate === 'urban' &&
    !hasAny(conditionText, ['adaptable', 'well-drained']) &&
    !hasAny(siteText, ['street', 'urban', 'drought'])
  ) {
    return false;
  }

  if (
    conditions.slope === 'erosion' &&
    !siteText.includes('erosion') &&
    !hasAny(siteText, ['colonizer', 'riparian', 'bank stabilization'])
  ) {
    return false;
  }

  if (
    conditions.slope === 'riparian' &&
    !hasAny(siteText, ['riparian']) &&
    !hasAny(conditionText, ['wet', 'moist'])
  ) {
    return false;
  }

  if (
    conditions.irrigation === 'none' &&
    !hasAny(conditionText, ['dry', 'drought', 'adaptable'])
  ) {
    return false;
  }

  if (
    conditions.irrigation === 'occasional' &&
    !hasAny(conditionText, ['adaptable', 'average', 'well-drained'])
  ) {
    return false;
  }

  if (
    conditions.irrigation === 'regular' &&
    !hasAny(conditionText, ['moist', 'wet'])
  ) {
    return false;
  }

  if (
    conditions.projectGoal === 'restoration' &&
    !restorationValue.includes('high') &&
    !hasAny(siteText, ['restoration', 'native species'])
  ) {
    return false;
  }

  if (
    conditions.projectGoal === 'wildlife' &&
    !hasAny(siteText, ['wildlife', 'habitat', 'birds', 'food source'])
  ) {
    return false;
  }

  if (
    conditions.projectGoal === 'screening' &&
    !hasAny(siteText, ['evergreen', 'shelter']) &&
    !hasAny(siteText, ['screen', 'privacy', 'hedge'])
  ) {
    return false;
  }

  if (conditions.projectGoal === 'ornamental' && !isOrnamentalPlant(plant)) {
    return false;
  }

  if (
    conditions.projectGoal === 'groundcover' &&
    !type.includes('perennial') &&
    !siteText.includes('groundcover')
  ) {
    return false;
  }

  if (conditions.projectGoal !== 'any' && !uses && !siteText) {
    return false;
  }

  return true;
};

const scorePlant = (plant, profile, conditions) => {
  const type = safeText(plant.Type);
  const restorationValue = safeText(plant.RestorationValue);
  const uses = safeText(plant.Uses);
  const siteText = plantSiteText(plant);
  const matureHeight = parseMatureHeight(plant.MatureSize);
  const reasons = [];
  let score = 0;

  if (restorationValue.includes('high')) {
    score += 3;
    addReason(reasons, 'High restoration value');
  } else if (restorationValue.includes('medium')) {
    score += 1;
  }

  if (uses.includes('restoration')) {
    score += 1;
    addReason(reasons, 'Restoration use');
  }

  if (conditions.sunlight === 'full-sun') {
    if (siteText.includes('full sun')) {
      score += 3;
      addReason(reasons, 'Full sun match');
    } else if (siteText.includes('shade')) {
      score -= 1;
    }
  }

  if (conditions.sunlight === 'part-shade') {
    if (hasAny(siteText, ['part shade', 'partial shade'])) {
      score += 3;
      addReason(reasons, 'Part shade match');
    } else if (siteText.includes('shade')) {
      score += 1;
    }
  }

  if (conditions.sunlight === 'shade') {
    if (siteText.includes('shade')) {
      score += 3;
      addReason(reasons, 'Shade match');
    } else if (siteText.includes('full sun')) {
      score -= 2;
    }
  }

  if (conditions.moisture === 'dry') {
    if (hasAny(siteText, ['dry', 'drought'])) {
      score += 3;
      addReason(reasons, 'Dry site match');
    } else if (siteText.includes('well-drained')) {
      score += 1;
    } else if (siteText.includes('wet')) {
      score -= 1;
    }
  }

  if (conditions.moisture === 'average') {
    if (hasAny(siteText, ['average', 'well-drained', 'adaptable'])) {
      score += 2;
      addReason(reasons, 'Average moisture match');
    }
  }

  if (conditions.moisture === 'moist') {
    if (siteText.includes('moist')) {
      score += 3;
      addReason(reasons, 'Moist site match');
    }
  }

  if (conditions.moisture === 'wet') {
    if (hasAny(siteText, ['wet', 'riparian'])) {
      score += 3;
      addReason(reasons, 'Wet site match');
    }
  }

  if (conditions.soil === 'well-drained' && siteText.includes('well-drained')) {
    score += 2;
    addReason(reasons, 'Well-drained soil');
  }

  if (conditions.soil === 'clay' && hasAny(siteText, ['moist', 'wet', 'adaptable'])) {
    score += 1;
    addReason(reasons, 'Heavy soil tolerance');
  }

  if (conditions.soil === 'sandy' && hasAny(siteText, ['dry', 'well-drained'])) {
    score += 1;
    addReason(reasons, 'Light soil fit');
  }

  if (
    conditions.soil === 'poor' &&
    hasAny(siteText, ['adaptable', 'restoration', 'native'])
  ) {
    score += 1;
    addReason(reasons, 'Disturbed soil fit');
  }

  if (matchesRegionFilter(plant, conditions.regionClimate)) {
    const regionLabel = REGION_FILTER_LABELS[conditions.regionClimate];

    if (regionLabel) {
      score += 2;
      addReason(reasons, `${regionLabel} region`);
    }
  }

  if (conditions.regionClimate === 'urban') {
    if (hasAny(siteText, ['adaptable', 'landscaping', 'gardens', 'well-drained'])) {
      score += 1;
      addReason(reasons, 'Urban site fit');
    }
  }

  if (conditions.slope === 'erosion') {
    if (siteText.includes('erosion')) {
      score += 4;
      addReason(reasons, 'Erosion control');
    } else if (type.includes('shrub') || type.includes('tree')) {
      score += 1;
      addReason(reasons, 'Slope structure');
    }
  }

  if (conditions.slope === 'riparian') {
    if (hasAny(siteText, ['riparian', 'wet', 'moist'])) {
      score += 3;
      addReason(reasons, 'Riparian fit');
    }
  }

  if (conditions.irrigation === 'none') {
    if (hasAny(siteText, ['dry', 'drought', 'adaptable', 'native'])) {
      score += 2;
      addReason(reasons, 'Low irrigation fit');
    } else if (hasAny(siteText, ['moist', 'wet'])) {
      score -= 1;
    }
  }

  if (conditions.irrigation === 'occasional') {
    if (hasAny(siteText, ['adaptable', 'average', 'well-drained'])) {
      score += 1;
      addReason(reasons, 'Occasional irrigation fit');
    }
  }

  if (conditions.irrigation === 'regular') {
    if (hasAny(siteText, ['moist', 'wet'])) {
      score += 2;
      addReason(reasons, 'Regular irrigation fit');
    }
  }

  if (conditions.projectGoal === 'restoration') {
    if (restorationValue.includes('high')) score += 3;
    if (hasAny(siteText, ['restoration', 'native species'])) {
      score += 2;
      addReason(reasons, 'Restoration goal');
    }
  }

  if (conditions.projectGoal === 'wildlife') {
    if (hasAny(siteText, ['wildlife', 'habitat', 'birds', 'food source'])) {
      score += 3;
      addReason(reasons, 'Wildlife habitat');
    }
  }

  if (conditions.projectGoal === 'screening') {
    if (hasAny(siteText, ['evergreen', 'shelter']) || type.includes('shrub')) {
      score += 3;
      addReason(reasons, 'Screening structure');
    } else if (type.includes('tree')) {
      score += 1;
    }
  }

  if (conditions.projectGoal === 'ornamental') {
    if (isOrnamentalPlant(plant)) {
      score += 4;
      addReason(reasons, 'Ornamental selection');
    }
  }

  if (conditions.projectGoal === 'groundcover') {
    if (type.includes('perennial') || siteText.includes('groundcover')) {
      score += 3;
      addReason(reasons, 'Groundcover layer');
    }
  }

  if (profile.key === 'compact') {
    if (type.includes('perennial')) {
      score += 4;
      addReason(reasons, 'Compact planting fit');
    }

    if (type.includes('shrub')) {
      score += 2;
      addReason(reasons, 'Shrub scale');
    }

    if (type.includes('tree')) {
      if (matureHeight && matureHeight <= 18) {
        score += 1;
        addReason(reasons, 'Small tree fit');
      } else {
        score -= 4;
      }
    }

    if (matureHeight && matureHeight <= 6) {
      score += 2;
      addReason(reasons, 'Low mature height');
    } else if (matureHeight && matureHeight <= 12) {
      score += 1;
    }
  }

  if (profile.key === 'standard') {
    if (type.includes('shrub')) {
      score += 3;
      addReason(reasons, 'Landscape scale');
    }

    if (type.includes('perennial')) {
      score += 2;
      addReason(reasons, 'Layered planting');
    }

    if (type.includes('tree') && (!matureHeight || matureHeight <= 35)) {
      score += 2;
      addReason(reasons, 'Moderate canopy fit');
    }
  }

  if (profile.key === 'large') {
    if (type.includes('tree')) {
      score += 3;
      addReason(reasons, 'Canopy fit');
    }

    if (type.includes('shrub')) {
      score += 2;
      addReason(reasons, 'Mass planting fit');
    }

    if (type.includes('perennial')) {
      score += 1;
    }
  }

  if (!reasons.length && plant.Type) {
    addReason(reasons, plant.Type);
  }

  return {
    reasons: reasons.slice(0, 4),
    score,
  };
};

const PlantAdvisor = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polygonRef = useRef(null);
  const pointMarkersRef = useRef([]);
  const geocoderRef = useRef(null);
  const mapClickListenerRef = useRef(null);
  const isDrawingBoundaryRef = useRef(false);
  const [address, setAddress] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  const [areaSquareMeters, setAreaSquareMeters] = useState(0);
  const [mapStatus, setMapStatus] = useState(apiKey ? 'loading' : 'missing-key');
  const [mapMessage, setMapMessage] = useState('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false);
  const [siteConditions, setSiteConditions] = useState(DEFAULT_SITE_CONDITIONS);
  const [selectedGoal, setSelectedGoal] = useState('any');
  const [sortBy, setSortBy] = useState('best');
  const [selectedPlantKeys, setSelectedPlantKeys] = useState([]);
  const [selectedPlantQuantities, setSelectedPlantQuantities] = useState({});
  const [selectedPlantSizes, setSelectedPlantSizes] = useState({});
  const [isExportingSelected, setIsExportingSelected] = useState(false);

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
          streetViewControl: false,
          zoom: 13,
        });

        mapRef.current = map;
        geocoderRef.current = new google.maps.Geocoder();
        markerRef.current = new google.maps.Marker({ map });
        polygonRef.current = new google.maps.Polygon({
          clickable: false,
          fillColor: '#348E38',
          fillOpacity: 0.24,
          map,
          strokeColor: '#0F4229',
          strokeOpacity: 0.9,
          strokeWeight: 3,
        });
        mapClickListenerRef.current = map.addListener('click', (event) => {
          if (!isDrawingBoundaryRef.current) return;
          if (!event.latLng) return;

          setBoundaryPoints((currentPoints) => [
            ...currentPoints,
            {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            },
          ]);
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

      pointMarkersRef.current.forEach((pointMarker) => {
        window.google?.maps?.event?.clearInstanceListeners(pointMarker);
        pointMarker.setMap(null);
      });
      pointMarkersRef.current = [];
    };
  }, [apiKey]);

  useEffect(() => {
    const google = window.google;

    if (!polygonRef.current || !google?.maps) return;

    const path = boundaryPoints.map((point) => new google.maps.LatLng(point.lat, point.lng));
    polygonRef.current.setPath(path);

    pointMarkersRef.current.forEach((pointMarker) => {
      google.maps.event.clearInstanceListeners(pointMarker);
      pointMarker.setMap(null);
    });
    pointMarkersRef.current = [];

    if (mapRef.current) {
      pointMarkersRef.current = boundaryPoints.map((point, index) => {
        const pointMarker = new google.maps.Marker({
          clickable: true,
          cursor: 'pointer',
          draggable: true,
          icon: {
            fillColor: '#0F4229',
            fillOpacity: 1,
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          label: {
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '800',
            text: String(index + 1),
          },
          map: mapRef.current,
          position: point,
          title: `Boundary point ${index + 1}. Drag to move, click to remove.`,
        });

        const updatePointPosition = (event) => {
          if (!event.latLng) return;

          setBoundaryPoints((currentPoints) =>
            currentPoints.map((currentPoint, pointIndex) =>
              pointIndex === index
                ? {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng(),
                  }
                : currentPoint,
            ),
          );
        };

        pointMarker.addListener('drag', updatePointPosition);
        pointMarker.addListener('dragend', updatePointPosition);

        pointMarker.addListener('click', () => {
          setBoundaryPoints((currentPoints) =>
            currentPoints.filter((_, pointIndex) => pointIndex !== index),
          );
        });

        return pointMarker;
      });
    }

    if (path.length >= 3 && google.maps.geometry?.spherical) {
      setAreaSquareMeters(google.maps.geometry.spherical.computeArea(path));
    } else {
      setAreaSquareMeters(0);
    }
  }, [boundaryPoints]);

  useEffect(() => {
    isDrawingBoundaryRef.current = isDrawingBoundary;

    if (mapRef.current) {
      mapRef.current.setOptions({
        draggableCursor: isDrawingBoundary ? 'crosshair' : null,
      });
    }
  }, [isDrawingBoundary]);

  useEffect(() => {
    const clearExportMode = () => setIsExportingSelected(false);

    window.addEventListener('afterprint', clearExportMode);

    return () => {
      window.removeEventListener('afterprint', clearExportMode);
    };
  }, []);

  const areaSquareFeet = areaSquareMeters * SQUARE_FEET_PER_SQUARE_METER;
  const areaProfile = getAreaProfile(areaSquareFeet);
  const hasMarkedArea = boundaryPoints.length >= 3 && Boolean(areaSquareFeet);
  const mapAreaLabel = areaSquareFeet
    ? `${numberFormatter.format(areaSquareFeet)} sq ft`
    : 'Area pending';
  const mapPointLabel = `${boundaryPoints.length} ${
    boundaryPoints.length === 1 ? 'point' : 'points'
  }`;
  const drawingHint = boundaryPoints.length
    ? 'Drag numbered points to adjust. Click a point to remove it.'
    : 'Start by clicking points on the map.';
  const activeGoal = normalizeGoal(selectedGoal);
  const effectiveSiteConditions = useMemo(
    () => ({
      ...siteConditions,
      projectGoal: activeGoal,
    }),
    [activeGoal, siteConditions],
  );
  const selectedGoalLabel = optionLabel(GOAL_FIELD, activeGoal);
  const activeConditionCount = SITE_CONDITION_FIELDS.filter(
    (field) => siteConditions[field.name] !== 'any',
  ).length + (activeGoal !== 'any' ? 1 : 0);
  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (activeGoal !== 'any') {
      chips.push({ label: GOAL_FIELD.label, value: selectedGoalLabel });
    }

    SITE_CONDITION_FIELDS.forEach((field) => {
      const value = siteConditions[field.name];

      if (value !== 'any') {
        chips.push({ label: field.label, value: optionLabel(field, value) });
      }
    });

    return chips;
  }, [activeGoal, selectedGoalLabel, siteConditions]);
  const reportConditions = useMemo(
    () => [
      ...SITE_CONDITION_FIELDS.map((field) => ({
        label: field.label,
        value: optionLabel(field, siteConditions[field.name]),
      })),
      {
        label: GOAL_FIELD.label,
        value: optionLabel(GOAL_FIELD, activeGoal),
      },
    ],
    [activeGoal, siteConditions],
  );

  const visibleRecommendations = useMemo(() => {
    if (!hasMarkedArea) return [];

    return plants
      .filter(isAdvisorEligible)
      .filter((plant) => matchesSiteConditions(plant, effectiveSiteConditions))
      .map((plant) => ({
        plant,
        ...scorePlant(plant, areaProfile, effectiveSiteConditions),
      }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.plant.Name.localeCompare(b.plant.Name) ||
          a.plant.id - b.plant.id,
      );
  }, [areaProfile, effectiveSiteConditions, hasMarkedArea]);

  const renderedRecommendations = useMemo(
    () =>
      sortRecommendations(
        visibleRecommendations.filter(({ plant }) => goalMatchesPlant(plant, activeGoal)),
        sortBy,
      ),
    [activeGoal, sortBy, visibleRecommendations],
  );
  const renderedPlantKeys = useMemo(
    () => new Set(renderedRecommendations.map(({ plant }) => plantKey(plant))),
    [renderedRecommendations],
  );

  useEffect(() => {
    setSelectedPlantKeys((currentKeys) => {
      const nextKeys = currentKeys.filter((key) => renderedPlantKeys.has(key));

      return nextKeys.length === currentKeys.length ? currentKeys : nextKeys;
    });

    setSelectedPlantQuantities((currentQuantities) => {
      const nextQuantities = Object.fromEntries(
        Object.entries(currentQuantities).filter(([key]) => renderedPlantKeys.has(key)),
      );

      return Object.keys(nextQuantities).length === Object.keys(currentQuantities).length
        ? currentQuantities
        : nextQuantities;
    });

    setSelectedPlantSizes((currentSizes) => {
      const nextSizes = Object.fromEntries(
        Object.entries(currentSizes).filter(([key]) => renderedPlantKeys.has(key)),
      );

      return Object.keys(nextSizes).length === Object.keys(currentSizes).length
        ? currentSizes
        : nextSizes;
    });
  }, [renderedPlantKeys]);

  const selectedPlantKeySet = useMemo(
    () => new Set(selectedPlantKeys),
    [selectedPlantKeys],
  );
  const selectedRecommendations = renderedRecommendations.filter(({ plant }) =>
    selectedPlantKeySet.has(plantKey(plant)),
  );
  const recommendationsForDisplay = isExportingSelected
    ? selectedRecommendations
    : renderedRecommendations;

  const matchCountLabel = `${renderedRecommendations.length} ${
    renderedRecommendations.length === 1 ? 'plant' : 'plants'
  }`;
  const resultHeading =
    activeGoal === 'any'
      ? 'All matches for this area'
      : `${selectedGoalLabel} matches for this area`;
  const resultCountLabel = `${renderedRecommendations.length} matching ${
    renderedRecommendations.length === 1 ? 'plant' : 'plants'
  }`;
  const selectedCountLabel = `${selectedRecommendations.length} selected ${
    selectedRecommendations.length === 1 ? 'plant' : 'plants'
  }`;
  const displayResultHeading = isExportingSelected
    ? 'Selected plants for this area'
    : resultHeading;
  const displayCountLabel = isExportingSelected ? selectedCountLabel : resultCountLabel;
  const quantityForPlant = (plant) => selectedPlantQuantities[plantKey(plant)] || '1';
  const sizeForPlant = (plant) => selectedPlantSizes[plantKey(plant)] || PLANT_SIZE_OPTIONS[0];

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

      const location = result.geometry.location;

      mapRef.current.setCenter(location);
      mapRef.current.setZoom(18);
      markerRef.current.setPosition(location);
      setResolvedAddress(result.formatted_address);
      setBoundaryPoints([]);
      isDrawingBoundaryRef.current = false;
      setIsDrawingBoundary(false);
    } catch {
      setMapMessage('Unable to search this address right now.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const toggleCustomDrawing = () => {
    setMapMessage('');

    if (isDrawingBoundary) {
      if (boundaryPoints.length < 3) {
        setMapMessage('Add at least 3 points to finish the boundary.');
        return;
      }

      isDrawingBoundaryRef.current = false;
      setIsDrawingBoundary(false);
      return;
    }

    isDrawingBoundaryRef.current = true;
    setBoundaryPoints([]);
    setIsDrawingBoundary(true);
  };

  const undoPoint = () => {
    setBoundaryPoints((currentPoints) => currentPoints.slice(0, -1));
  };

  const clearBoundary = () => {
    setBoundaryPoints([]);
    isDrawingBoundaryRef.current = false;
    setIsDrawingBoundary(false);
  };

  const updateSiteCondition = (name, value) => {
    setSiteConditions((currentConditions) => ({
      ...currentConditions,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setSiteConditions(DEFAULT_SITE_CONDITIONS);
    setSelectedGoal('any');
    setSortBy('best');
    setSelectedPlantKeys([]);
    setSelectedPlantQuantities({});
    setSelectedPlantSizes({});
  };

  const updateSelectedGoal = (event) => {
    setSelectedGoal(normalizeGoal(event.target.value));
  };

  const updateSort = (event) => {
    setSortBy(event.target.value);
  };

  const syncSelectedGoal = (event) => {
    const select = event.currentTarget;
    window.setTimeout(() => {
      setSelectedGoal(normalizeGoal(select.value));
    }, 0);
  };

  const togglePlantSelection = (plant) => {
    const key = plantKey(plant);

    if (selectedPlantKeySet.has(key)) {
      removeSelectedPlant(plant);
      return;
    }

    setSelectedPlantKeys((currentKeys) =>
      currentKeys.includes(key) ? currentKeys : [...currentKeys, key],
    );
    setSelectedPlantQuantities((currentQuantities) => ({
      ...currentQuantities,
      [key]: currentQuantities[key] || '1',
    }));
    setSelectedPlantSizes((currentSizes) => ({
      ...currentSizes,
      [key]: currentSizes[key] || PLANT_SIZE_OPTIONS[0],
    }));
  };

  const removeSelectedPlant = (plant) => {
    const key = plantKey(plant);

    setSelectedPlantKeys((currentKeys) =>
      currentKeys.filter((currentKey) => currentKey !== key),
    );
    setSelectedPlantQuantities((currentQuantities) => {
      const { [key]: _removedQuantity, ...nextQuantities } = currentQuantities;
      return nextQuantities;
    });
    setSelectedPlantSizes((currentSizes) => {
      const { [key]: _removedSize, ...nextSizes } = currentSizes;
      return nextSizes;
    });
  };

  const updateSelectedQuantity = (plant, value) => {
    const key = plantKey(plant);

    setSelectedPlantQuantities((currentQuantities) => ({
      ...currentQuantities,
      [key]: value,
    }));
  };

  const updateSelectedSize = (plant, value) => {
    const key = plantKey(plant);

    setSelectedPlantSizes((currentSizes) => ({
      ...currentSizes,
      [key]: value,
    }));
  };

  const exportPdf = () => {
    if (!selectedRecommendations.length) {
      return;
    }

    setIsExportingSelected(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.print());
    });
  };

  return (
    <>
      <div className="container-fluid page-header py-5 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="container text-center py-5">
          <h1 className="display-3 text-white mb-4 animated slideInDown">Plant Advisor</h1>
        </div>
      </div>

      <div className="container-fluid plant-advisor-page py-5">
        <section className="advisor-shell">
          <div className="advisor-controls">
            <div className="advisor-panel">
              <p className="advisor-eyebrow">Site Address</p>
              <form onSubmit={handleAddressSearch}>
                <label className="form-label" htmlFor="advisor-address">
                  Project Address
                </label>
                <div className="advisor-address-row">
                  <input
                    className="form-control"
                    id="advisor-address"
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Enter planting location"
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

              {resolvedAddress && (
                <div className="advisor-status success">{resolvedAddress}</div>
              )}

              {mapMessage && <div className="advisor-status error">{mapMessage}</div>}

              {!apiKey && (
                <div className="advisor-status error">
                  Add VITE_GOOGLE_MAPS_API_KEY to enable address search and area marking.
                </div>
              )}

              <div className="advisor-actions">
                <button
                  className={`btn ${
                    isDrawingBoundary ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  disabled={mapStatus !== 'ready'}
                  onClick={toggleCustomDrawing}
                  type="button"
                >
                  <i className="fa fa-draw-polygon me-2" aria-hidden="true"></i>
                  {isDrawingBoundary ? 'Done Drawing' : 'Draw Areahoyhous'}
 north vancouver
                </button>
                <button
                  className="btn btn-outline-secondary"
                  disabled={!boundaryPoints.length}
                  onClick={undoPoint}
                  type="button"
                >
                  <i className="fa fa-undo me-2" aria-hidden="true"></i>
                  Undo
                </button>
                <button
                  className="btn btn-outline-secondary"
                  disabled={!boundaryPoints.length}
                  onClick={clearBoundary}
                  type="button"
                >
                  <i className="fa fa-times me-2" aria-hidden="true"></i>
                  Clear
                </button>
                {/* <a
                  className="btn btn-outline-primary"
                  href={mapSearchUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <i className="fa fa-map-marker-alt me-2" aria-hidden="true"></i>
                  Google Maps
                </a> */}
              </div>
            </div>

            <div className="advisor-panel">
              <div className="advisor-panel-head">
                <p className="advisor-eyebrow">Site Conditions</p>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={!activeConditionCount && sortBy === 'best'}
                  onClick={resetFilters}
                  type="button"
                >
                  Reset filters
                </button>
              </div>
              <div className="advisor-condition-grid">
                <div className="advisor-condition-field">
                  <label className="form-label" htmlFor="advisor-projectGoal">
                    {GOAL_FIELD.label}
                  </label>
                  <select
                    className="form-select"
                    id="advisor-projectGoal"
                    name={GOAL_FIELD.name}
                    onBlur={syncSelectedGoal}
                    onChange={updateSelectedGoal}
                    onClick={syncSelectedGoal}
                    onInput={updateSelectedGoal}
                    onKeyUp={syncSelectedGoal}
                    value={activeGoal}
                  >
                    {GOAL_FIELD.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {SITE_CONDITION_FIELDS.map((field) => (
                  <div className="advisor-condition-field" key={field.name}>
                    <label className="form-label" htmlFor={`advisor-${field.name}`}>
                      {field.label}
                    </label>
                    <select
                      className="form-select"
                      id={`advisor-${field.name}`}
                      name={field.name}
                      onChange={(event) =>
                        updateSiteCondition(field.name, event.target.value)
                      }
                      value={siteConditions[field.name]}
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="advisor-filter-chips" aria-label="Active filters">
                {activeFilterChips.length ? (
                  activeFilterChips.map((chip) => (
                    <span key={`${chip.label}-${chip.value}`}>
                      {chip.label}: {chip.value}
                    </span>
                  ))
                ) : (
                  <span className="muted">Default filters</span>
                )}
              </div>
            </div>

            <div className="advisor-summary">
              <div>
                <span>Boundary</span>
                <strong>{boundaryPoints.length} points</strong>
              </div>
              <div>
                <span>Area</span>
                <strong>
                  {areaSquareFeet
                    ? `${numberFormatter.format(areaSquareFeet)} sq ft`
                    : 'Pending'}
                </strong>
              </div>
              <div>
                <span>Profile</span>
                <strong>{areaSquareFeet ? areaProfile.label : 'Pending'}</strong>
              </div>
              <div>
                <span>Matches</span>
                <strong>{hasMarkedArea ? matchCountLabel : 'Pending'}</strong>
              </div>
              <div>
                <span>Selected Goal</span>
                <strong>{selectedGoalLabel}</strong>
              </div>
            </div>
          </div>

          <div className="advisor-map-wrap">
            <div
              className={`advisor-map ${apiKey ? '' : 'is-disabled'} ${
                isDrawingBoundary ? 'is-drawing' : ''
              }`}
              ref={mapContainerRef}
            ></div>
            {isDrawingBoundary && (
              <div className="advisor-map-mode">
                <strong>Drawing custom boundary</strong>
                <span>{drawingHint}</span>
              </div>
            )}
            {mapStatus === 'ready' && (
              <div className="advisor-map-area">
                <span>{mapPointLabel}</span>
                <strong>{mapAreaLabel}</strong>
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

        <section className="advisor-results" data-active-goal={activeGoal}>
          <div className="advisor-results-head">
            <div>
              <p className="advisor-eyebrow">Recommended Plants</p>
              <h2>{displayResultHeading}</h2>
            </div>
            <div className="advisor-results-actions">
              <label className="advisor-sort-control" htmlFor="advisor-sort">
                <span>Sort</span>
                <select
                  className="form-select form-select-sm"
                  id="advisor-sort"
                  onChange={updateSort}
                  value={sortBy}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
                <span className="advisor-count">
                  {hasMarkedArea
                  ? displayCountLabel
                  : 'Mark an area to calculate matches'}
              </span>
              <button
                className="btn btn-primary advisor-export-btn"
                disabled={!selectedRecommendations.length}
                onClick={exportPdf}
                type="button"
              >
                <i className="fa fa-file-pdf me-2" aria-hidden="true"></i>
                Export Selected PDF
              </button>
            </div>
          </div>

          {hasMarkedArea && (
            <div className="advisor-report-details">
              <div>
                <span>Address</span>
                <strong>{resolvedAddress || address || 'Not set'}</strong>
              </div>
              <div>
                <span>Area</span>
                <strong>{numberFormatter.format(areaSquareFeet)} sq ft</strong>
              </div>
              {reportConditions.map((condition) => (
                <div key={condition.label}>
                  <span>{condition.label}</span>
                  <strong>{condition.value}</strong>
                </div>
              ))}
              <div>
                <span>Active Filters</span>
                <strong>{activeConditionCount}</strong>
              </div>
            </div>
          )}

          {hasMarkedArea && !isExportingSelected && (
            <div className="advisor-selected-panel">
              <div className="advisor-selected-head">
                <div>
                  <p className="advisor-eyebrow">Selected Plants</p>
                  <strong>{selectedCountLabel}</strong>
                </div>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={!selectedRecommendations.length}
                  onClick={() => {
                    setSelectedPlantKeys([]);
                    setSelectedPlantQuantities({});
                    setSelectedPlantSizes({});
                  }}
                  type="button"
                >
                  Clear selected
                </button>
              </div>
              {selectedRecommendations.length ? (
                <ul className="advisor-selected-list">
                  {selectedRecommendations.map(({ plant }) => (
                    <li key={plantKey(plant)}>
                      <span>{plant.Name}</span>
                      <label className="advisor-selection-input">
                        <span>Qty</span>
                        <input
                          min="1"
                          onChange={(event) =>
                            updateSelectedQuantity(plant, event.target.value)
                          }
                          type="number"
                          value={quantityForPlant(plant)}
                        />
                      </label>
                      <label className="advisor-selection-input">
                        <span>Size</span>
                        <select
                          onChange={(event) =>
                            updateSelectedSize(plant, event.target.value)
                          }
                          value={sizeForPlant(plant)}
                        >
                          {PLANT_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        aria-label={`Remove ${plant.Name}`}
                        className="advisor-selected-remove"
                        onClick={() => removeSelectedPlant(plant)}
                        type="button"
                      >
                        <i className="fa fa-times" aria-hidden="true"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="advisor-selected-empty">
                  Select plants from the recommendations before exporting.
                </p>
              )}
            </div>
          )}

          {!hasMarkedArea ? (
            <div className="advisor-empty-state">
              Mark a plantation area to see recommendations.
            </div>
          ) : recommendationsForDisplay.length ? (
            <div className="advisor-recommendation-grid">
              {recommendationsForDisplay.map(({ plant, reasons, score }) => {
                const isSelected = selectedPlantKeySet.has(plantKey(plant));

                return (
                  <article
                    className={`advisor-plant-card ${isSelected ? 'is-selected' : ''}`}
                    data-is-ornamental={String(isOrnamentalPlant(plant))}
                    key={plantKey(plant)}
                  >
                    <img
                      alt={plant.Name}
                      loading="lazy"
                      src={imagePath(plant.Imgpath)}
                    />
                    <div className="advisor-plant-body">
                      <div className="advisor-plant-head">
                        <Link className="advisor-plant-name" to={`/plant/${plant.slug}`}>
                          {plant.Name}
                        </Link>
                        {!isExportingSelected && (
                          <button
                            className={`btn btn-sm ${
                              isSelected ? 'btn-primary' : 'btn-outline-primary'
                            }`}
                            onClick={() => togglePlantSelection(plant)}
                            type="button"
                          >
                            <i
                              className={`fa ${
                                isSelected ? 'fa-check' : 'fa-plus'
                              } me-1`}
                              aria-hidden="true"
                            ></i>
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        )}
                      </div>
                      <p>{plant.CommanName}</p>
                      {isSelected && (
                        <div className="advisor-selection-fields">
                          <label className="advisor-required-selection">
                            <span>Quantity required</span>
                            {isExportingSelected ? (
                              <strong>{quantityForPlant(plant)}</strong>
                            ) : (
                              <input
                                min="1"
                                onChange={(event) =>
                                  updateSelectedQuantity(plant, event.target.value)
                                }
                                type="number"
                                value={quantityForPlant(plant)}
                              />
                            )}
                          </label>
                          <label className="advisor-required-selection">
                            <span>Size</span>
                            {isExportingSelected ? (
                              <strong>{sizeForPlant(plant)}</strong>
                            ) : (
                              <select
                                onChange={(event) =>
                                  updateSelectedSize(plant, event.target.value)
                                }
                                value={sizeForPlant(plant)}
                              >
                                {PLANT_SIZE_OPTIONS.map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </select>
                            )}
                          </label>
                        </div>
                      )}
                      {/* <div className="advisor-plant-meta">
                        <span>Score {score}</span>
                        <span>{plant.Type}</span>
                        <span>{plant.Region}</span>
                        {reasons.map((reason) => (
                          <span key={reason}>{reason}</span>
                        ))}
                      </div> */}
                      <div className="advisor-plant-meta">
                       
                        <span>{plant.Type}</span>
                  
                      </div> 
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="advisor-empty-state">
              No plants match the selected site conditions for this marked area.
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default PlantAdvisor;
