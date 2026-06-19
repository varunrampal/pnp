import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import plants from '../json/PlantsList.json';

const ADVISOR_FIELD = 'IsAdvisable';
const DEFAULT_IMAGE = '/images/plants/default.jpg';

const DEFAULT_FORM = {
  location: 'Langley',
  soil: 'well-drained',
  exposure: 'full-sun',
};

const SOIL_OPTIONS = [
  { value: 'any', label: 'Any soil' },
  { value: 'well-drained', label: 'Well-drained' },
  { value: 'clay', label: 'Clay/heavy' },
  { value: 'sandy', label: 'Sandy/light' },
  { value: 'wet', label: 'Wet/riparian' },
  { value: 'poor', label: 'Poor/disturbed' },
];

const EXPOSURE_OPTIONS = [
  { value: 'any', label: 'Any exposure' },
  { value: 'full-sun', label: 'Full sun' },
  { value: 'part-shade', label: 'Part shade' },
  { value: 'shade', label: 'Shade' },
  { value: 'mixed', label: 'Mixed exposure' },
];

const REGION_LABELS = {
  coastal: 'Coastal BC',
  'lower-mainland': 'Lower Mainland',
  'vancouver-island': 'Vancouver Island',
  'bc-interior': 'BC Interior',
};

const LOCATION_PROFILES = [
  {
    key: 'lower-mainland',
    label: 'Lower Mainland',
    terms: [
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
      'pitt meadows',
      'richmond',
      'surrey',
      'vancouver',
      'white rock',
    ],
    climateNotes: [
      'Warmer, drier summers',
      'Heavier winter rain events',
      'More establishment stress during heat waves',
    ],
  },
  {
    key: 'vancouver-island',
    label: 'Vancouver Island',
    terms: [
      'campbell river',
      'comox',
      'cowichan',
      'duncan',
      'ladysmith',
      'nanaimo',
      'saanich',
      'sidney',
      'vancouver island',
      'victoria',
    ],
    climateNotes: [
      'Longer dry summer periods',
      'Localized winter waterlogging',
      'Coastal wind and salt exposure in some sites',
    ],
  },
  {
    key: 'bc-interior',
    label: 'BC Interior',
    terms: [
      'cache creek',
      'kamloops',
      'kelowna',
      'merritt',
      'okanagan',
      'oliver',
      'osoyoos',
      'penticton',
      'prince george',
      'salmon arm',
      'vernon',
      'williams lake',
    ],
    climateNotes: [
      'Higher heat and drought pressure',
      'Irrigation limits after establishment',
      'Greater value from dry-site structure and mulch',
    ],
  },
  {
    key: 'coastal',
    label: 'Coastal BC',
    terms: ['coastal', 'north shore', 'squamish', 'sunshine coast', 'whistler'],
    climateNotes: [
      'Warmer shoulder seasons',
      'Heavy rain and drainage stress',
      'Mixed drought and flood resilience needed',
    ],
  },
];

const MIX_DEFINITIONS = [
  {
    key: 'dry-slope',
    title: 'Dry Summer Slope Mix',
    intent: 'For sunny, fast-draining sites where establishment water may be limited.',
    categories: ['drought', 'heat'],
  },
  {
    key: 'rain-garden',
    title: 'Rain Garden Edge Mix',
    intent: 'For sites that swing between winter wetness and summer drying.',
    categories: ['flood', 'drought'],
  },
  {
    key: 'urban-heat',
    title: 'Urban Heat Buffer Mix',
    intent: 'For exposed project edges, parking lot buffers, and reflected heat.',
    categories: ['heat', 'drought'],
  },
  {
    key: 'canopy-understory',
    title: 'Layered Resilience Mix',
    intent: 'For mixed exposure sites needing canopy, shrub, and ground layer structure.',
    categories: ['flood', 'heat', 'drought'],
  },
];

const safeText = (value) => String(value || '').trim().toLowerCase();

const hasAny = (text, terms) => terms.some((term) => text.includes(term));

const isAdvisorEligible = (plant) =>
  plant[ADVISOR_FIELD] !== false && safeText(plant[ADVISOR_FIELD]) !== 'false';

const recommendationKey = (plant) => safeText(plant.slug || plant.Name);

