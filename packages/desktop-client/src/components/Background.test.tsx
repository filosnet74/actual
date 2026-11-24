import { render } from '@testing-library/react';
import { expect, it } from 'vitest';

import { Background } from './Background';

it('renders a flat backdrop without decorative artwork', () => {
  const { container } = render(<Background />);

  expect(container.querySelector('svg')).toBeNull();
});
