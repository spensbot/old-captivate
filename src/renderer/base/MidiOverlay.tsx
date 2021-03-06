import styled from 'styled-components'
import { getActionID, MidiAction } from '../redux/deviceState'
import {
  midiListen,
  midiSetSliderAction,
  removeMidiAction,
} from '../redux/controlSlice'
import { useDeviceSelector } from '../redux/store'
import { useDispatch } from 'react-redux'
import DraggableNumber from './DraggableNumber'
import Button from './Button'

interface Props {
  children?: React.ReactNode
  action: MidiAction
  style?: React.CSSProperties
}

export function ButtonMidiOverlay({ children, action, style }: Props) {
  const isEditing = useDeviceSelector((state) => state.isEditing)
  const controlledAction = useDeviceSelector((state) => {
    return state.buttonActions[getActionID(action)] || null
  })
  const isListening = useDeviceSelector((state) => {
    if (!state.listening) return false
    return getActionID(state.listening) === getActionID(action)
  })
  const dispatch = useDispatch()

  const onClick = () => {
    dispatch(midiListen(action))
  }

  return (
    <Root style={style}>
      {children}
      {isEditing && (
        <Overlay selected={isListening} onClick={onClick}>
          {controlledAction && (
            <>
              {controlledAction.inputID}
              <X action={action} />
            </>
          )}
        </Overlay>
      )}
    </Root>
  )
}

export function SliderMidiOverlay({ children, action, style }: Props) {
  const isEditing = useDeviceSelector((state) => state.isEditing)
  const controlledAction = useDeviceSelector((state) => {
    return state.sliderActions[getActionID(action)] || null
  })
  const isListening = useDeviceSelector((state) => {
    if (!state.listening) return false
    return getActionID(state.listening) === getActionID(action)
  })
  const dispatch = useDispatch()

  const onClick = () => {
    dispatch(midiListen(action))
  }

  const onChangeMin = (newVal: number) => {
    dispatch(
      midiSetSliderAction({
        ...controlledAction,
        options: {
          ...controlledAction.options,
          min: newVal,
        },
      })
    )
  }

  const onChangeMax = (newVal: number) => {
    dispatch(
      midiSetSliderAction({
        ...controlledAction,
        options: {
          ...controlledAction.options,
          max: newVal,
        },
      })
    )
  }

  const onClickMode = () => {
    dispatch(
      midiSetSliderAction({
        ...controlledAction,
        options: {
          ...controlledAction.options,
          mode: controlledAction.options.mode === 'hold' ? 'toggle' : 'hold',
        },
      })
    )
  }

  const onClickMode_cc = () => {
    dispatch(
      midiSetSliderAction({
        ...controlledAction,
        options: {
          ...controlledAction.options,
          mode:
            controlledAction.options.mode === 'relative'
              ? 'absolute'
              : 'relative',
        },
      })
    )
  }

  const onClickValue = (value: 'max' | 'velocity') => () => {
    dispatch(
      midiSetSliderAction({
        ...controlledAction,
        options: {
          ...controlledAction.options,
          value: value === 'max' ? 'velocity' : 'max',
        },
      })
    )
  }

  const minMaxStyle: React.CSSProperties = {
    padding: '0.1rem 0.2rem',
    margin: '0.2rem',
    color: 'white',
    backgroundColor: '#0009',
  }

  return (
    <Root style={style}>
      {children}
      {isEditing && (
        <Overlay selected={isListening} onClick={onClick}>
          <Wrapper>
            {controlledAction && (
              <>
                {controlledAction.inputID}
                <X action={action} />
                <MinMax>
                  <DraggableNumber
                    type="continuous"
                    style={minMaxStyle}
                    value={controlledAction.options.min}
                    min={0}
                    max={controlledAction.options.max}
                    onChange={onChangeMin}
                    noArrows
                  />
                  <DraggableNumber
                    type="continuous"
                    style={minMaxStyle}
                    value={controlledAction.options.max}
                    min={controlledAction.options.min}
                    max={1}
                    onChange={onChangeMax}
                    noArrows
                  />
                </MinMax>
                {controlledAction.options.type === 'note' && (
                  <>
                    <Button
                      fontSize="0.8rem"
                      label={controlledAction.options.mode}
                      onClick={onClickMode}
                    />
                    <Button
                      fontSize="0.8rem"
                      label={controlledAction.options.value}
                      onClick={onClickValue(controlledAction.options.value)}
                    />
                  </>
                )}
                {controlledAction.options.type === 'cc' && (
                  <Button
                    fontSize="0.8rem"
                    label={controlledAction.options.mode}
                    onClick={onClickMode_cc}
                  />
                )}
              </>
            )}
          </Wrapper>
        </Overlay>
      )}
    </Root>
  )
}

const Root = styled.div`
  position: relative;
`

const Overlay = styled.div<{ selected: boolean }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  cursor: pointer;
  border: ${(props) => props.selected && '2px solid white'};
  background: #56fd56b7;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  align-content: center;
  color: black;
`

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  align-content: center;
  background-color: #56fd56b7;
`

const MinMax = styled.div`
  display: flex;
  flex-wrap: wrap-reverse;
  font-size: 0.75rem;
  justify-content: center;
`

function X({ action }: { action: MidiAction }) {
  const dispatch = useDispatch()
  const onClick = () => dispatch(removeMidiAction(action))
  return (
    <div onClick={onClick} style={{ cursor: 'pointer', marginLeft: '0.5rem' }}>
      X
    </div>
  )
}
