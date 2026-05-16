import React, { useEffect } from 'react';

interface OnboardingPageProps {
  onComplete: (career: string) => void;
}

// Skip onboarding quiz — go straight to dashboard
const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  useEffect(() => {
    onComplete('');
  }, [onComplete]);

  return null;
};

export default OnboardingPage;
