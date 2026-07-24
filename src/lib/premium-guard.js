export const isPremium = (user) => {
  if (!user) return false;
  const meta = user.user_metadata || {};
  if (meta.role === 'admin' || meta.role === 'premium') return true;
  if (user.role === 'admin' || user.role === 'premium') return true;
  if (meta.premium_until && new Date(meta.premium_until) > new Date()) return true;
  if (user?.subscription?.status === 'active') return true;
  return false;
};

export const isUserPremium = isPremium;

export const isTestPremium = (testRow) => {
  if (!testRow) return false;
  const d = testRow.data || testRow;
  const accessVal = (d.testTution || d.access || testRow.access || 'free').toString().toLowerCase();
  return accessVal === 'paid' || accessVal === 'premium';
};

export const canAccessFeature = (user, feature) => {
  const PREMIUM_FEATURES = ['speaking', 'ai_grading', 'unlimited_tests'];
  if (PREMIUM_FEATURES.includes(feature) && !isPremium(user)) {
    return false;
  }
  return true;
};

