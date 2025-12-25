import React from 'react';

const AnimatedImage = ({ src, height, alt, animation, animationDuration, animationTimingFunction, animationIterationCount }: any) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      style={{
        height: height,
        maxWidth: '100%',
        objectFit: 'contain',
        animationName: animation,
        animationDuration,
        animationTimingFunction,
        animationIterationCount
      }} 
      className="rounded-lg my-2"
    />
  );
};

export default AnimatedImage;