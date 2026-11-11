import { MAP_COLORS } from '../../config';
import { drawTrees, fillRect, randomTree } from '../paint';
import type { ZonePainter } from './types';

/** Floresta: chão escuro coberto de copas de árvores. */

const TREE_AREA_PX = 300;
const TREE_RADIUS = { min: 7, max: 15 };

export const paintForest: ZonePainter = (ctx, area, rng) => {
  fillRect(ctx, area, MAP_COLORS.forestFloor);
  const count = Math.round((area.width * area.height) / TREE_AREA_PX);
  const trees = Array.from({ length: count }, () => randomTree(rng, area, TREE_RADIUS));
  drawTrees(ctx, trees);
};
