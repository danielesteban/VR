const vec3 light = vec3(-0.3, 0.9, 0.6);

float lighting(vec3 normal) {
  return max(dot(light, normalize(normal)), 0.3);
}
