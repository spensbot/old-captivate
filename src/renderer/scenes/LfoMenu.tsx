import React from 'react'
import { LfoShape } from '../../engine/oscillator'
import { useDispatch } from 'react-redux'
import { useTypedSelector } from '../redux/store'
import {
  resetModulator,
  removeModulator,
  setModulatorShape,
} from '../redux/scenesSlice'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore'
import LfoPeriod from './LfoPeriod'
import Divider from '../base/Divider'

type Props = {
  index: number
}

export default function LfoMenu({ index }: Props) {
  const dispatch = useDispatch()

  const lfo = useTypedSelector(
    (state) => state.scenes.byId[state.scenes.active].modulators[index].lfo
  )

  return (
    <div
      style={{
        paddingLeft: '0.3rem',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0005',
      }}
    >
      <Select
        labelId="lfo-shape-select-label"
        id="lfo-shape-select"
        value={lfo.shape}
        size="small"
        variant="standard"
        onChange={(e) =>
          dispatch(setModulatorShape({ index: index, shape: e.target.value }))
        }
      >
        <MenuItem value={LfoShape.Ramp}>Ramp</MenuItem>
        <MenuItem value={LfoShape.Sin}>Sin</MenuItem>
      </Select>
      <div style={{ flex: '1 0 0' }} />
      <LfoPeriod index={index} />
      <Divider vertical color={'#fff3'} />
      <IconButton
        color="primary"
        aria-label="delete"
        size="small"
        onClick={() => dispatch(resetModulator(index))}
      >
        <SettingsBackupRestoreIcon />
      </IconButton>
      <Divider vertical color={'#fff3'} />
      <IconButton
        color="primary"
        aria-label="delete"
        size="small"
        onClick={() => dispatch(removeModulator(index))}
      >
        <CloseIcon />
      </IconButton>
    </div>
  )
}