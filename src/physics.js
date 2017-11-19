import CANNON from 'cannon';

class Physics {
  static applyImpulse(body, impulse) {
    body.applyImpulse(new CANNON.Vec3(
      impulse[0],
      impulse[1],
      impulse[2],
    ), new CANNON.Vec3(0, 0, 0));
  }
  constructor() {
    this.bodies = [];
    this.constraints = [];
    this.ray = new CANNON.Ray();
    this.shapes = [];
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.8, 0);
  }
  addBody({
    physics,
    position,
    rotation,
  }) {
    const { bodies, world } = this;
    let type = physics.mass <= 0.0 ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC;
    switch (physics.type) {
      case 'dynamic':
        type = CANNON.Body.DYNAMIC;
        break;
      case 'kinematic':
        type = CANNON.Body.KINEMATIC;
        break;
      case 'static':
        type = CANNON.Body.STATIC;
        break;
      default:
    }
    let collisionFilterGroup;
    let collisionFilterMask;
    if (type === CANNON.Body.STATIC) {
      collisionFilterGroup = 2;
      collisionFilterMask = 4;
    } else {
      collisionFilterGroup = 4;
      collisionFilterMask = 1 | 2 | 4;
    }
    if (physics.collisionFilterGroup !== undefined) {
      // eslint-disable-next-line prefer-destructuring
      collisionFilterGroup = physics.collisionFilterGroup;
    }
    if (physics.collisionFilterMask !== undefined) {
      // eslint-disable-next-line prefer-destructuring
      collisionFilterMask = physics.collisionFilterMask;
    }
    const body = new CANNON.Body({
      collisionFilterGroup,
      collisionFilterMask,
      mass: physics.mass,
      shape: this.getShape(physics),
      type,
    });
    body.position.set(position[0], position[1], position[2]);
    body.quaternion.set(rotation[0], rotation[1], rotation[2], rotation[3]);
    world.addBody(body);
    bodies.push(body);
    physics.body = body; // eslint-disable-line no-param-reassign
  }
  addConstraint({
    axisA,
    axisB,
    bodyA,
    bodyB,
    pivotA,
    pivotB,
    type,
  }) {
    const { constraints, world } = this;
    let constraint;
    switch (type) {
      case 'hinge':
        constraint = new CANNON.HingeConstraint(
          bodyA,
          bodyB,
          {
            axisA: axisA ? new CANNON.Vec3(axisA[0], axisA[1], axisA[2]) : axisA,
            axisB: axisB ? new CANNON.Vec3(axisB[0], axisB[1], axisB[2]) : axisB,
            pivotA: pivotA ? new CANNON.Vec3(pivotA[0], pivotA[1], pivotA[2]) : pivotA,
            pivotB: pivotB ? new CANNON.Vec3(pivotB[0], pivotB[1], pivotB[2]) : pivotB,
          }
        );
        break;
      case 'point':
        constraint = new CANNON.PointToPointConstraint(
          bodyA,
          pivotA ? new CANNON.Vec3(pivotA[0], pivotA[1], pivotA[2]) : pivotA,
          bodyB,
          pivotB ? new CANNON.Vec3(pivotB[0], pivotB[1], pivotB[2]) : pivotB,
        );
        break;
      default:
    }
    world.addConstraint(constraint);
    constraints.push(constraint);
    return constraint;
  }
  getClosestBody({
    collisionFilterMask,
    from,
    to,
  }) {
    const { world, ray } = this;
    ray.intersectWorld(world, {
      collisionFilterMask: collisionFilterMask || 2,
      from: new CANNON.Vec3(from[0], from[1], from[2]),
      mode: CANNON.Ray.CLOSEST,
      skipBackfaces: true,
      to: new CANNON.Vec3(to[0], to[1], to[2]),
    });
    return ray.result.hasHit ? ray.result : false;
  }
  getShape({ shape, extents, heightfield }) {
    const { shapes } = this;
    const id = `${shape}:${(extents || []).join(',')}`;
    if (!shapes[id]) {
      switch (shape) {
        case 'box':
          shapes[id] = new CANNON.Box(
            new CANNON.Vec3(extents[0] * 0.5, extents[1] * 0.5, extents[2] * 0.5)
          );
          break;
        case 'heightfield':
          shapes[id] = new CANNON.Heightfield(
            heightfield,
            { elementSize: 1 }
          );
          break;
        case 'sphere':
          shapes[id] = new CANNON.Sphere(
            extents[0]
          );
          break;
        default:
      }
    }
    return shapes[id];
  }
  removeBody(body) {
    const { bodies, world } = this;
    world.removeBody(body);
    bodies.splice(bodies.findIndex(b => (b === body)), 1);
  }
  removeConstraint(constraint) {
    const { constraints, world } = this;
    world.removeConstraint(constraint);
    constraints.splice(constraints.findIndex(c => (c === constraint)), 1);
  }
  step(delta) {
    const { world } = this;
    world.step(1 / 60, delta);
  }
}

export default Physics;
