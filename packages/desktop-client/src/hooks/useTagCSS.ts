import { useCallback } from 'react';

import { theme as themeStyle } from '@actual-app/components/theme';
import { css } from '@emotion/css';

import { useTags } from './useTags';

export function useTagCSS(opts?: { ellipsis?: boolean }) {
  const { data: tags = [] } = useTags();

  return useCallback(
    (
      tag: string,
      options: { color?: string | null; compact?: boolean } = {},
    ) => {
      const tagObj = tags.find(t => t.tag === tag);
      const { color, backgroundColor, backgroundColorHovered, isCustomColor } =
        getTagCSSColors(
          // fallback strategy: options color > tag color > default color > theme color (undefined)
          options.color ?? tagObj?.color,
        );

      return css({
        ...(opts?.ellipsis
          ? {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              display: 'inline-block',
              whiteSpace: 'nowrap',
            }
          : { display: 'inline-flex' }),
        opacity: tagObj?.hidden ? 0.5 : undefined,
        padding: options.compact ? '0px 7px' : '3px 7px',
        borderRadius: 16,
        userSelect: 'none',
        backgroundColor,
        // Users can give a tag its own colour on the Tags page; that colour
        // tints the pill's background and the tag's label (e.g. "#food") is
        // drawn in a deeper shade of it. Tags without their own colour use
        // the theme's default pill colours.
        //
        // The pill is a bare Button, and Button's hover style changes the
        // label to the normal page text colour. On a default pill that's
        // fine, so it's left alone. On a user-coloured pill !important keeps
        // the tinted label while hovered.
        //
        // getTagCSSColors returns plain colours (callers like the remove
        // badge mix them into other CSS, where !important would be invalid),
        // so the suffix is added here, only for user-coloured tags.
        color: isCustomColor ? `${color} !important` : color,
        cursor: 'pointer',
        '&[data-hovered]': {
          backgroundColor: backgroundColorHovered,
        },
        '&[data-pressed]': {
          backgroundColor: backgroundColorHovered,
        },
      });
    },
    [tags, opts],
  );
}

type TagPillColors = {
  color: string;
  backgroundColor: string;
  backgroundColorHovered: string;
};

type TagPillStyle = TagPillColors & { isHidden: boolean };

/**
 * Returns a getter for what a tag's pill looks like (its plain colours, and
 * whether the tag is hidden, which draws it faded), for callers that need to
 * build styles around the pill rather than use the pill class itself.
 */
export function useTagPillStyle() {
  const { data: tags = [] } = useTags();

  return (tag: string): TagPillStyle => {
    const tagObj = tags.find(t => t.tag === tag);
    const { color, backgroundColor, backgroundColorHovered } = getTagCSSColors(
      tagObj?.color,
    );

    return {
      color,
      backgroundColor,
      backgroundColorHovered,
      isHidden: Boolean(tagObj?.hidden),
    };
  };
}

function getTagCSSColors(
  color?: string | null,
): TagPillColors & { isCustomColor: boolean } {
  if (!color) {
    return {
      color: themeStyle.noteTagText,
      backgroundColor: themeStyle.noteTagBackground,
      backgroundColorHovered: themeStyle.noteTagBackgroundHover,
      isCustomColor: false,
    };
  }

  // Soft "tinted" pill: a faint wash of the tag's colour as the background
  // and a deepened version of the colour as the label. Mixing the label
  // towards the theme's page text keeps it readable in light and dark
  // themes alike (dark ink in light themes, light ink in dark themes).
  return {
    color: `color-mix(in srgb, ${color} 62%, ${themeStyle.pageText})`,
    backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
    backgroundColorHovered: `color-mix(in srgb, ${color} 28%, transparent)`,
    isCustomColor: true,
  };
}
