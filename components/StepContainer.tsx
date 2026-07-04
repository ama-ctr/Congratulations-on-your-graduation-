
import React from 'react';

interface StepContainerProps {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

const StepContainer: React.FC<StepContainerProps> = ({ step, title, description, children }) => {
  return (
    <div className="relative bg-[#fff9fb] border-2 border-[#ffc1d6] rounded-xl p-5 mb-8 no-print">
      <span className="absolute -top-3 left-4 bg-[#ff85b2] text-white px-3.5 py-1 rounded-full font-bold text-sm">
        Step {step}
      </span>
      <h3 className="mt-1 text-lg text-[#d81b60] font-bold mb-2">{title}</h3>
      <div className="text-sm text-gray-600 bg-[#fff0f5] p-3 rounded-lg mb-3 leading-relaxed">
        {description}
      </div>
      {children}
    </div>
  );
};

export default StepContainer;