const imagePath = (path) => {
  if (!path || path.includes('default.jpg')) return DEFAULT_IMAGE;
  return path.replace(/^\.?\//, '/');
};

const handleImageError = (event) => {
  if (event.currentTarget.src.endsWith(DEFAULT_IMAGE)) return;

  event.currentTarget.src = DEFAULT_IMAGE;
};

const plantText = (plant) =>
  safeText(
    [
      plant.Type,
      plant.Sun,
      plant.Soil,
      plant.Moisture,
      plant.Slope,
      plant.Irrigation,
      plant.Uses,
      plant.RestorationValue,
      plant.Description,
      plant.Region,
    ].join(' '),
  );

const optionLabel = (options, value) =>
  options.find((option) => option.value === value)?.label || value;

const inferLocationProfile = (location) => {
  const text = safeText(location);
  const matchedProfile = LOCATION_PROFILES.find((profile) =>
    hasAny(text, profile.terms),
  );

  return matchedProfile || LOCATION_PROFILES[0];
};

const addReason = (reasons, reason) => {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
};

const matchesExposure = (siteText, exposure) => {
  if (exposure === 'any' || exposure === 'mixed') return true;
  if (exposure === 'full-sun') return siteText.includes('full sun');
  if (exposure === 'part-shade') {
    return hasAny(siteText, ['part shade', 'partial shade', 'full sun to part shade']);
  }
  if (exposure === 'shade') {
    return (
      hasAny(siteText, ['to shade', 'shade to']) ||
      /^shade\b/.test(siteText) ||
      /,\s*shade\b/.test(siteText)
    );
  }

  return true;
};

const matchesSoil = (siteText, soil) => {
  if (soil === 'any') return true;
  if (soil === 'well-drained') return siteText.includes('well-drained');
  if (soil === 'clay') return hasAny(siteText, ['clay', 'heavy', 'moist', 'wet']);
  if (soil === 'sandy') return hasAny(siteText, ['sandy', 'light', 'gravel', 'dry']);
  if (soil === 'wet') return hasAny(siteText, ['wet', 'riparian', 'moist']);
  if (soil === 'poor') return hasAny(siteText, ['poor', 'disturbed', 'adaptable', 'native']);

  return true;
};

const regionScore = (plant, profile, reasons) => {
  const plantRegion = safeText(plant.Region);
  const profileLabel = safeText(REGION_LABELS[profile.key]);

  if (plantRegion === profileLabel) {
    addReason(reasons, `${REGION_LABELS[profile.key]} fit`);
    return 4;
  }

  if (profile.key === 'lower-mainland' && plantRegion === safeText(REGION_LABELS.coastal)) {
    addReason(reasons, 'Coastal climate fit');
    return 2;
  }

  if (profile.key === 'coastal' && plantRegion === safeText(REGION_LABELS['vancouver-island'])) {
    addReason(reasons, 'Coastal exposure fit');
    return 2;
  }

  return 0;
};

const scorePlant = (plant, category, profile, form) => {
  const siteText = plantText(plant);
  const restorationText = safeText(plant.RestorationValue);
  const reasons = [];
  let score = regionScore(plant, profile, reasons);

  if (restorationText.includes('high')) {
    score += 2;
    addReason(reasons, 'High restoration value');
  }

  if (restorationText.includes('native') || siteText.includes('native species')) {
    score += 2;
    addReason(reasons, 'Native species');
  }

  if (matchesSoil(siteText, form.soil)) {
    score += form.soil === 'any' ? 0 : 2;
    if (form.soil !== 'any') addReason(reasons, `${optionLabel(SOIL_OPTIONS, form.soil)} soil`);
  } else {
    score -= 3;
  }

  if (matchesExposure(siteText, form.exposure)) {
    score += form.exposure === 'any' ? 0 : 2;
    if (form.exposure !== 'any') {
      addReason(reasons, optionLabel(EXPOSURE_OPTIONS, form.exposure));
    }
  } else {
    score -= 3;
  }

  if (category === 'drought') {
    if (hasAny(siteText, ['dry', 'drought', 'low after establishment', 'low to moderate'])) {
      score += 6;
      addReason(reasons, 'Drought tolerant');
    }

    if (hasAny(siteText, ['well-drained', 'sandy', 'gravel', 'rocky'])) {
      score += 2;
      addReason(reasons, 'Dry soil structure');
    }

    if (hasAny(siteText, ['wet', 'keep evenly moist', 'high during establishment'])) {
      score -= 3;
    }
  }

  if (category === 'flood') {
    if (hasAny(siteText, ['wet', 'riparian', 'tolerates wet', 'moist to wet'])) {
      score += 6;
      addReason(reasons, 'Flood/wet tolerance');
    }

    if (hasAny(siteText, ['erosion', 'bank stabilization', 'creek', 'stream'])) {
      score += 3;
      addReason(reasons, 'Stormwater edge fit');
    }

    if (siteText.includes('avoid waterlogged')) {
      score -= 5;
    }
  }

  if (category === 'heat') {
    if (siteText.includes('full sun')) {
      score += 4;
      addReason(reasons, 'Heat exposure fit');
    }

    if (hasAny(siteText, ['dry', 'drought', 'low after establishment', 'well-drained'])) {
      score += 4;
      addReason(reasons, 'Summer resilience');
    }

    if (safeText(plant.Region) === safeText(REGION_LABELS['bc-interior'])) {
      score += 3;
      addReason(reasons, 'Interior heat fit');
    }
  }

  if (profile.key === 'bc-interior' && category !== 'flood') {
    if (hasAny(siteText, ['dry', 'drought', 'low after establishment', 'bc interior'])) {
      score += 2;
    } else {
      score -= 2;
    }
  }

  if (profile.key !== 'bc-interior' && category === 'flood') {
    if (hasAny(siteText, ['moist', 'wet', 'coastal'])) score += 1;
  }

  return {
    plant,
    reasons: reasons.slice(0, 4),
    score,
  };
};

const topRecommendations = (category, profile, form, limit = 6) =>
  [
    ...plants
      .filter(isAdvisorEligible)
      .map((plant) => scorePlant(plant, category, profile, form))
      .filter(({ score }) => score >= 6)
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.plant.Name.localeCompare(b.plant.Name) ||
          Number(a.plant.id || 0) - Number(b.plant.id || 0),
      )
      .reduce((uniqueRecommendations, recommendation) => {
        const key = recommendationKey(recommendation.plant);

        if (!uniqueRecommendations.has(key)) {
          uniqueRecommendations.set(key, recommendation);
        }

        return uniqueRecommendations;
      }, new Map())
      .values(),
  ].slice(0, limit);

