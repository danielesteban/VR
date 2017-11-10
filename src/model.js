import { mat3 } from 'gl-matrix';
import * as Models from './models';

class Model {
  constructor(renderer, id) {
    const { GL } = renderer;

    const {
      heightfield,
      index,
      shader,
      type,
      vertices,
    } = Models[id];

    this.heightfield = heightfield;
    this.normalView = mat3.create();
    this.renderer = renderer;
    this.shader = renderer.getShader(shader);
    this.type = type;

    this.VAO = GL.extensions.VAO.createVertexArrayOES();
    GL.extensions.VAO.bindVertexArrayOES(this.VAO);

    this.vertices = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertices);
    GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.STATIC_DRAW);

    switch (type) {
      case 'points':
        this.count = vertices.length / 5;

        GL.vertexAttribPointer(
          this.shader.attribute('position'), 3, GL.FLOAT, false,
          Float32Array.BYTES_PER_ELEMENT * 5, 0
        );
        GL.enableVertexAttribArray(this.shader.attribute('position'));
        GL.vertexAttribPointer(
          this.shader.attribute('size'), 1, GL.FLOAT, false,
          Float32Array.BYTES_PER_ELEMENT * 5, Float32Array.BYTES_PER_ELEMENT * 3
        );
        GL.enableVertexAttribArray(this.shader.attribute('size'));
        GL.vertexAttribPointer(
          this.shader.attribute('alpha'), 1, GL.FLOAT, false,
          Float32Array.BYTES_PER_ELEMENT * 5, Float32Array.BYTES_PER_ELEMENT * 4
        );
        GL.enableVertexAttribArray(this.shader.attribute('alpha'));
        break;
      case 'triangles':
        {
          this.count = index.length;
          this.index = GL.createBuffer();
          GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.index);
          GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, index, GL.STATIC_DRAW);
          const hasNormal = this.shader.attribute('normal') !== -1;
          const stride = hasNormal ? 6 : 3;
          GL.vertexAttribPointer(
            this.shader.attribute('position'), 3, GL.FLOAT, false,
            Float32Array.BYTES_PER_ELEMENT * stride, 0
          );
          GL.enableVertexAttribArray(this.shader.attribute('position'));
          if (hasNormal) {
            GL.vertexAttribPointer(
              this.shader.attribute('normal'), 3, GL.FLOAT, false,
              Float32Array.BYTES_PER_ELEMENT * stride, Float32Array.BYTES_PER_ELEMENT * 3
            );
            GL.enableVertexAttribArray(this.shader.attribute('normal'));
          }
        }
        break;
      default:
    }

    GL.extensions.VAO.bindVertexArrayOES(null);
  }
  render({
    albedo,
    view,
    projection,
  }) {
    const {
      normalView,
      renderer: { GL },
      shader,
      type,
    } = this;

    GL.useProgram(shader.program);
    GL.uniformMatrix4fv(shader.uniform('projection'), false, projection);
    GL.uniformMatrix4fv(shader.uniform('view'), false, view);
    GL.extensions.VAO.bindVertexArrayOES(this.VAO);

    if (shader.uniform('normalView') !== false) {
      mat3.normalFromMat4(normalView, view);
      GL.uniformMatrix3fv(shader.uniform('normalView'), false, normalView);
    }

    if (albedo && shader.uniform('albedo') !== false) {
      GL.uniform3fv(shader.uniform('albedo'), albedo);
    }

    switch (type) {
      case 'points':
        GL.enable(GL.BLEND);
        GL.drawArrays(GL.POINTS, 0, this.count);
        GL.disable(GL.BLEND);
        break;
      case 'triangles':
        GL.drawElements(GL.TRIANGLES, this.count, GL.UNSIGNED_INT, 0);
        break;
      default:
    }

    GL.extensions.VAO.bindVertexArrayOES(null);
  }
}

export default Model;
