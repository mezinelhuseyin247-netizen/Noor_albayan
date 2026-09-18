import React from 'react';

interface EducationalSceneBackgroundProps {
  children?: React.ReactNode;
  showCharactersOnSides?: boolean;
  opacity?: number;
  overlayClassName?: string;
}

export const EducationalSceneBackground: React.FC<EducationalSceneBackgroundProps> = ({
  children,
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between bg-slate-50">
      <div className="relative z-10 w-full flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
