import React from 'react';

type AnimatedHeadingProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
};

/** Accessible editorial heading with a restrained per-letter reveal. */
export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({ text, as: Heading = 'h3', className = '' }) => (
  <Heading className={`animated-heading ${className}`} aria-label={text}>
    <span className="animated-heading-visual" aria-hidden="true">
      {text.split(/(\s+)/).map((part, partIndex) => part.trim() ? (
        <span className="animated-heading-word" key={`word-${partIndex}`}>
          {Array.from(part).map((character, letterIndex) => (
            <span className="animated-heading-letter" key={`${character}-${letterIndex}`} style={{ '--letter-index': partIndex * 12 + letterIndex } as React.CSSProperties}>
              {character}
            </span>
          ))}
        </span>
      ) : <React.Fragment key={`space-${partIndex}`}>{part}</React.Fragment>)}
    </span>
  </Heading>
);
