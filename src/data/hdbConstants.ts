export const HDB_TOWNS = [
  'ANG MO KIO',
  'BEDOK',
  'BISHAN',
  'BUKIT BATOK',
  'BUKIT MERAH',
  'BUKIT PANJANG',
  'BUKIT TIMAH',
  'CENTRAL AREA',
  'CHOA CHU KANG',
  'CLEMENTI',
  'GEYLANG',
  'HOUGANG',
  'JURONG EAST',
  'JURONG WEST',
  'KALLANG/WHAMPOA',
  'MARINE PARADE',
  'PASIR RIS',
  'PUNGGOL',
  'QUEENSTOWN',
  'SEMBAWANG',
  'SENGKANG',
  'SERANGOON',
  'TAMPINES',
  'TOA PAYOH',
  'WOODLANDS',
  'YISHUN',
];

export const HDB_FLAT_TYPES = [
  '2 ROOM',
  '3 ROOM',
  '4 ROOM',
  '5 ROOM',
  'EXECUTIVE',
  'MULTI-GENERATION',
];

export const STATUS_SENTENCES = {
  loading:
    'Pulling recent HDB sales records for this flat type — give it a moment before you discuss numbers with the agent.',
  empty:
    'No recent resale transactions recorded for this flat type in this estate — ask the agent to justify the asking price with past block records.',
  refused:
    'The data.gov.sg registry declined the lookup — treat the asking price with caution as official benchmark figures cannot be confirmed.',
  unreachable:
    'Cannot reach the government property database — check your mobile reception before committing to any counter-offer.',
};
