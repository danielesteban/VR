const vec3 light = vec3(-0.2, 0.9, 0.7);

float lighting(vec3 normal) {
  return max(dot(normalize(normal), normalize(light)), 0.2);
}
