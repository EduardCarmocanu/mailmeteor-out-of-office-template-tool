const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value)

export function useEmail() {
  return { isValidEmail }
}
