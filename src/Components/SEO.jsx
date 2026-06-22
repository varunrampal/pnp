import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import plants from '../json/PlantsList.json';

const SITE_URL = 'https://peelsnativeplants.com';
const SITE_NAME = 'Peels Native Plants Ltd.';
const DEFAULT_IMAGE = `${SITE_URL}/images/plants/default.jpg`;
const BUSINESS_ID = `${SITE_URL}/#business`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const routeMeta = {
  '/': {
    label: 'Home',
    title: 'Peels Native Plants Ltd. | Wholesale BC Native Plants',
    description:
      'Wholesale native trees, shrubs, perennials, live stakes, and restoration plant material grown in Langley for landscaping, habitat restoration, and municipal projects across BC.',
    keywords:
      'wholesale native plants BC, Peels Native Plants, Langley nursery, restoration plants, BC native trees, native shrubs, live stakes',
  },
  '/plants': {
    label: 'Plants',
    title: 'Wholesale Plant Availability | Peels Native Plants Ltd.',
    description:
      'Browse wholesale native trees, shrubs, perennials, groundcovers, and restoration species available from Peels Native Plants in Langley, British Columbia.',
    keywords:
      'BC plant availability, wholesale native plants, native trees BC, native shrubs BC, restoration nursery Langley',
    schemaType: 'CollectionPage',
  },
  '/plant-advisor': {
    label: 'Plant Advisor',
    title: 'Plant Advisor | Native Plant Recommendations for BC Sites',
    description:
      'Use the Peels Native Plants advisor to map a planting area and review native plant recommendations for BC landscape, restoration, and municipal projects.',
    keywords:
      'plant advisor BC, native plant recommendations, planting area map, Peels Native Plants advisor',
  },
  '/satellite-site-analysis': {
    label: 'Satellite Site Analysis',
    title: 'Satellite Site Analysis | BC Native Plant Planning Tool',
    description:
      'Drop a pin on a satellite map to estimate slope, vegetation density, nearby water, sun exposure, elevation, and BC native plant recommendations.',
    keywords:
      'satellite site analysis BC, native plant recommendations, slope vegetation water elevation plant advisor',
  },
  '/climate-resilience-selector': {
    label: 'Climate Resilience Plant Selector',
    title: 'Climate Resilience Plant Selector | BC Native Plants',
    description:
      'Select BC native and climate-adapted plants by city, soil type, and exposure for drought, flood, heat, and 2040 climate resilience planning.',
    keywords:
      'climate resilient plants BC, drought tolerant natives, flood resistant plants, heat resilient native plants, climate adapted planting mixes',
  },
  '/about': {
    label: 'About',
    title: 'About Peels Native Plants Ltd. | Langley Native Plant Nursery',
    description:
      'Learn about Peels Native Plants Ltd., a Langley nursery growing quality BC native plants for restoration, landscaping, mitigation, parks, and municipal projects.',
    keywords:
      'about Peels Native Plants, Langley native plant nursery, BC native plant growers, Fraser Valley nursery',
    schemaType: 'AboutPage',
  },
  '/sales/information': {
    label: 'Sales Information',
    title: 'Sales Information | Wholesale Native Plant Ordering in BC',
    description:
      'Review container sizes, live stake availability, ordering details, and substitution guidance for wholesale native plant orders in British Columbia.',
    keywords:
      'native plant container sizes, live stakes BC, wholesale plant ordering, BCLNA container standards',
  },
  '/faq': {
    label: 'FAQ',
    title: 'FAQ | Wholesale Native Plants in BC',
    description:
      'Find answers about ordering, delivery, wholesale pricing, restoration plants, payment, and replacement policies at Peels Native Plants.',
    keywords:
      'Peels Native Plants FAQ, native plant delivery BC, wholesale nursery questions, restoration plants BC',
  },
  '/contact': {
    label: 'Contact',
    title: 'Contact Peels Native Plants Ltd. | Langley, BC',
    description:
      'Contact Peels Native Plants Ltd. in Langley, BC for wholesale native plant availability, quotes, delivery questions, and restoration project support.',
    keywords:
      'contact Peels Native Plants, Langley native plant nursery, wholesale plant quote BC, native plant availability',
    schemaType: 'ContactPage',
  },
  '/quote': {
    label: 'Request a Quote',
    title: 'Request a Quote | Wholesale BC Native Plants',
    description:
      'Request a wholesale quote for BC native trees, shrubs, perennials, live stakes, and restoration plant material from Peels Native Plants.',
    keywords:
      'native plant quote BC, wholesale plant quote, restoration plant pricing, Peels Native Plants quote',
    schemaType: 'ContactPage',
  },
  '/dragdrop': {
    label: 'Drag and Drop',
    title: 'Internal Drag and Drop Tool | Peels Native Plants Ltd.',
    description:
      'Internal drag and drop export tool for Peels Native Plants Ltd.',
    keywords: 'Peels Native Plants internal tool',
    robots: 'noindex, nofollow',
    canonicalPath: '/dragdrop',
  },
  '/admin': {
    label: 'Admin',
    title: 'Admin | Peels Native Plants Ltd.',
    description:
      'Administrative plant management for Peels Native Plants Ltd.',
    keywords: 'Peels Native Plants admin',
    robots: 'noindex, nofollow',
    canonicalPath: '/admin',
  },
};