const buildRecommendationGroups = (profile, form) => {
  const usedPlantKeys = new Set();

  return ['drought', 'flood', 'heat'].reduce((groups, category) => {
    const recommendations = topRecommendations(category, profile, form, 18)
      .filter(({ plant }) => {
        const key = recommendationKey(plant);

        if (usedPlantKeys.has(key)) {
          return false;
        }

        usedPlantKeys.add(key);
        return true;
      })
      .slice(0, 6);

    return {
      ...groups,
      [category]: recommendations,
    };
  }, {});
};

const buildMixes = (groups) =>
  MIX_DEFINITIONS.map((mix) => {
    const seen = new Set();
    const candidates = mix.categories.flatMap((category) => groups[category] || []);
    const plantsForMix = candidates
      .filter(({ plant }) => {
        const key = recommendationKey(plant);
        if (seen.has(key)) return false;

        seen.add(key);
        return true;
      })
      .slice(0, 5);

    return {
      ...mix,
      plants: plantsForMix,
    };
  }).filter((mix) => mix.plants.length >= 3);

const ClimatePlantCard = ({ recommendation }) => {
  const { plant, reasons,} = recommendation;

  return (
    <article className="advisor-plant-card climate-plant-card">
      <img
        alt={plant.Name}
        loading="lazy"
        onError={handleImageError}
        src={imagePath(plant.Imgpath)}
      />
      <div className="advisor-plant-body">
        <div className="advisor-plant-head">
          <Link
            className="advisor-plant-name"
            rel="noopener noreferrer"
            target="_blank"
            to={`/plant/${plant.slug}`}
          >
            {plant.Name}
          </Link>
          {/* <span className="climate-score">{score}</span> */}
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
  );
};

