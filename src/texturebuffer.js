class Texturebuffer {
  constructor(renderer, width = 512, height = 512) {
    const { GL } = renderer;

    /* 2D Renderer */
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    /* Texture */
    this.texture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, this.texture);
    GL.texImage2D(
      GL.TEXTURE_2D,
      0,
      GL.RGBA,
      GL.RGBA,
      GL.FLOAT,
      this.canvas
    );

    this.renderer = renderer;
  }
  destroy() {
    const { renderer: { GL } } = this;
    GL.deleteTexture(this.texture);
  }
  update(render) {
    const { canvas, ctx, renderer: { GL } } = this;
    canvas.width = canvas.width;
    if (render) render({ ctx, height: canvas.height, width: canvas.width });
    GL.bindTexture(GL.TEXTURE_2D, this.texture);
    GL.texSubImage2D(
      GL.TEXTURE_2D,
      0,
      0,
      0,
      GL.RGBA,
      GL.FLOAT,
      canvas
    );
    GL.generateMipmap(GL.TEXTURE_2D);
  }
}

export default Texturebuffer;