const faqItems = [
  {
    question: 'Where is Peels Native Plants located?',
    answer:
      'Peels Native Plants is located in Langley Township, British Columbia, and serves wholesale customers throughout BC.',
  },
  {
    question: 'Do you deliver outside the Lower Mainland?',
    answer:
      'Yes, Peels Native Plants delivers throughout British Columbia, including Vancouver Island and the BC Interior.',
  },
  {
    question: 'Do you offer wholesale pricing?',
    answer:
      'Yes, pricing is designed for wholesale buyers including landscapers, restoration firms, developers, municipalities, and garden centers.',
  },
  {
    question: 'Do you grow plants for habitat restoration?',
    answer:
      'Yes, many available plants support ecological restoration, riparian stabilization, mitigation, and reforestation projects.',
  },
];

const normalizePath = (pathname) => {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '');
  return normalized || '/';
};

const canonicalUrl = (path = '/') => {
  const normalized = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return `${SITE_URL}${normalized === '/' ? '/' : normalized}`;
};

const compactText = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const truncateText = (value, maxLength = 155) => {
  const text = compactText(value);

  if (text.length <= maxLength) return text;

  const shortened = text.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(' ');

  return `${shortened.slice(0, lastSpace > 80 ? lastSpace : shortened.length).trim()}.`;
};

const absoluteImageUrl = (path) => {
  if (!path) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(path)) return path;

  const cleanPath = path.replace(/^\.?\//, '').replace(/^public\//, '');
  return `${SITE_URL}/${cleanPath}`;
};

const plantDisplayName = (plant) =>
  compactText(
    [plant.Name, plant.CommanName ? `(${plant.CommanName})` : '']
      .filter(Boolean)
      .join(' ')
  );

const findPlantByPath = (path) => {
  const match = path.match(/^\/plant\/([^/]+)$/);
  if (!match) return null;

  const slug = decodeURIComponent(match[1]).toLowerCase();
  return plants.find((plant) => plant.slug === slug) || null;
};

