import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import React, { useMemo } from 'react';
import {
  CanvasTexture,
  Color,
  DoubleSide,
  PlaneBufferGeometry,
  ShaderMaterial,
} from 'three';
import glsl from 'babel-plugin-glsl/macro';
import h337 from 'heatmap.js';

interface Props {
  offsetPosition?: [number, number, number];
  mapAngle?: number;
  rect?: [number, number];
}

const Heatmap3D = (props: Props) => {
  const { offsetPosition = [0, 0, 0], mapAngle = 0, rect = [100, 100] } = props;
  const width = rect[0];
  const height = rect[1];

  const data = useMemo(() => fakeData(width, height), [width, height]);

  const texture = useMemo(() => {
    if (width === 0 || height === 0) return null;
    const container = document.createElement('div');
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    container.style.position = 'absolute';
    container.style.display = 'none';
    container.style.top = '0';
    container.style.left = '0';
    const root = document.querySelector('body');
    root?.appendChild(container);
    const heatmap = h337.create({
      container,
    });
    console.log('data', data);
    heatmap.setData(data);
    return new CanvasTexture(container.getElementsByTagName('canvas')[0]);
  }, [width, height]);

  const greyTexture = useMemo(() => {
    if (width === 0 || height === 0) return null;
    const container = document.createElement('div');
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    container.style.position = 'absolute';
    container.style.display = 'none';
    container.style.top = '0';
    container.style.left = '0';
    const root = document.querySelector('body');
    root?.appendChild(container);
    const heatmap = h337.create({
      container,
      gradient: {
        '0': 'black',
        '1.0': 'white',
      },
    });
    heatmap.setData(data);
    return new CanvasTexture(container.getElementsByTagName('canvas')[0]);
  }, [width, height]);

  const [x, y] = useMemo(() => {
    const x0 = offsetPosition[0],
      y0 = offsetPosition[1];
    const radian = degreeToRadian(mapAngle);
    const x = x0 * Math.cos(radian) + y0 * Math.sin(radian);
    const y = y0 * Math.cos(radian) - x0 * Math.sin(radian);
    return [x, y];
  }, [offsetPosition, mapAngle]);

  return (
    <mesh
      position={[x, y, 1]}
      geometry={new PlaneBufferGeometry(width, height, 200, 200)}
    >
      <heatmapMaterial
        heatmap={texture}
        greymap={greyTexture}
        side={DoubleSide}
        transparent={true}
      ></heatmapMaterial>
    </mesh>
  );
};

export default Heatmap3D;

extend({
  HeatmapMaterial: shaderMaterial(
    {
      heatmap: [],
      greymap: [],
      zscale: 20.0,
      u_color: new Color('rgb(255, 255, 255)'),
      u_opacity: 0.5,
    },
    glsl`
      varying vec2 vUv;
      uniform float zscale;
      uniform sampler2D greymap;
      void main() {
        vUv = uv;
        vec4 frgColor = texture2D(greymap, uv);
        float height = zscale * frgColor.a;
        vec3 transformed = vec3(position.x, position.y, height);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `,
    glsl`
      #ifdef GL_ES
      precision highp float;
      #endif
      varying vec2 vUv;
      uniform sampler2D heatmap;
      uniform vec3 u_color;//基础颜色
      uniform float u_opacity; // 透明度
      void main() {
        // vec4 alphaColor = texture2D(heatmap, vUv);
        // gl_FragColor = alphaColor;
        gl_FragColor = vec4(u_color, u_opacity) * texture2D(heatmap, vUv);
        // gl_FragColor = texture2D(heatmap, vUv);
      }
    `,
  ),
});

function fakeData(width: number, height: number) {
  let data = [];
  let max = 0;
  let min = 10000;
  for (let i = 0; i < 200; i++) {
    let value = Math.floor(Math.random() * 100);
    max = Math.max(max, value);
    min = Math.min(min, value);
    let point = {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
      radius: 10,
      value,
    };
    data.push(point);
  }
  return {
    data,
    max,
    min,
  };
}

const degreeToRadian = (degree: number) => {
  const radian = (Math.PI * degree) / 180;
  return radian;
};
