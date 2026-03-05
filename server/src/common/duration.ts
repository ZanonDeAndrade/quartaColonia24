import { AppError } from './errors.js';

const pattern = /^(\d+)([smhd])$/i;

export const parseDurationToMs = (value: string): number => {
  const match = value.match(pattern);
  if (!match) {
    throw new AppError('Invalid duration format. Use values like 15m, 12h, 30d.', 500, 'INVALID_DURATION');
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === 's') return amount * 1000;
  if (unit === 'm') return amount * 60 * 1000;
  if (unit === 'h') return amount * 60 * 60 * 1000;
  return amount * 24 * 60 * 60 * 1000;
};
