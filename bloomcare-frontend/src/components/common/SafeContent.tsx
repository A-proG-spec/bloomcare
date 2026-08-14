// src/components/common/SafeContent.tsx
import React from 'react';
import { sanitizeDisplay, sanitizeRichText, sanitizeUrl } from '../../utils/sanitizers';

interface SafeTextProps {
  text: string | null | undefined;
  maxLength?: number;
  className?: string;
  as?: 'span' | 'p' | 'div';
}

export const SafeText: React.FC<SafeTextProps> = ({ 
  text, 
  maxLength, 
  className = '',
  as: Component = 'span'
}) => {
  const sanitized = sanitizeDisplay(text, maxLength);
  return <Component className={className}>{sanitized}</Component>;
};

interface SafeHtmlProps {
  html: string | null | undefined;
  className?: string;
  allowRichText?: boolean;
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ 
  html, 
  className = '',
  allowRichText = false 
}) => {
  if (!html) return null;
  
  const sanitized = allowRichText 
    ? sanitizeRichText(html) 
    : sanitizeDisplay(html);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

interface SafeLinkProps {
  href: string | null | undefined;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export const SafeLink: React.FC<SafeLinkProps> = ({
  href,
  children,
  className = '',
  target = '_blank',
  rel = 'noopener noreferrer',
}) => {
  const safeHref = sanitizeUrl(href);
  
  return (
    <a 
      href={safeHref} 
      target={target} 
      rel={rel}
      className={className}
    >
      {children}
    </a>
  );
};