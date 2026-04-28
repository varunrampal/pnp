import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import plants from '../json/PlantsList.json';

const SITE_URL = 'https://www.peelsnativeplants.com';
const DEFAULT_IMAGE = `${SITE_URL}/images/plants/thujaplicata.jpg`;

const routeMeta = {
  '/': {
    title: 'Peels Native Plants Ltd. | Wholesale BC Native Plants',
    description:
      'Wholesale native trees, shrubs, perennials, live stakes, and restoration plant material grown in Langley for landscaping, habitat restoration, and municipal projects across BC.',
    keywords:
      'wholesale native plants BC, Peels Native Plants, Langley nursery, restoration plants, BC native trees, native shrubs, live stakes',
  },
  '/plants': {
    title: 'Wholesale Plant Availability | Peels Native Plants Ltd.',
    description:
      'Browse wholesale native trees, shrubs, perennials, groundcovers, and restoration species available from Peels Native Plants in Langley, British Columbia.',
    keywords:
      'BC plant availability, wholesale native plants, native trees BC, native shrubs BC, restoration nursery Langley',
  },
  '/about': {
    title: 'About Peels Native Plants Ltd. | Langley Native Plant Nursery',
    description:
      'Learn about Peels Native Plants Ltd., a Langley nursery growing quality BC native plants for restoration, landscaping, mitigation, parks, and municipal projects.',
    keywords:
      'about Peels Native Plants, Langley native plant nursery, BC native plant growers, Fraser Valley nursery',
  },
  '/sales/information': {
    title: 'Sales Information | Peels Native Plants Ltd.',
    description:
      'Review container sizes, live stake availability, ordering details, and substitution guidance for wholesale native plant orders in British Columbia.',
    keywords:
      'native plant container sizes, live stakes BC, wholesale plant ordering, BCLNA container standards',
  },
  '/faq': {
    title: 'FAQ | Wholesale Native Plants in BC',
    description:
      'Answers to common questions about ordering, delivery, wholesale pricing, restoration plants, payment, and replacement policies at Peels Native Plants.',
    keywords:
      'Peels Native Plants FAQ, native plant delivery BC, wholesale nursery questions, restoration plants BC',
  },
  '/contact': {
    title: 'Contact Peels Native Plants Ltd. | Langley, BC',
    description:
      'Contact Peels Native Plants Ltd. in Langley, BC for wholesale native plant availability, quotes, delivery questions, and restoration project support.',
    keywords:
      'contact Peels Native Plants, Langley native plant nursery, wholesale plant quote BC, native plant availability',
  },
  '/quote': {
    title: 'Request a Quote | Peels Native Plants Ltd.',
    description:
      'Request a wholesale quote for BC native trees, shrubs, perennials, live stakes, and restoration plant material from Peels Native Plants.',
    keywords:
      'native plant quote BC, wholesale plant quote, restoration plant pricing, Peels Native Plants quote',
  },
  '/admin': {
    title: 'Admin | Peels Native Plants Ltd.',
    description:
      'Administrative plant management for Peels Native Plants Ltd.',
    keywords:
      'Peels Native Plants admin',
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

const canonicalUrl = (path) => `${SITE_URL}${path === '/' ? '/' : path}`;

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
  '@context': 'https://schema.org',
  '@type': 'GardenStore',
  '@id': `${SITE_URL}/#business`,
  name: 'Peels Native Plants Ltd.',
  url: SITE_URL,
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
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Peels Native Plants Ltd.',
  url: SITE_URL,
  publisher: {
    '@id': `${SITE_URL}/#business`,
  },
};

const breadcrumbSchema = (path, meta) => {
  const labels = {
    '/': 'Home',
    '/plants': 'Plants',
    '/about': 'About',
    '/sales/information': 'Sales Information',
    '/faq': 'FAQ',
    '/contact': 'Contact',
    '/quote': 'Request a Quote',
    '/admin': 'Admin',
  };

  const items =
    path === '/'
      ? [{ label: labels['/'], path: '/' }]
      : [
          { label: labels['/'], path: '/' },
          { label: labels[path] || meta.title, path },
        ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: canonicalUrl(item.path),
    })),
  };
};

const pageSchema = (path, meta) => {
  const schemas = [
    localBusinessSchema,
    websiteSchema,
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${canonicalUrl(path)}#webpage`,
      url: canonicalUrl(path),
      name: meta.title,
      description: meta.description,
      isPartOf: {
        '@id': `${SITE_URL}/#website`,
      },
      about: {
        '@id': `${SITE_URL}/#business`,
      },
    },
    breadcrumbSchema(path, meta),
  ];

  if (path === '/faq') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
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
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Wholesale native plant availability',
      itemListElement: plants.slice(0, 24).map((plant, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: `${plant.Name}${plant.CommanName ? ` (${plant.CommanName})` : ''}`,
          category: plant.Type,
          image: plant.Imgpath
            ? `${SITE_URL}/${plant.Imgpath.replace(/^\.?\//, '')}`
            : DEFAULT_IMAGE,
          description:
            plant.Description ||
            `${plant.Name} is available from Peels Native Plants for wholesale native plant and landscape projects in British Columbia.`,
          brand: {
            '@id': `${SITE_URL}/#business`,
          },
        },
      })),
    });
  }

  return schemas;
};

const SEO = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const path = normalizePath(location.pathname);
    const isAdminPath = path.startsWith('/admin');
    const meta = isAdminPath ? routeMeta['/admin'] : routeMeta[path] || routeMeta['/'];
    const canonical = canonicalUrl(path);

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
      content: isAdminPath ? 'noindex, nofollow' : 'index, follow',
    });
    upsertMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: 'website',
    });
    upsertMeta('meta[property="og:locale"]', {
      property: 'og:locale',
      content: 'en_CA',
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
      content: DEFAULT_IMAGE,
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
    upsertMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: DEFAULT_IMAGE,
    });
    upsertLink('link[rel="canonical"]', {
      rel: 'canonical',
      href: canonical,
    });

    let script = document.head.querySelector('#structured-data');
    if (!script) {
      script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(pageSchema(path, meta));
  }, [location.pathname]);

  return null;
};

export default SEO;
