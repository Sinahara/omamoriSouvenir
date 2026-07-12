import { db } from '@/lib/db'

const SITE_URL = 'https://omamorisouvenir.id'
const SITE_NAME = 'Omamori Souvenir'

export async function GET() {
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      name: true,
      slug: true,
      description: true,
      basePrice: true,
      unit: true,
      category: true,
      images: { where: { isPrimary: true }, select: { path: true }, take: 1 },
    },
  })

  const productOffers = products.map((p) => ({
    '@type': 'Offer',
    name: p.name,
    description: p.description || '',
    url: `${SITE_URL}/#/product/${p.slug}`,
    priceCurrency: 'IDR',
    price: p.basePrice,
    availability: 'https://schema.org/InStock',
    image: p.images[0]?.path ? `${SITE_URL}${p.images[0].path}` : undefined,
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/#business`,
        name: SITE_NAME,
        description:
          'Penyedia corporate gift, souvenir perusahaan, dan employee onboarding kit premium di Surabaya. Tumbler custom, plakat penghargaan, lanyard, hardbox, goodie bag, starter kit.',
        url: SITE_URL,
        telephone: '+6281234567890',
        email: 'info@omamorisouvenir.id',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Surabaya',
          addressLocality: 'Surabaya',
          addressRegion: 'Jawa Timur',
          postalCode: '60111',
          addressCountry: 'ID',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: -7.2575,
          longitude: 112.7521,
        },
        areaServed: [
          { '@type': 'City', name: 'Surabaya' },
          { '@type': 'City', name: 'Sidoarjo' },
          { '@type': 'State', name: 'Jawa Timur' },
          { '@type': 'Country', name: 'Indonesia' },
        ],
        priceRange: 'Rp8.000 - Rp250.000',
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '17:00',
        },
        image: `${SITE_URL}/og-image.png`,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Katalog Corporate Gift',
          itemListElement: productOffers,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { '@id': `${SITE_URL}/#business` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/#/catalog?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return Response.json(jsonLd, {
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}