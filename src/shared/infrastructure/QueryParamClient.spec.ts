import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryParamClient } from './QueryParamClient.ts'

const currentUrl = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`

describe('queryParamClient', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getAll', () => {
    it('returns the query parameters as a record', () => {
      window.history.replaceState(null, '', '/?name=Jordan%20Lee&tone=funny')

      expect(queryParamClient.getAll()).toEqual({ name: 'Jordan Lee', tone: 'funny' })
    })

    it('returns an empty record when there is no query string', () => {
      expect(queryParamClient.getAll()).toEqual({})
    })
  })

  describe('update', () => {
    it('sets the given query parameters', () => {
      queryParamClient.update({ name: 'Jordan Lee', tone: 'funny' })

      expect(queryParamClient.getAll()).toEqual({ name: 'Jordan Lee', tone: 'funny' })
    })

    it('overwrites existing query parameters', () => {
      window.history.replaceState(null, '', '/?tone=formal')

      queryParamClient.update({ tone: 'short' })

      expect(queryParamClient.getAll()).toEqual({ tone: 'short' })
    })

    it('removes the query parameters set to null', () => {
      window.history.replaceState(null, '', '/?name=Jordan&tone=funny')

      queryParamClient.update({ name: null })

      expect(queryParamClient.getAll()).toEqual({ tone: 'funny' })
    })

    it('keeps the path, the hash and the query parameters it was not given', () => {
      window.history.replaceState(null, '', '/editor?utm_source=newsletter#preview')

      queryParamClient.update({ tone: 'funny' })

      expect(currentUrl()).toBe('/editor?utm_source=newsletter&tone=funny#preview')
    })

    it('replaces the current history entry instead of adding one', () => {
      const historyLength = window.history.length

      queryParamClient.update({ tone: 'funny' })

      expect(window.history.length).toBe(historyLength)
    })

    it('does not touch the history when the URL would not change', () => {
      window.history.replaceState(null, '', '/?tone=funny')
      const replaceState = vi.spyOn(window.history, 'replaceState')

      queryParamClient.update({ tone: 'funny', name: null })

      expect(replaceState).not.toHaveBeenCalled()
    })
  })
})
