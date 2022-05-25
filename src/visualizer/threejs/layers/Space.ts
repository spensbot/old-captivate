import * as THREE from 'three'
import { Vector3 } from 'three'
import LayerBase from './LayerBase'
import UpdateResource from '../UpdateResource'
import { randomRanged } from '../../../shared/util'
import { snapToMultipleOf2, getMultiplier } from '../util/util'
// import { Range } from 'types/baseTypes'

const MIN_XY = -2000
const MAX_XY = 2000
const MIN_Z = -2000
const MAX_Z = 100

export interface SpaceConfig {
  type: 'Space'
  obeyEpicness: number
  count: number
  randomize: number
  shape: 'Box' | 'Sphere' | 'Cylinder'
  width: number
  height: number
  speed: number
}

export const spaceShapes: SpaceConfig['shape'][] = ['Box', 'Cylinder', 'Sphere']

export function initSpaceConfig(): SpaceConfig {
  return {
    type: 'Space',
    obeyEpicness: 0.5,
    count: 5000,
    randomize: 0,
    shape: 'Cylinder',
    width: 3,
    height: 100,
    speed: 1,
  }
}

const dummy = new THREE.Object3D()

export default class Space extends LayerBase {
  mat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  stars = new THREE.InstancedMesh(undefined, undefined, 0)
  positions: Vector3[] = []
  config: SpaceConfig

  constructor(config: SpaceConfig) {
    super()
    this.config = config
    this.reset(this.config.count)
    this.scene.fog = new THREE.FogExp2(0x000000, 0.0008)
  }

  update(res: UpdateResource): void {
    let epicnessMultiplier = getMultiplier(
      res.scene.epicness,
      this.config.obeyEpicness
    )

    let count = Math.floor(this.config.count * epicnessMultiplier)
    let randomize = this.config.randomize * epicnessMultiplier
    let period = 0.25 / randomize
    let snappedPeriod = snapToMultipleOf2(period)
    let speed = this.config.speed * epicnessMultiplier

    if (this.stars.count !== count) {
      this.prep_for_reset()
      this.reset(count)
    }

    if (res.isNewPeriod(snappedPeriod)) {
      this.positions = this.positions.map(
        (_) => new Vector3(randomXY(), randomXY(), randomZ())
      )
    }

    this.positions.forEach((p, i) => {
      // p.z += 10
      p.z += speed * res.dt
      if (p.z > MAX_Z) {
        p.z = MIN_Z
        p.x = randomXY()
        p.y = randomXY()
      }
      dummy.position.set(p.x, p.y, p.z)
      dummy.updateMatrix()
      this.stars.setMatrixAt(i, dummy.matrix)
    })

    this.stars.instanceMatrix.needsUpdate = true
  }

  reset(count: number) {
    this.stars = new THREE.InstancedMesh(
      makeGeometry(this.config),
      this.mat,
      count
    )
    this.stars.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.scene.add(this.stars)

    while (this.positions.length < count) {
      this.positions.push(new Vector3(randomXY(), randomXY(), randomZ()))
    }
    this.positions.splice(count - 1)
  }

  prep_for_reset() {
    this.scene.remove(this.stars)
    this.stars.geometry.dispose()
    this.stars.dispose()
  }

  dispose() {
    this.mat.dispose()
    this.stars.geometry.dispose()
    this.stars.dispose()
  }
}

function makeGeometry(config: SpaceConfig) {
  switch (config.shape) {
    case 'Box':
      return new THREE.BoxGeometry(config.width, config.height, config.width)
    case 'Cylinder':
      let geo = new THREE.CylinderGeometry(
        config.width,
        config.width,
        config.height
      )
      geo.rotateX(Math.PI / 2)
      return geo
    case 'Sphere':
      return new THREE.SphereGeometry(config.width)
  }
}

function randomZ() {
  return randomRanged(MIN_Z, MAX_Z)
}

function randomXY() {
  return randomRanged(MIN_XY, MAX_XY)
}