const ClimateResilienceSelector = () => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const profile = useMemo(() => inferLocationProfile(form.location), [form.location]);
  const recommendationGroups = useMemo(
    () => buildRecommendationGroups(profile, form),
    [form, profile],
  );
  const mixes = useMemo(() => buildMixes(recommendationGroups), [recommendationGroups]);
  const totalMatches =
    recommendationGroups.drought.length +
    recommendationGroups.flood.length +
    recommendationGroups.heat.length;

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  return (
    <>
      <div className="container-fluid page-header py-5 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="container text-center py-5">
          <h1 className="display-3 text-white mb-4 animated slideInDown">
            Climate Resilience Plant Selector
          </h1>
        </div>
      </div>

      <div className="container-fluid plant-advisor-page climate-selector-page py-5">
        <section className="climate-selector-shell">
          <div className="advisor-panel climate-selector-form">
            <p className="advisor-eyebrow">Project Inputs</p>
            <div className="climate-form-grid">
              <div className="advisor-condition-field">
                <label className="form-label" htmlFor="climate-location">
                  City / Project Location
                </label>
                <input
                  className="form-control"
                  id="climate-location"
                  onChange={(event) => updateField('location', event.target.value)}
                  placeholder="Langley, Kelowna, Victoria..."
                  type="text"
                  value={form.location}
                />
              </div>

              <div className="advisor-condition-field">
                <label className="form-label" htmlFor="climate-soil">
                  Soil Type
                </label>
                <select
                  className="form-select"
                  id="climate-soil"
                  onChange={(event) => updateField('soil', event.target.value)}
                  value={form.soil}
                >
                  {SOIL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="advisor-condition-field">
                <label className="form-label" htmlFor="climate-exposure">
                  Exposure
                </label>
                <select
                  className="form-select"
                  id="climate-exposure"
                  onChange={(event) => updateField('exposure', event.target.value)}
                  value={form.exposure}
                >
                  {EXPOSURE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="climate-projection-panel">
            <p className="advisor-eyebrow">Projection</p>
            <h2>Projected to perform well in BC climate conditions.</h2>
            <div className="climate-projection-grid">
              <div>
                <span>Region</span>
                <strong>{profile.label}</strong>
              </div>
              <div>
                <span>Soil</span>
                <strong>{optionLabel(SOIL_OPTIONS, form.soil)}</strong>
              </div>
              <div>
                <span>Exposure</span>
                <strong>{optionLabel(EXPOSURE_OPTIONS, form.exposure)}</strong>
              </div>
              <div>
                <span>Matches</span>
                <strong>{totalMatches}</strong>
              </div>
            </div>
            <div className="climate-pressure-list">
              {profile.climateNotes.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="climate-results-section">
          <div className="advisor-results climate-result-block">
            <div className="advisor-results-head">
              <div>
                <p className="advisor-eyebrow">Drought-Tolerant Natives</p>
                <h2>Low-water establishment candidates</h2>
              </div>
              <span className="advisor-count">{recommendationGroups.drought.length} plants</span>
            </div>
            <div className="advisor-recommendation-grid climate-recommendation-grid">
              {recommendationGroups.drought.map((recommendation) => (
                <ClimatePlantCard
                  key={recommendationKey(recommendation.plant)}
                  recommendation={recommendation}
                />
              ))}
            </div>
          </div>

          <div className="advisor-results climate-result-block">
            <div className="advisor-results-head">
              <div>
                <p className="advisor-eyebrow">Flood-Resistant Species</p>
                <h2>Winter wetness and stormwater plants</h2>
              </div>
              <span className="advisor-count">{recommendationGroups.flood.length} plants</span>
            </div>
            <div className="advisor-recommendation-grid climate-recommendation-grid">
              {recommendationGroups.flood.map((recommendation) => (
                <ClimatePlantCard
                  key={recommendationKey(recommendation.plant)}
                  recommendation={recommendation}
                />
              ))}
            </div>
          </div>

          <div className="advisor-results climate-result-block">
            <div className="advisor-results-head">
              <div>
                <p className="advisor-eyebrow">Heat-Resilient Plants</p>
                <h2>Full-sun and heat-event performers</h2>
              </div>
              <span className="advisor-count">{recommendationGroups.heat.length} plants</span>
            </div>
            <div className="advisor-recommendation-grid climate-recommendation-grid">
              {recommendationGroups.heat.map((recommendation) => (
                <ClimatePlantCard
                  key={recommendationKey(recommendation.plant)}
                  recommendation={recommendation}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="advisor-results climate-mix-section">
          <div className="advisor-results-head">
            <div>
              <p className="advisor-eyebrow">Climate-Adapted Planting Mixes</p>
              <h2>Balanced mixes for 2040 planning</h2>
            </div>
            <span className="advisor-count">{mixes.length} mixes</span>
          </div>

          {mixes.length ? (
            <div className="climate-mix-grid">
              {mixes.map((mix) => (
                <article className="climate-mix-card" key={mix.key}>
                  <div>
                    <p className="advisor-eyebrow">Planting Mix</p>
                    <h3>{mix.title}</h3>
                    <p>{mix.intent}</p>
                  </div>
                  <ul>
                  {mix.plants.map(({ plant }) => (
                      <li key={recommendationKey(plant)}>
                        <Link
                          rel="noopener noreferrer"
                          target="_blank"
                          to={`/plant/${plant.slug}`}
                        >
                          {plant.Name}
                        </Link>
                        <span>{plant.Type}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : (
            <div className="advisor-empty-state">
              No climate mix is available for this combination yet.
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default ClimateResilienceSelector;