const plantDescription = (plant) => {
  const fallback = [
    plantDisplayName(plant),
    plant.Type ? `is a ${plant.Type.toLowerCase()}` : 'is available',
    'from Peels Native Plants for wholesale native plant, landscaping, and restoration projects in British Columbia.',
  ].join(' ');

  const details = [
    plant.Description,
    plant.Sun ? `Sun: ${plant.Sun}.` : '',
    plant.Soil ? `Soil: ${plant.Soil}.` : '',
    plant.Moisture ? `Moisture: ${plant.Moisture}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return truncateText(details || fallback);
};

const plantKeywords = (plant) =>
  [
    plant.Name,
    plant.CommanName,
    plant.Type,
    plant.Region,
    'BC native plants',
    'wholesale plants',
    'restoration plants',
    'Peels Native Plants',
  ]
    .filter(Boolean)
    .map(compactText)
    .join(', ');

const buildPlantMeta = (plant, path) => {
  const titleName = plant.CommanName
    ? `${plant.Name} (${plant.CommanName})`
    : plant.Name;

  return {
    label: plantDisplayName(plant),
    title: `${compactText(titleName)} | Peels Native Plants Ltd.`,
    description: plantDescription(plant),
    keywords: plantKeywords(plant),
    image: absoluteImageUrl(plant.Imgpath),
    imageAlt: plantDisplayName(plant),
    schemaType: 'ItemPage',
    canonicalPath: path,
  };
};

const getPageContext = (path) => {
  if (path.startsWith('/admin')) {
    return {
      meta: routeMeta['/admin'],
      path: routeMeta['/admin'].canonicalPath,
      noStructuredData: true,
    };
  }

  const plant = findPlantByPath(path);

  if (plant) {
    return {
      meta: buildPlantMeta(plant, path),
      path,
      plant,
    };
  }

  if (path.startsWith('/plant/')) {
    return {
      meta: {
        label: 'Plant Not Found',
        title: 'Plant Not Found | Peels Native Plants Ltd.',
        description:
          'This plant record could not be found. Browse the Peels Native Plants wholesale plant availability list for current BC native plant options.',
        keywords: 'Peels Native Plants, wholesale plant availability',
        robots: 'noindex, follow',
        canonicalPath: '/plants',
      },
      path,
      noStructuredData: true,
    };
  }

  const meta = routeMeta[path] || routeMeta['/'];

  return {
    meta,
    path: meta.canonicalPath || path,
    noStructuredData: meta.robots?.includes('noindex') || false,
  };
};

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const upsertLink = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const localBusinessSchema = {
  '@type': 'GardenStore',
  '@id': BUSINESS_ID,
  name: SITE_NAME,
  url: canonicalUrl('/'),
  image: DEFAULT_IMAGE,
  telephone: '+1-604-217-1351',
  email: 'info@peelsnativeplants.com',
  priceRange: '$$',
  description:
    'Wholesale BC native plant nursery specializing in trees, shrubs, perennials, live stakes, and restoration plant material.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '24095 65 Ave',
    addressLocality: 'Langley Township',
    addressRegion: 'BC',
    postalCode: 'V2Y 2H1',
    addressCountry: 'CA',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-604-217-1351',
    email: 'info@peelsnativeplants.com',
    contactType: 'sales',
    areaServed: 'CA-BC',
    availableLanguage: ['English'],
  },
  areaServed: [
    {
      '@type': 'AdministrativeArea',
      name: 'British Columbia',
    },
    {
      '@type': 'City',
      name: 'Langley',
    },
  ],
};

const websiteSchema = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: canonicalUrl('/'),
  publisher: {
    '@id': BUSINESS_ID,
  },
};

const breadcrumbSchema = (path, meta, plant) => {
  const homeItem = { label: routeMeta['/'].label, path: '/' };
  let items = [homeItem];

  if (plant) {
    items = [
      homeItem,
      { label: routeMeta['/plants'].label, path: '/plants' },
      { label: plantDisplayName(plant), path },
    ];
  } else if (path !== '/') {
    items.push({
      label: routeMeta[path]?.label || meta.label || meta.title,
      path,
    });
  }

  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: compactText(item.label),
      item: canonicalUrl(item.path),
    })),
  };
};

const plantProductSchema = (plant, meta, canonical) => {
  const additionalProperty = [
    ['Category', plant.Type],
    ['Common name', plant.CommanName],
    ['Sun exposure', plant.Sun],
    ['Soil', plant.Soil],
    ['Moisture', plant.Moisture],
    ['Region', plant.Region],
    ['Mature size', plant.MatureSize],
    ['Restoration value', plant.RestorationValue],
  ]
    .filter(([, value]) => value)
    .map(([name, value]) => ({
      '@type': 'PropertyValue',
      name,
      value: compactText(value),
    }));

  return {
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name: compactText(plant.Name),
    alternateName: plant.CommanName ? compactText(plant.CommanName) : undefined,
    category: plant.Type,
    image: meta.image,
    description: meta.description,
    url: canonical,
    brand: {
      '@id': BUSINESS_ID,
    },
    additionalProperty,
  };
};

const plantsItemListSchema = () => ({
  '@type': 'ItemList',
  '@id': `${canonicalUrl('/plants')}#plant-list`,
  name: 'Wholesale native plant availability',
  itemListElement: plants.slice(0, 24).map((plant, index) => {
    const url = plant.slug ? canonicalUrl(`/plant/${plant.slug}`) : canonicalUrl('/plants');

    return {
      '@type': 'ListItem',
      position: index + 1,
      url,
      item: {
        '@type': 'Product',
        '@id': `${url}#product`,
        name: plantDisplayName(plant),
        category: plant.Type,
        image: absoluteImageUrl(plant.Imgpath),
        description:
          plant.Description ||
          `${plantDisplayName(plant)} is available from Peels Native Plants for wholesale native plant and landscape projects in British Columbia.`,
        brand: {
          '@id': BUSINESS_ID,
        },
      },
    };
  }),
});

