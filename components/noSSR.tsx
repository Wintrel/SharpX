import dynamic from 'next/dynamic';
import React from 'react';

const NoSSR = (props: { children: React.ReactNode }) => (
  <>{props.children}</>
);

// This tells Next.js to only render this component on the client (browser)
export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false
});