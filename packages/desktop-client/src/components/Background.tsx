import React from 'react';

import { theme } from '@actual-app/components/theme';

// Flat, minimal backdrop: a single neutral surface with no gradient or
// decorative line art.
export function Background() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.pageBackground,
      }}
    />
  );
}
