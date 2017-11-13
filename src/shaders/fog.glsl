const float LOG2 = 1.442695;
const vec3 fogColor = vec3(0, 0.094, 0.282);
const float fogDensity = 0.06;

vec3 Fog(const float dist, vec3 color) {
  float fogFactor = exp2(-fogDensity * fogDensity * dist * dist * LOG2);
  fogFactor = clamp(fogFactor, 0.0, 1.0);
  return mix(fogColor, color, fogFactor);
}
