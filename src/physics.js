import CANNON from 'cannon';

class Physics {
  constructor() {
    const world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;
    const solver = new CANNON.GSSolver();
    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;
    solver.iterations = 7;
    solver.tolerance = 0.1;
    world.solver = new CANNON.SplitSolver(solver);
    world.gravity.set(0, -10, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.broadphase.useBoundingBoxes = true;
    this.world = world;
    this.bodies = [];
    this.shapes = [];

    const groundShape = this.getShape({ shape: 'box', extents: [32, 1, 32] });
    const ground = new CANNON.Body({ mass: 0, collisionFilterGroup: 1, collisionFilterMask: 2 });
    ground.addShape(groundShape);
    ground.position.set(0, -0.5, 0);
    world.addBody(ground);
    this.ground = ground;
  }
  addBody(physics, position, rotation) {
    const { world } = this;
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
      collisionFilterGroup = 1;
      collisionFilterMask = 2;
    } else {
      collisionFilterGroup = 2;
      collisionFilterMask = 1 | 2;
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
      type,
    });
    body.addShape(this.getShape(physics));
    body.position.set(position[0], position[1], position[2]);
    body.quaternion.set(rotation[0], rotation[1], rotation[2], rotation[3]);
    world.addBody(body);
    this.bodies.push(body);
    return body;
  }
  addConstraint({
    body,
    joint,
    pivot,
    point,
  }) {
    const { world } = this;
    const constraint = new CANNON.PointToPointConstraint(
      body,
      body.quaternion.inverse().vmult(new CANNON.Vec3(
        point.x,
        point.y,
        point.z
      ).vsub(body.position)),
      joint,
      new CANNON.Vec3(
        pivot[0],
        pivot[1],
        pivot[2]
      )
    );
    world.addConstraint(constraint);
    return constraint;
  }
  getClosestBody({ from, to }) {
    const { world } = this;
    const ray = new CANNON.Ray(
      new CANNON.Vec3(from[0], from[1], from[2]),
      new CANNON.Vec3(to[0], to[1], to[2])
    );
    ray.intersectWorld(world, {
      collisionFilterGroup: 2,
      collisionFilterMask: 2,
      mode: CANNON.Ray.CLOSEST,
      skipBackfaces: true,
    });
    return ray.result.hasHit ? ray.result : false;
  }
  getGroundPoint({ from, to }) {
    const ray = new CANNON.Ray(
      new CANNON.Vec3(from[0], from[1], from[2]),
      new CANNON.Vec3(to[0], to[1], to[2])
    );
    const result = new CANNON.RaycastResult();
    ray.intersectBody(this.ground, result);
    return result.hasHit ? result : false;
  }
  getShape({ shape, extents }) {
    const { shapes } = this;
    const id = `${shape}:${extents.join(',')}`;
    if (!shapes[id]) {
      switch (shape) {
        case 'box':
          shapes[id] = new CANNON.Box(
            new CANNON.Vec3(extents[0] * 0.5, extents[1] * 0.5, extents[2] * 0.5)
          );
          break;
        default:
      }
    }
    return shapes[id];
  }
  removeConstraint(constraint) {
    const { world } = this;
    world.removeConstraint(constraint);
  }
  step(delta) {
    const { world } = this;
    world.step(delta);
  }
}

export default Physics;
