import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-sand-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(186,230,253,0.3),rgba(255,255,255,0))]"></div>
    </div>
  );
};

export default Background;