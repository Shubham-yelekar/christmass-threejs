// fireFragment.glsl
uniform float uTime;
varying vec2 vUv;

// Simple 2D noise
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +
         (c - a) * u.y * (1.0 - u.x) +
         (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv;

  // Move noise upward
  float n = noise(vec2(uv.x * 3.0, uv.y * 5.0 - uTime * 2.0));

  // Shape flame (narrow at top)
  float flame = smoothstep(0.2, 1.0, uv.y);
  flame *= smoothstep(1.0, 0.3, abs(uv.x - 0.5) * 2.0);

  float intensity = n * flame;

  vec3 color = mix(
    vec3(1.0, 0.2, 0.0), // red
    vec3(1.0, 0.9, 0.3), // yellow
    intensity
  );

  gl_FragColor = vec4(color, intensity);
}
