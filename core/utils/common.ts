export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ');
}

export const IS_DEVELOPMENT =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';