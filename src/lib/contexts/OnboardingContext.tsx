'use client'

/**
 * ONBOARDING CONTEXT
 * ------------------
 * State management for the progressive onboarding flow
 */

import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import {
  OnboardingState,
  DEFAULT_ONBOARDING_STATE,
  EntityType,
  SizeBand,
  Stage,
  BudgetRange,
  GrantSizePreference,
  TimelinePreference,
  ComplexityPreference,
} from '@/lib/types/onboarding'

// Union of all possible grant preference values
type GrantPreferenceValue = GrantSizePreference | TimelinePreference | ComplexityPreference | null

// Actions
type OnboardingAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_ENTITY_TYPE'; entityType: EntityType }
  | { type: 'SET_GEOGRAPHY'; country: string; state: string | null }
  | { type: 'SET_INDUSTRY_TAGS'; industryTags: string[] }
  | { type: 'TOGGLE_INDUSTRY_TAG'; tag: string }
  | { type: 'SET_COMPANY_NAME'; companyName: string }
  | { type: 'SET_SIZE_BAND'; sizeBand: SizeBand }
  | { type: 'SET_STAGE'; stage: Stage }
  | { type: 'SET_BUDGET'; budget: BudgetRange }
  | { type: 'TOGGLE_GOAL'; goal: string }
  | { type: 'SET_INDUSTRY_ATTRIBUTE'; key: string; value: string | string[] | boolean }
  | { type: 'TOGGLE_CERTIFICATION'; certification: string }
  | { type: 'SET_GRANT_PREFERENCE'; key: keyof OnboardingState['grantPreferences']; value: GrantPreferenceValue }
  | { type: 'LOAD_STATE'; state: OnboardingState }
  | { type: 'RESET' }

// Reducer
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step }

    case 'SET_ENTITY_TYPE':
      return { ...state, entityType: action.entityType }

    case 'SET_GEOGRAPHY':
      return { ...state, country: action.country, state: action.state }

    case 'SET_INDUSTRY_TAGS':
      return { ...state, industryTags: action.industryTags }

    case 'TOGGLE_INDUSTRY_TAG':
      const tags = state.industryTags.includes(action.tag)
        ? state.industryTags.filter(t => t !== action.tag)
        : [...state.industryTags, action.tag]
      return { ...state, industryTags: tags }

    case 'SET_COMPANY_NAME':
      return { ...state, companyName: action.companyName }

    case 'SET_SIZE_BAND':
      return { ...state, sizeBand: action.sizeBand }

    case 'SET_STAGE':
      return { ...state, stage: action.stage }

    case 'SET_BUDGET':
      return { ...state, annualBudget: action.budget }

    case 'TOGGLE_GOAL':
      const goals = state.goals.includes(action.goal)
        ? state.goals.filter(g => g !== action.goal)
        : state.goals.length < 5
        ? [...state.goals, action.goal]
        : state.goals
      return { ...state, goals }

    case 'SET_INDUSTRY_ATTRIBUTE':
      return {
        ...state,
        industryAttributes: {
          ...state.industryAttributes,
          [action.key]: action.value,
        },
      }

    case 'TOGGLE_CERTIFICATION':
      const certs = state.certifications.includes(action.certification)
        ? state.certifications.filter(c => c !== action.certification)
        : [...state.certifications, action.certification]
      return { ...state, certifications: certs }

    case 'SET_GRANT_PREFERENCE':
      return {
        ...state,
        grantPreferences: {
          ...state.grantPreferences,
          [action.key]: action.value,
        },
      }

    case 'LOAD_STATE':
      return action.state

    case 'RESET':
      return DEFAULT_ONBOARDING_STATE

    default:
      return state
  }
}

