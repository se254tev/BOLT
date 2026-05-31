const computeRankingScore = (property) => {
  const isFeatured = property.isFeatured && property.featuredUntil && new Date(property.featuredUntil) > new Date();
  const isVerified = !!property.isVerified;
  const views = property.viewsCount || 0;
  const inquiries = property.inquiriesCount || 0;
  const score = (isFeatured ? 50 : 0) + (isVerified ? 30 : 0) + (views * 0.1) + (inquiries * 0.5);
  return score;
};

const sortPropertiesByRanking = (properties) => {
  return properties
    .map((p) => ({ p, score: computeRankingScore(p) }))
    .sort((a, b) => {
      // primary: active featured
      const aFeatured = a.p.isFeatured && a.p.featuredUntil && new Date(a.p.featuredUntil) > new Date();
      const bFeatured = b.p.isFeatured && b.p.featuredUntil && new Date(b.p.featuredUntil) > new Date();
      if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
      // secondary: computed score (higher first)
      if (a.score !== b.score) return b.score - a.score;
      // tertiary: recent listings
      return new Date(b.p.createdAt) - new Date(a.p.createdAt);
    })
    .map((x) => x.p);
};

module.exports = { computeRankingScore, sortPropertiesByRanking };
