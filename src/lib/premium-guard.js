export const isPremium = (user) => {
  return user?.role === 'premium' || user?.subscription?.status === 'active';
};

export const canAccessFeature = (user, feature) => {
  const PREMIUM_FEATURES = ['speaking', 'ai_grading', 'unlimited_tests'];
  if (PREMIUM_FEATURES.includes(feature) && !isPremium(user)) {
    return false;
  }
  return true;
};