const pageSchema = (path, meta, plant) => {
  const canonical = canonicalUrl(meta.canonicalPath || path);
  const schemas = [
    localBusinessSchema,
    websiteSchema,
    {
      '@type': meta.schemaType || 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: meta.title,
      description: meta.description,
      isPartOf: {
        '@id': WEBSITE_ID,
      },
      about: {
        '@id': BUSINESS_ID,
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: meta.image || DEFAULT_IMAGE,
      },
    },
    breadcrumbSchema(path, meta, plant),
  ];

  if (plant) {
    schemas[2].mainEntity = {
      '@id': `${canonical}#product`,
    };
    schemas.push(plantProductSchema(plant, meta, canonical));
  }

  if (path === '/faq') {
    schemas.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  if (path === '/plants') {
    schemas[2].mainEntity = {
      '@id': `${canonical}#plant-list`,
    };
    schemas.push(plantsItemListSchema());
  }

  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
};

const SEO = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const normalizedPath = normalizePath(location.pathname);
    const { meta, path, plant, noStructuredData } = getPageContext(normalizedPath);
    const canonical = canonicalUrl(meta.canonicalPath || path);
    const image = meta.image || DEFAULT_IMAGE;
    const imageAlt = meta.imageAlt || SITE_NAME;
    const robots = meta.robots || 'index, follow';
    const ogType = plant ? 'product' : 'website';

    document.documentElement.setAttribute('lang', 'en-CA');
    document.title = meta.title;

    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: meta.description,
    });
    upsertMeta('meta[name="keywords"]', {
      name: 'keywords',
      content: meta.keywords,
    });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: robots,
    });
    upsertMeta('meta[name="author"]', {
      name: 'author',
      content: SITE_NAME,
    });
    upsertMeta('meta[name="theme-color"]', {
      name: 'theme-color',
      content: '#0F4229',
    });
    upsertMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: ogType,
    });
    upsertMeta('meta[property="og:locale"]', {
      property: 'og:locale',
      content: 'en_CA',
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: SITE_NAME,
    });
    upsertMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: meta.title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: meta.description,
    });
    upsertMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonical,
    });
    upsertMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: image,
    });
    upsertMeta('meta[property="og:image:alt"]', {
      property: 'og:image:alt',
      content: imageAlt,
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: meta.title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: meta.description,
    });
    upsertMeta('meta[name="twitter:url"]', {
      name: 'twitter:url',
      content: canonical,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: image,
    });
    upsertMeta('meta[name="twitter:image:alt"]', {
      name: 'twitter:image:alt',
      content: imageAlt,
    });
    upsertLink('link[rel="canonical"]', {
      rel: 'canonical',
      href: canonical,
    });
    upsertLink('link[rel="alternate"][hreflang="en-ca"]', {
      rel: 'alternate',
      hreflang: 'en-ca',
      href: canonical,
    });

    const existingScript = document.head.querySelector('#structured-data');

    if (noStructuredData) {
      existingScript?.remove();
      return;
    }

    let script = existingScript;
    if (!script) {
      script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(pageSchema(path, meta, plant));
  }, [location.pathname]);

  return null;
};

export default SEO;