// Context type
interface OnboardingContextType {
  state: OnboardingState
  // Navigation
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  // Step 1
  setEntityType: (entityType: EntityType) => void
  setGeography: (country: string, state: string | null) => void
  // Step 2
  setIndustryTags: (tags: string[]) => void
  toggleIndustryTag: (tag: string) => void
  // Step 3
  setCompanyName: (name: string) => void
  setSizeBand: (sizeBand: SizeBand) => void
  setStage: (stage: Stage) => void
  setBudget: (budget: BudgetRange) => void
  // Step 4
  toggleGoal: (goal: string) => void
  setIndustryAttribute: (key: string, value: string | string[] | boolean) => void
  // Step 5
  toggleCertification: (certification: string) => void
  setGrantPreference: (key: keyof OnboardingState['grantPreferences'], value: GrantPreferenceValue) => void
  // Utilities
  loadState: (state: OnboardingState) => void
  reset: () => void
  canProceed: () => boolean
  getProgress: () => number
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

// Provider component
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, DEFAULT_ONBOARDING_STATE)

  // Navigation
  const goToStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step })
  }, [])

  const nextStep = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: Math.min(state.currentStep + 1, 5) })
  }, [state.currentStep])

  const prevStep = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: Math.max(state.currentStep - 1, 1) })
  }, [state.currentStep])

  // Step 1 setters
  const setEntityType = useCallback((entityType: EntityType) => {
    dispatch({ type: 'SET_ENTITY_TYPE', entityType })
  }, [])

  const setGeography = useCallback((country: string, stateValue: string | null) => {
    dispatch({ type: 'SET_GEOGRAPHY', country, state: stateValue })
  }, [])

  // Step 2 setters
  const setIndustryTags = useCallback((industryTags: string[]) => {
    dispatch({ type: 'SET_INDUSTRY_TAGS', industryTags })
  }, [])

  const toggleIndustryTag = useCallback((tag: string) => {
    dispatch({ type: 'TOGGLE_INDUSTRY_TAG', tag })
  }, [])

  // Step 3 setters
  const setCompanyName = useCallback((companyName: string) => {
    dispatch({ type: 'SET_COMPANY_NAME', companyName })
  }, [])

  const setSizeBand = useCallback((sizeBand: SizeBand) => {
    dispatch({ type: 'SET_SIZE_BAND', sizeBand })
  }, [])

  const setStage = useCallback((stage: Stage) => {
    dispatch({ type: 'SET_STAGE', stage })
  }, [])

  const setBudget = useCallback((budget: BudgetRange) => {
    dispatch({ type: 'SET_BUDGET', budget })
  }, [])

  // Step 4 setters
  const toggleGoal = useCallback((goal: string) => {
    dispatch({ type: 'TOGGLE_GOAL', goal })
  }, [])

  const setIndustryAttribute = useCallback((key: string, value: string | string[] | boolean) => {
    dispatch({ type: 'SET_INDUSTRY_ATTRIBUTE', key, value })
  }, [])

  // Step 5 setters
  const toggleCertification = useCallback((certification: string) => {
    dispatch({ type: 'TOGGLE_CERTIFICATION', certification })
  }, [])

  const setGrantPreference = useCallback((key: keyof OnboardingState['grantPreferences'], value: GrantPreferenceValue) => {
    dispatch({ type: 'SET_GRANT_PREFERENCE', key, value })
  }, [])

  // Utilities
  const loadState = useCallback((newState: OnboardingState) => {
    dispatch({ type: 'LOAD_STATE', state: newState })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  // Check if current step is complete enough to proceed
  const canProceed = useCallback(() => {
    switch (state.currentStep) {
      case 1:
        return state.entityType !== null
      case 2:
        return state.industryTags.length > 0
      case 3:
        // Size/budget questions are optional
        return true
      case 4:
        // At least 1 funding goal required
        return state.goals.length > 0
      case 5:
        // Preferences are optional
        return true
      default:
        return true
    }
  }, [state])

  // Calculate overall progress percentage
  const getProgress = useCallback(() => {
    let completed = 0
    const total = 5

    if (state.entityType) completed++
    if (state.industryTags.length > 0) completed++
    if (state.sizeBand || state.annualBudget || state.companyName) completed++
    if (state.goals.length > 0) completed++
    if (state.grantPreferences.preferredSize || state.grantPreferences.timeline || state.certifications.length > 0) completed++

    return Math.round((completed / total) * 100)
  }, [state])

  const value: OnboardingContextType = {
    state,
    goToStep,
    nextStep,
    prevStep,
    setEntityType,
    setGeography,
    setIndustryTags,
    toggleIndustryTag,
    setCompanyName,
    setSizeBand,
    setStage,
    setBudget,
    toggleGoal,
    setIndustryAttribute,
    toggleCertification,
    setGrantPreference,
    loadState,
    reset,
    canProceed,
    getProgress,
  }

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

// Custom hook for consuming context
export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
