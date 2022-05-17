import cloneDeep from 'lodash.clonedeep'
import React, { useEffect, useState } from 'react'
import Select from 'renderer/base/Select'
import { LayerConfig } from '../../visualizer/threejs/layers/LayerConfig'
import {
  objectFits,
  orderTypes,
} from '../../visualizer/threejs/layers/LocalMedia'
import { fontTypes } from '../../visualizer/threejs/fonts/FontType'
import { Button, TextField } from '@mui/material'
import makeControls from './makeControls'

interface Props {
  config: LayerConfig
  onChange: (newConfig: LayerConfig) => void
}

export default function LayerEditor({ config, onChange }: Props) {
  let [edit, setEdit] = useState(cloneDeep(config))
  console.log('render')

  useEffect(() => {
    setEdit(config)
  }, [config])

  return (
    <>
      <SpecificFields config={edit} onChange={setEdit} />
      <Button onClick={() => onChange(edit)}>Apply</Button>
    </>
  )
}

function SpecificFields({ config, onChange }: Props) {
  let {
    makeOnChange,
    makeSlider,
    makeSwitch,
    makeNumberInput,
    makeTextInput,
    makeSelect,
  } = makeControls(config, onChange)

  switch (config.type) {
    case 'CubeSphere':
      return (
        <>
          {makeSlider('Quantity', config, 'quantity', 1, 1000, 1)}
          {makeSlider('Size', config, 'size', 0, 5, 0.01)}
        </>
      )
    case 'Cubes':
      return <></>
    case 'LocalMedia':
      return (
        <>
          {makeSelect('Fit', config, objectFits, 'objectFit')}
          {makeSelect('Order', config, orderTypes, 'order')}
        </>
      )
    case 'Spheres':
      return (
        <>
          {makeSlider('Quantity', config, 'quantity', 1, 1000, 1)}
          {makeSlider('Radius', config, 'radius', 0, 5, 0.01)}
        </>
      )
    case 'TextParticles':
      config.fontType
      config.text
      config.textSize
      config.particleCount
      return (
        <>
          {makeTextInput('Text', config, 'text')}
          {makeSelect('Font', config, fontTypes, 'fontType')}
          {makeNumberInput('Font Size', config, 'textSize')}
          {makeNumberInput('Particle Count', config, 'particleCount')}
        </>
      )
    case 'TextSpin':
      return (
        <>
          {makeSlider('Size', config, 'size', 0, 5, 0.01)}
          {makeTextInput('Text', config, 'text')}
        </>
      )
    default:
      return <></>
  }
}
