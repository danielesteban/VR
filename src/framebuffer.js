class Framebuffer {
  constructor(renderer) {
    const { canvas, GL } = renderer;

    /* Frame buffer */
    this.buffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.buffer);
    this.buffer.width = canvas.width;
    this.buffer.height = canvas.height;

    /* Color texture */
    this.texture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, this.texture);
    GL.texImage2D(
      GL.TEXTURE_2D,
      0,
      GL.RGBA,
      this.buffer.width,
      this.buffer.height,
      0,
      GL.RGBA,
      GL.FLOAT,
      null
    );
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.texture, 0);

    /* Render buffer */
    this.renderbuffer = GL.createRenderbuffer();
    GL.bindRenderbuffer(GL.RENDERBUFFER, this.renderbuffer);
    GL.renderbufferStorage(
      GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, this.buffer.width, this.buffer.height
    );
    GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    GL.framebufferRenderbuffer(
      GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.renderbuffer
    );

    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    this.renderer = renderer;
  }
  destroy() {
    const { renderer: { GL } } = this;
    GL.deleteFramebuffer(this.buffer);
    GL.deleteTexture(this.texture);
    GL.deleteRenderbuffer(this.renderbuffer);
  }
}

export default Framebuffer;
