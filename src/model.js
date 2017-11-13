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
        this.count = vertices.length / 4;

        GL.vertexAttribPointer(
          this.shader.attribute('position'), 3, GL.FLOAT, false,
          Float32Array.BYTES_PER_ELEMENT * 4, 0
        );
        GL.enableVertexAttribArray(this.shader.attribute('position'));
        GL.vertexAttribPointer(
          this.shader.attribute('alpha'), 1, GL.FLOAT, false,
          Float32Array.BYTES_PER_ELEMENT * 4, Float32Array.BYTES_PER_ELEMENT * 3
        );
        GL.enableVertexAttribArray(this.shader.attribute('alpha'));
        break;
      case 'triangles':
        {
          this.count = index.length;
          this.index = GL.createBuffer();
          if (index instanceof Uint8Array) {
            this.indexType = GL.UNSIGNED_BYTE;
          } else if (index instanceof Uint16Array) {
            this.indexType = GL.UNSIGNED_SHORT;
          } else if (index instanceof Uint32Array) {
            this.indexType = GL.UNSIGNED_INT;
          }
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
    meshView,
    projection,
    size,
    texture,
    view,
  }) {
    const {
      normalView,
      renderer: { GL },
      shader,
      type,
    } = this;

    GL.useProgram(shader.program);
    if (projection) {
      GL.uniformMatrix4fv(shader.uniform('projection'), false, projection);
    }
    if (view) {
      GL.uniformMatrix4fv(shader.uniform('view'), false, view);
    }
    if (size) {
      GL.uniform2fv(shader.uniform('size'), size);
    }
    if (texture) {
      GL.activeTexture(GL.TEXTURE0);
      GL.bindTexture(GL.TEXTURE_2D, texture);
      GL.uniform1i(shader.uniform('texture'), 0);
    }
    GL.extensions.VAO.bindVertexArrayOES(this.VAO);

    if (shader.uniform('normalView') !== null) {
      mat3.normalFromMat4(normalView, meshView);
      GL.uniformMatrix3fv(shader.uniform('normalView'), false, normalView);
    }

    if (albedo && shader.uniform('albedo') !== null) {
      GL.uniform3fv(shader.uniform('albedo'), albedo);
    }

    switch (type) {
      case 'points':
        GL.enable(GL.BLEND);
        GL.drawArrays(GL.POINTS, 0, this.count);
        GL.disable(GL.BLEND);
        break;
      case 'triangles':
        GL.drawElements(GL.TRIANGLES, this.count, this.indexType, 0);
        break;
      default:
    }

    GL.extensions.VAO.bindVertexArrayOES(null);
  }
}

export default Model;
