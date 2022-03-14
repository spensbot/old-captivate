import { initModulation, paramsList, Param, Modulation } from './params'
import { Lfo, GetValue, GetRamp } from './oscillator'
import { LightScene_t } from './Scenes'
import { clampNormalized } from './util'
import { mapUndefinedParamsToDefault } from './params'

export interface Modulator {
  lfo: Lfo
  modulation: Modulation
  splitModulations: Modulation[]
}

export function initModulator(splitCount: number): Modulator {
  return {
    lfo: GetRamp(),
    modulation: initModulation(),
    splitModulations: Array(splitCount)
      .fill(0)
      .map(() => ({})),
  }
}

export function modulateParams(beats: number, scene: LightScene_t) {
  const modulatedParams = mapUndefinedParamsToDefault(scene.baseParams)
  const mappedParams = mapUndefinedParamsToDefault(scene.baseParams)

  const modValues = scene.modulators.map((modulator) => {
    return GetValue(modulator.lfo, beats)
  })

  paramsList.forEach((paramKey) => {
    modulatedParams[paramKey] = modulateParam(
      mappedParams[paramKey],
      scene.modulators,
      modValues,
      paramKey
    )
  })

  return modulatedParams
}

function modulateParam(
  baseParam: number,
  modulators: Modulator[],
  modValues: number[],
  paramKey: Param
) {
  return clampNormalized(
    modulators.reduce((sum: number, modulator, index) => {
      const modAmount = modulator.modulation[paramKey]
      if (modAmount === undefined) {
        return sum
      } else {
        const modAmountMapped = modAmount * 2 - 1 // from -1 to 1
        const modValueMapped = modValues[index] * 2 - 1 // from -1 to 1
        const addedModulation = (modAmountMapped * modValueMapped) / 2 // from -0.5 to -0.5
        return sum + addedModulation
      }
    }, baseParam)
  )
}
